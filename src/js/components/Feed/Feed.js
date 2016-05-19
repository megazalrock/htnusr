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
				filterMode: {
					new: 'none',
					hotentry: 'none'
				},
				filterParams: {
					new: {
						isBookmarkCountEnable: false,
						isScoreEnable: false,
						isScoreBookmarkRatoEnable: false,
						score: null,
						bookmarkCount: null,
						scoreBookmarkRato: null
					},
					hotentry: {
						isBookmarkCountEnable: false,
						isScoreEnable: false,
						isScoreBookmarkRatoEnable: false,
						score: null,
						bookmarkCount: null,
						scoreBookmarkRato: null
					}
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
		var orderby = this.state.setting['orderby_' + mode];
		if(_.isEmpty(this.sortedFeeds[mode][orderby])){
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
					feed: this.sortFeeds(res, orderby),
					isLoading: false
				});
			});
		}else{
			this.setState({
				feed: this.sortedFeeds[mode][orderby],
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
			this.setSortedFeed(this.feedCache, this.state.setting['orderby_' + this.props.route.mode]);
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

	setSortedFeed(feed, orderby){
		var result = this.sortFeeds(feed, orderby);
		this.sortedFeeds[this.props.route.mode][orderby] = result;
		this.setState({
			feed: result
		});
	}

	onChangeOrderby(orderby){
		this.setSortedFeed(this.state.feed, orderby);
		this.setting.save('orderby_' + this.props.route.mode, orderby, () => {
			var _obj = {};
			_obj['orderby_' + this.props.route.mode] = orderby;
			this.setState({ setting: _.defaultsDeep(_obj, this.state.setting) });
		});
		ga && ga('send', 'event', 'Header UI', 'Sort Feed', orderby);
	}

	onChangeFilterMode(filterMode){
		var _obj = {};
		_obj[this.props.route.mode] = filterMode;
		_obj = _.defaultsDeep(_obj, this.state.setting.filterMode);
		this.setting.save('filterMode', _obj, () => {
			this.setState({ setting: _.defaultsDeep({filterMode : _obj}, this.state.setting) });
		});
	}

	onChangeFilterParams(filterParams){
		var _obj = {};
		_obj[this.props.route.mode] = filterParams;
		_obj = _.defaultsDeep(_obj, this.state.setting.filterParams);
		this.setting.save('filterParams', _obj, () => {
			this.setState({ setting: _.defaultsDeep({filterParams: _obj}, this.state.setting) });
		});
	}

	filterFeed(feed){
		var filterFunction = (() => {
			var filterer = false;
			if(this.state.setting.filterMode[this.props.route.mode] === 'recommend'){
				let mean = _.meanBy(feed, 'fixed_score');
				let standardDeviation = 0;
				_.forEach(feed, (item) => {
					standardDeviation += Math.pow((item.fixed_score - mean), 2);
				});
				standardDeviation = Math.sqrt(standardDeviation / feed.length);
				if(this.props.route.mode === 'new'){
					filterer = (item) => {
						var tScore = ((item.fixed_score - mean) / standardDeviation) * 10 + 50;
						return 50 <= tScore && 0.5 <= (item.fixed_score / item.bookmarkCount);
					};
				}else if(this.props.route.mode === 'hotentry'){
					filterer = (item) => {
						var tScore = ((item.fixed_score - mean) / standardDeviation) * 10 + 50;
						return 40 <= tScore;
					};
				}
				
			}else if(this.state.setting.filterMode[this.props.route.mode] === 'user'){
				let bookmarkCount = this.state.setting.filterParams[this.props.route.mode].bookmarkCount;
				let score = this.state.setting.filterParams[this.props.route.mode].score;
				let scoreBookmarkRato = this.state.setting.filterParams[this.props.route.mode].scoreBookmarkRato;

				let isBookmarkCountEnable = this.state.setting.filterParams[this.props.route.mode].isBookmarkCountEnable;
				let isScoreEnable = this.state.setting.filterParams[this.props.route.mode].isScoreEnable;
				let isScoreBookmarkRatoEnable = this.state.setting.filterParams[this.props.route.mode].isScoreBookmarkRatoEnable;

				bookmarkCount = _.isNumber(bookmarkCount) ? bookmarkCount : -Infinity;
				score = _.isNumber(score) ? score : -Infinity;
				scoreBookmarkRato = _.isNumber(scoreBookmarkRato) ? scoreBookmarkRato: -Infinity;

				filterer = (item) => {
					var hideCondition = false;
					if(isBookmarkCountEnable){
						hideCondition = hideCondition || (item.bookmarkCount < bookmarkCount);
					}
					if(isScoreEnable){
						hideCondition = hideCondition || (item.fixed_score < score);
					}
					if(isScoreBookmarkRatoEnable){
						hideCondition = hideCondition || ((item.fixed_score / item.bookmarkCount) < scoreBookmarkRato);
					}
					return !hideCondition;
				};
			}
			return filterer;
		})();

		if(_.isFunction(filterFunction) && !_.isEmpty(feed)){
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
		var filterdFeed;
		if(_.isArray(this.state.feed) && !_.isEmpty(this.state.feed) && this.state.setting.filterMode[this.props.route.mode] !== 'none'){
			filterdFeed = this.filterFeed(this.state.feed);
			if(!_.isArray(filterdFeed)){
				filterdFeed = this.state.feed;
			}
		}else{
			filterdFeed = this.state.feed;
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