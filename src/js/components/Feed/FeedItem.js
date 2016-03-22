import _ from 'lodash';
import React from 'react';
import Users from '../../Users';
import StorageCache from '../../StorageCache';
import FeedItemBookmarkComments from './FeedItemBookmarkComments.js';
export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			bookmarkCount: null,
			score: null
		};
		this.users = new Users();
	}
	
	componentWillUnmount(){
		this.users.abort();
	}

	componentDidMount(){
		if(_.isNull(this.state.bookmarkCount) || _.isNull(this.state.score)){
			var lifeTime = (this.props.mode === 'hotentry' ? 60 * 60 : 60 * 5);
			var storageCache = new StorageCache();
			var cache = storageCache.loadItem(this.props.data.id);
			var now = storageCache.getNow();
			if(!cache || cache.cacheExpires < now){
				this.users.getUsers(this.props.data.link)
					.then((data) => {
						this.setState({
							bookmarkCount: data.bookmarkCount,
							bookmarkComments: data.data.bookmarks,
							eid: data.data.eid
						});
						return this.users.getScore(data, this.props.mode);
					})
					.then((score) => {
						this.setState({score: score});
						storageCache.saveItem(this.props.data.id, {
							bookmarkCount: this.state.bookmarkCount,
							score: score,
							expires:  now + lifeTime
						});
					})
					.fail((...args) => {
						console.log(args);
					});
			}else{
				this.setState({
					bookmarkCount: cache.bookmarkCount,
					score: cache.score
				});
			}			
		}
	}

	_roundNum(num, dig = 2){
		var p = Math.pow( 10 , dig );
		return Math.floor( num * p ) / p ;
	}
	_zeroPadding(n, l){
		return (Array(l).join('0') + n).slice(-l);
	}

	render(){
		var bookmarkUrl = 'http://b.hatena.ne.jp/entry/' + (this.props.data.link.match(/^https/) ? 's/' : '') + this.props.data.link.replace(/^https?:\/\//, '');
		var scoreColor;
		var scoreSaturation = Math.abs(this.state.score);
		var s = 0;
		if(100 < scoreSaturation){
			scoreSaturation = 100;
		}
		/*var expoOut = (t, b, c, d) => {
			return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
		};
		var expoIn = (t, b, c, d) => {
			return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
		};*/
		var linear = (t, b, c, d) => {
			return c*t/d + b;
		};

		var cubeIn = (t, b, c, d) => {
			t /= d;
			return c*t*t*t + b;
		};

		if(this.state.score < 0){ //minus
			s = cubeIn(scoreSaturation, 0, 0.5, 10);
			s *= 100;
			s = this._roundNum(s, 0);
			if(50 < s){
				s = 50;
			}
			scoreColor = 'hsl(0, ' + s + '%, 50%)';
		}else if(0 < this.state.score){ //plus
			s = linear(scoreSaturation, 0, 0.4, 100);
			s *= 100;
			s = this._roundNum(s, 0);
			scoreColor = 'hsl(100, ' + s + '%, 50%)';
		}else{
			scoreColor = 'hsl(100, 0%, 50%)';
		}
		var scoreStyle = {
			background: scoreColor
		};

		var siteImgUrl = (() => {
			var a = document.createElement('a');
			a.href = this.props.data.link;
			return 'http://cdn-ak.favicon.st-hatena.com/?url=' + encodeURIComponent(a.protocol + '//' + a.hostname);
		})();

		var entryImage = (() => {
			var entryImageSrc = this.props.data.html['entry-image'];
			if(entryImageSrc){
				return (<img src={entryImageSrc} className="entryImage" alt=""/>);
			}
		})();

		var dateString = (() => {
			var date = new Date(this.props.data.date * 1000);
			return _.template('${y}/${m}/${d} ${h}:${i}:${s}')({
				y: date.getFullYear(),
				m: (date.getMonth() + 1),
				d: date.getDate(),
				h: this._zeroPadding(date.getHours(), 2),
				i: this._zeroPadding(date.getMinutes(), 2),
				s: this._zeroPadding(date.getSeconds(), 2)
			});
		})();

		return(
			<div className="feedItem">
				<div className="footer">
					<div style={scoreStyle} className="score">{this._roundNum(this.state.score).toFixed(2) || 'loading'}</div>
					<a href={bookmarkUrl} target="_blank" className='bookmarkCount'><span className="count">{this.state.bookmarkCount}</span><span className="usersText">users</span></a>
					<time className="date" dateTime={this.props.data.date}>{dateString}</time>
					<div className="category">{this.props.data.category}</div>
				</div>
				<div className="title"><a href={this.props.data.link} target="_blank"><img src={siteImgUrl} className="favicon" width="16" height="16" />{this.props.data.title}</a></div>
				<div className="text">
					{entryImage}
					<div className="description">
						{this.props.data.description}
					</div>
				</div>
				<FeedItemBookmarkComments link={this.props.data.link} users={this.users} bookmarkComments={this.state.bookmarkComments}/>
			</div>
		);
	}
}