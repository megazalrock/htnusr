/* global ga */
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import FeedMenu from './FeedMenu';
import FeedItem from './FeedItem';
import SettingManager from '../../SettingManager.js';

export default class Feed extends React.Component{
	constructor(props){
		super(props);
		this.setting = new SettingManager();
		this.recommendFilterParam = {
			score: 15,
			bookmarkCount: 30,
			scoreBookmarkRato: 0.15
		};
		this.state = {
			feed: [],
			mode: null,
			setting: _.defaultsDeep(this.setting.get(), {
				viewMode: 'text',
				orderby_hotentry: 'default',
				orderby_new: 'default',
				filterMode: 'recommend',
				filterParams: {
					score: null,
					bookmarkCount: null,
					scoreBookmarkRato: null
				}
			}),
			isLoading: true
		};
		this.feedCache = [];
		this.sortedFeeds = {
			'new': {
				'default': [],
				'smart': [],
				'score': [],
				'date': []
			},
			'hotentry': {
				'default': [],
				'smart': [],
				'score': [],
				'date': []
			}
		};
	}

	componentWillReceiveProps(nextProp){
		this.feedCache = [];
		this._getRss(nextProp.route.mode);
	}

	componentDidMount(){
		this._getRss(this.props.route.mode);
	}

	_getRss(mode){
		if(_.isEmpty(this.sortedFeeds[mode][this.state['orderby_' + mode]])){
			this.setState({
				isLoading: true
			});
			$.ajax({
				url: 'get_feed.php',
				data:{
					type: mode 
				},
				dataType: 'json',
				cache: true,
				ifModified: true
			})
			.then((res) =>{
				this.setState({
					feed: this.sortFeeds(res, this.state['orderby_' + mode]),
					isLoading: false
				});
			});
		}else{
			this.setState({
				feed: this.sortedFeeds[mode][this.state['orderby_' + mode]],
				isLoading: false
			});
		}
	}

	setViewMode(viewMode){
		if(viewMode !== this.state.setting.viewMode){
			this.setting.save('viewMode', viewMode, () => {
				this.setState({ setting: _.defaultsDeep({viewMode : viewMode}, this.state.setting) });
			});
			ga && ga('send', 'event', 'Header UI', 'Change View', viewMode);
		}
	}

	setFeedType(mode){
		if(mode !== this.state.setting.mode){
			this.onAjaxLoadingStart();
			this._getRss(mode);
			this.setting.save('mode', mode, () => {
				this.setState({ setting: _.defaultsDeep({mode : mode}, this.state.setting) });
			});
			ga && ga('send', 'event', 'Header UI', 'Change Feed', mode);
		}
	}

	itemAjaxEnd(id, bookmarkCount, score){
		var index = _.findIndex(this.state.feed, {id: id});
		var feedItem = this.state.feed[index];
		this.feedCache.push(_.defaultsDeep(feedItem, {
			bookmarkCount: bookmarkCount,
			score: score
		}));
		if(this.feedCache.length === this.state.feed.length){
			this.setSortedFeed(this.feedCache, this.state['orderby_' + this.props.route.mode]);
			this.feedCache = [];
		}
	}

	sortFeeds(feed, orderby){
		var result;
		if(_.isEmpty(this.sortedFeeds[this.props.route.mode][orderby])){
			if(orderby === 'default'){
				//RSSの順番そのまま
				result = _.sortBy(feed, 'index').reverse();
			}else if(orderby === 'score'){
				//スコア降順
				result = _.sortBy(feed, (feedItem) => {
					return !_.isNull(feedItem.fixed_score) ? feedItem.fixed_score : -Infinity;
				}).reverse();
			}else if(orderby === 'date'){
				//日時降順
				result = _.sortBy(feed, 'date').reverse();
			}else if(orderby === 'score-bookmark'){
				//スコアブクマ比
				result = _.sortBy(feed, (feedItem) => {
					if(feedItem.bookmarkCount){
						let bookmarkCount = feedItem.bookmarkCount || 0;
						let score = feedItem.fixed_score || 1;
						return (score / bookmarkCount);
					}else{
						return -Infinity;
					}
				}).reverse();
			}else if(orderby === 'smart'){
				//Redditライク
				result = _.sortBy(feed, (feedItem) => {
					if(feedItem.bookmarkCount){
						let bookmarkCount = feedItem.bookmarkCount || 0;
						let score = feedItem.fixed_score;
						let bsretio = score / bookmarkCount;
						let seconds = feedItem.date;
						let order = Math.log10(Math.max(Math.abs(score), 1));
						let sign = score < 0 ? -1 : score > 0 ? 1 : 0;
						if(sign < 0){
							sign = sign * 10;
						}
						let num = sign * order + (seconds / (60 * 60 * 6)) + bsretio;
						return num;
					}else{
						return -Infinity;
					}
				}).reverse();

			}else{
				result = feed;
			}
		}else{
			result = this.sortedFeeds[this.props.route.mode][orderby];
		}
		return result;
	}

