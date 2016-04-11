/* global ga */
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import FeedMenu from './FeedMenu';
import FeedItem from './FeedItem';

const strage = window.localStorage;

export default class Feed extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			feed: [],
			mode: null,
			viewMode: strage.getItem('viewMode') || 'text',
			isLoading: true,
			orderby_new: strage.getItem('orderby_new') || 'default',
			orderby_hotentry: strage.getItem('orderby_hotentry') || 'default'
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

	setViewMode(mode){
		if(mode !== this.state.viewMode){
			this.setState({
				viewMode: mode
			});
			strage.setItem('viewMode', mode);
			ga && ga('send', 'event', 'Header UI', 'Change View', mode);
		}
	}

	setFeedType(mode){
		if(mode !== this.state.mode){
			this.onAjaxLoadingStart();
			this.setState({
				mode: mode
			});
			this._getRss(mode);
			strage.setItem('mode', mode);
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
		strage.setItem('orderby_' + this.props.route.mode, orderby);
		ga && ga('send', 'event', 'Header UI', 'Sort Feed', orderby);
	}

	onChangeOrderby(orderby){
		this.setSortedFeed(this.state.feed, orderby);
	}

	render(){
		var feedList = this.state.feed.map((item)=>{
			return (
				<FeedItem
					handleOnAjaxEnd={this.itemAjaxEnd.bind(this)}
					key={item.id}
					data={item}
					mode={this.state.mode}
					viewMode={this.state.viewMode}
				/>
			);
		});
		return(
			<div className="feed">
				<FeedMenu
					handleOnChangeOrderby={this.onChangeOrderby.bind(this)}
					handleSetViewMode={this.setViewMode.bind(this)}
					orderby={this.state['orderby_' + this.props.route.mode]}
					mode={this.props.route.mode}
					route={this.props.route}
					viewMode={this.state.viewMode}
				/>
				<div className={'feedList' + (this.state.isLoading ? ' loading' : '')}>
					<div className="loadingAnime"></div>
					<div className={'feedListBox view-' + (this.state.viewMode)}>
						{feedList}
					</div>
				</div>
			</div>
		);
	}
}