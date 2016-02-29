import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import Xml2js from 'xml2js';
import FeedItem from './FeedItem';
import Users from '../Users';
import Hatena from '../Hatena';

export default class Feed extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			feed: [],
			mode: 'hotentry',
			viewMode: 'text'
		};
		this.cache = {
			experiod: Date.now(),
			hotentry: [],
			new: []
		};
	}

	componentDidMount(){
		this._getRss(this.state.mode);
	}

	_getRss(mode){
		if(this.cache.experiod < (Date.now() - 1000 * 60 * 1) || !this.cache[mode].length){
			var url = this.props.rssUrls[mode];
			var parseString = Xml2js.parseString;
			$.ajax({
				url: 'rssbypass.php',
				data:{
					url: encodeURIComponent(url)
				},
				dataType: 'text'
			})
			.then((res) => {
				//$('#debug').html(res);
				parseString(res, (error, result) => {
					var promises = [];
					_.forEach(result['rdf:RDF'].item, (item) => {
						var users = new Users();
						var hatena = new Hatena();
						var deferred = $.Deferred();
						hatena.getUsers(item.link[0])
							.then((data) => {
								users.addUsers(data);
								return users.getScore(data);
							})
							.then((score) => {
								var _item = {
									'title' : openArray(item.title),
									'link' : openArray(item.link),
									'description' : openArray(item.description),
									'html' : openArray(item['content:encoded']),
									'bookmarkCount' : openArray(item['hatena:bookmarkcount']),
									'date' : openArray(item['dc:date']),
									'category' : openArray(item['dc:subject']),
									'score': score
								};
								deferred.resolve(_item);
							});
						promises.push(deferred.promise());
					});
					$.when(...promises)
						.then((...items) => {
							this.setState({
								feed: items
							});
							this.cache.experiod = Date.now();
							this.cache[mode] = items;
						});
				});
			});
		}else{
			this.setState({
				feed: this.cache[mode]
			});
		}
		

		function openArray(array) {
			if(_.isArray(array) && array.length === 1){
				return array[0];
			}else{
				return array;
			}
		}
	}

	setViewMode(mode){
		if(mode !== this.state.viewMode){
			this.setState({
				viewMode: mode
			});
		}
	}

	setFeedType(mode){
		if(mode !== this.state.mode){	
			this.setState({
				mode: mode
			});
			this._getRss(mode);
		}
	}

	render(){
		var feedList = this.state.feed.map((item, i)=>{
			return (
				<FeedItem key={i} data={item} viewMode={this.state.viewMode} />
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
				<div className="feedList">
					{feedList}
				</div>
			</div>
		);
	}
}