	setSortedFeed(feed, orderby, setWith = {}){
		var result = this.sortFeeds(feed, orderby);
		this.sortedFeeds[this.props.route.mode][orderby] = result;
		var newState = {
			feed: result
		};
		newState['orderby_' + this.props.route.mode] = orderby;
		newState = _.defaultsDeep(newState, setWith);
		this.setState(newState);
		this.setting.save('orderby_' + this.props.route.mode, orderby);
		ga && ga('send', 'event', 'Header UI', 'Sort Feed', orderby);
	}

	onChangeOrderby(orderby){
		this.setSortedFeed(this.state.feed, orderby);
	}

	onChangeFilterMode(filterMode){
		this.setting.save('filterMode', filterMode, () => {
			this.setState({ setting: _.defaultsDeep({filterMode : filterMode}, this.state.setting) });
		});
	}

	onChangeFilterParams(filterParams){
		this.setting.save('filterParams', filterParams, () => {
			this.setState({ setting: _.defaultsDeep({filterParams: filterParams}, this.state.setting) });
		});
	}

	filterFeed(feed){
		var filterFunction = (() => {
			var result;
			if(this.state.filterMode === 'recommend'){
				result = (item) => {
					if(
						(item.bookmarkCount > this.recommendFilterParam.bookmarkCount && item.fixed_score / item.bookmarkCount < this.recommendFilterParam.scoreBookmarkRato) ||
						(item.fixed_score < this.recommendFilterParam.score)
					){
						return false;
					}else{
						return true;
					}
				};
			}else if(this.state.filterMode === 'user'){
				let bookmarkCount = (_.isNumber(this.state.filterParams.bookmarkCount)) ? this.state.filterParams.bookmarkCount : -Infinity;
				let score = (_.isNumber(this.state.filterParams.score )) ? this.state.filterParams.score : -Infinity;
				let scoreBookmarkRato = (_.isNumber(this.state.filterParams.scoreBookmarkRato)) ? this.state.filterParams.scoreBookmarkRato : -Infinity;
				result = (item) => {
					if(
						(item.bookmarkCount < bookmarkCount) ||
						(item.fixed_score < score) ||
						((item.fixed_score / item.bookmarkCount) < scoreBookmarkRato)
					){
						return false;
					}else{
						return true;
					}
				};
			}else{
				result = false;
			}
			return result;
		})();

		if(_.isFunction(filterFunction)){
			var result = _.filter(feed, filterFunction);
			if(!result){
				result = [];
			}
			return result;
		}else{
			return feed;
		}
	}

	render(){
		var filterdFeed = this.filterFeed(this.state.feed);
		if(!_.isArray(filterdFeed)){
			return null;
		}
		var feedList = filterdFeed.map((item)=>{
			return (
				<FeedItem
					handleOnAjaxEnd={this.itemAjaxEnd.bind(this)}
					key={item.id}
					data={item}
					mode={this.state.setting.mode}
					viewMode={this.state.setting.viewMode}
				/>
			);
		});
		return(
			<div className="feed">
				<FeedMenu
					handleOnChangeOrderby={this.onChangeOrderby.bind(this)}
					handleSetViewMode={this.setViewMode.bind(this)}
					mode={this.props.route.mode}
					route={this.props.route}
					orderby={this.state.setting['orderby_' + this.props.route.mode]}
					setting={this.state.setting}
					handleOnChangeFilterMode={this.onChangeFilterMode.bind(this)}
					handleOnChangeFilterParams={this.onChangeFilterParams.bind(this)}
				/>
				<div className={'feedList' + (this.state.isLoading ? ' loading' : '')}>
					<div className="loadingAnime"></div>
					<div className={'feedListBox view-' + (this.state.setting.viewMode)}>
						{feedList}
					</div>
				</div>
			</div>
		);
	}
}