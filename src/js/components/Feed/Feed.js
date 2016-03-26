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
			mode: null,//this.props.route.mode,
			viewMode: strage.getItem('viewMode') || 'text',
			isLoading: true,
			orderby_new: 'default',
			orderby_hotentry: 'default'
		};
		this.feedCache = [];
		this.itemAjaxEndCount = 0;
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
		//console.log(this.props.route.mode);
		//console.log('FEEEEED');
	}

	shouldComponentUpdate(nextProp, nextState){
		return !_.isEqual(this.state.feed, nextState.feed) || this.props.route.mode !== nextProp.route.mode || this.state.isLoading !== nextState.isLoading;
	}

	componentWillReceiveProps(nextProp){
		this._getRss(nextProp.route.mode);
	}

	componentDidMount(){
		this._getRss(this.props.route.mode);
	}

	_getRss(mode){
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
			this.setSortedFeed(res, this.state['orderby_' + this.props.route.mode], {
				isLoading: false
			});
		});
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
		this.itemAjaxEndCount++;
		if(this.itemAjaxEndCount === this.state.feed.length){
			this.itemAjaxEndCount = 0;
			this.setSortedFeed(this.feedCache, this.state['orderby_' + this.props.route.mode]);
			this.feedCache = [];
		}
	}

	setSortedFeed(feed, orderby, setWith = {}){
		//console.log(_.defaults({}, orderbyObj, this.state.orderby));
		var result;
		if(_.isEmpty(this.sortedFeeds[this.props.route.mode][orderby])){
			if(orderby === 'default'){
				//RSSの順番そのまま
				result = _.sortBy(feed, 'index').reverse();
			}else if(orderby === 'score'){
				//スコア降順
				result = _.sortBy(feed, 'score').reverse();
				//return _.sortBy(feed, 'score', 'desc');
			}else if(orderby === 'date'){
				//日時降順
				result = _.sortBy(feed, 'date').reverse();
				//return _.sortBy(feed, 'score', 'desc');
			}else{
				result = feed;
			}
		}else{
			result = this.sortedFeeds[this.props.route.mode][orderby];
		}
		this.sortedFeeds[this.props.route.mode][orderby] = result;
		var newState = {
			feed: result
		};
		newState['orderby_' + this.props.route.mode] = orderby;
		newState = _.defaultsDeep(newState, setWith);
		this.setState(newState);
		console.log('setSortedFeed END', newState);
		console.log(this.state['orderby_' + this.props.route.mode]);
	}

	onChangeOrderby(orderby){
		this.setSortedFeed(this.state.feed, orderby);
	}

	render(){
		var feedList = this.state.feed.map((item, key)=>{
			return (
				<FeedItem handleOnAjaxEnd={this.itemAjaxEnd.bind(this)} key={item.id + '-' + key} data={item} mode={this.state.mode} viewMode={this.state.viewMode} />
			);
		});
		return(
			<div className="feed">
				<FeedMenu orderby={this.state['orderby_' + this.props.route.mode]} handleOnChangeOrderby={this.onChangeOrderby.bind(this)} mode={this.props.route.mode} route={this.props.route} handleSetViewMode={this.setViewMode.bind(this)} viewMode={this.state.viewMode} />
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