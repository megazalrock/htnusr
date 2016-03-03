/* global ga */
import $ from 'jquery';
import React from 'react';
import FeedItem from './FeedItem';
import Users from '../Users';

const strage = window.localStorage;

export default class Feed extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			feed: [],
			mode: strage.getItem('mode') || 'hotentry',
			viewMode: strage.getItem('viewMode') ||'text',
			isLoading: false
		};
		this.cache = {
			experiod: Date.now(),
			hotentry: [],
			new: []
		};
		this.handleAddUserCount = 0;
		this.users = [];
	}
	componentDidMount(){
		this._getRss(this.state.mode);
	}

	_getRss(mode){
		this.setState({
			isLoading: true
		});
		if(this.cache.experiod < (Date.now() - 1000 * 60 * 1) || !this.cache[mode].length){
			$.ajax({
				url: 'get_feed.php',
				data:{
					type: mode 
				},
				dataType: 'json'
			})
			.then((res) =>{	
				this.setState({
					feed: res
				});
				this.cache.experiod = Date.now();
				this.cache[mode] = res;
				this.setState({
					isLoading: false
				});
			});
		}else{
			this.setState({
				feed: this.cache[mode],
				isLoading: false
			});
		}
	}

	handleAddUser(user_list){
		this.users = this.users.concat(user_list).filter((value, index, self) =>{
			return self.indexOf(value) === index;
		});
		this.handleAddUserCount += 1;
		if(this.handleAddUserCount === this.state.feed.length - 1){
			var users = new Users();
			users.addUsers(this.users);
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
			this.setState({
				mode: mode
			});
			this._getRss(mode);
			strage.setItem('mode', mode);
			ga && ga('send', 'event', 'Header UI', 'Change Feed', mode);
			this.handleAddUserCount = 0;
		}
	}

	render(){
		var feedList = this.state.feed.map((item)=>{
			return (
				<FeedItem key={item.id} data={item} mode={this.state.mode} viewMode={this.state.viewMode} onAddUser={this.handleAddUser.bind(this)} />
			);
		});
		return(
			<div className="app">
				<div className="ui">
					<div className="feedType btnBox">
						<div className={'hotentry btn' + (this.state.mode === 'hotentry' ? ' selected' : '')} onClick={this.setFeedType.bind(this, 'hotentry')}>人気</div>
						<div className={'new btn' + (this.state.mode === 'new' ? ' selected' : '')} onClick={this.setFeedType.bind(this, 'new')}>新着</div>
					</div>
					<div className="viewMode btnBox">
						<div className={'title btn' + (this.state.viewMode === 'title' ? ' selected' : '')} onClick={this.setViewMode.bind(this, 'title')}>タイトルのみ</div>
						<div className={'text btn' + (this.state.viewMode === 'text' ? ' selected' : '')} onClick={this.setViewMode.bind(this, 'text')}>簡易表示</div>
						<div className={'html btn' + (this.state.viewMode === 'html' ? ' selected' : '')} onClick={this.setViewMode.bind(this, 'html')}>HTML表示</div>
					</div>
				</div>
				<div className={'feedList' + (this.state.isLoading ? ' loading' : '')}>
					{feedList}
					<div className="loadingAnime"></div>
				</div>
			</div>
		);
	}
}