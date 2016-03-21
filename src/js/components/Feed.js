/* global ga */
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import MainMenu from './MainMenu';
import FeedItem from './FeedItem';
import Users from '../Users';

const strage = window.localStorage;

export default class Feed extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			feed: [],
			mode: this.props.route.path === 'new' ? 'new' : 'hotentry',
			viewMode: strage.getItem('viewMode') || 'text',
			isLoading: true
		};
		this.handleGetHatebEndCount = 0;
		this.hatebs = [];
	}
	componentDidMount(){
		this._getRss(this.state.mode);
	}

	_getRss(mode){
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
				feed: res,
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

	render(){
		var feedList = this.state.feed.map((item, key)=>{
			return (
				<FeedItem key={item.id + '-' + key} data={item} mode={this.state.mode} viewMode={this.state.viewMode} />
			);
		});
		return(
			<div className="app">
				<MainMenu route={this.props.route} handleSetViewMode={this.setViewMode.bind(this)} viewMode={this.state.viewMode} />
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