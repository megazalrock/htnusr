import _ from 'lodash';
import React from 'react';
import FeedItemBookmarkComments from './FeedItemBookmarkComments.js';
export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
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
		var scoreSaturation = Math.abs(this.props.data.score);
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

		if(this.props.data.score < 0){ //minus
			s = cubeIn(scoreSaturation, 0, 0.5, 10);
			s *= 100;
			s = this._roundNum(s, 0);
			if(50 < s){
				s = 50;
			}
			scoreColor = 'hsl(0, ' + s + '%, 50%)';
		}else if(0 < this.props.data.score){ //plus
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
			if(entryImageSrc && this.props.viewMode === 'image'){
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
		var scoreString = (() => {
			if(_.isNull(this.props.data.score)){
				return (
					<div style={scoreStyle} className="score">no data</div>
				);
			}else{
				return (
					<div style={scoreStyle} className="score">{this._roundNum(this.props.data.score).toFixed(2)}</div>
				);
			}
		})();

		var bookmarkCountString = (() => {
			if(_.isNull(this.props.data.bookmarkCount)){
				return (
					<a href={bookmarkUrl} target="_blank" className='bookmarkCount'><span className="usersText">no data</span></a>
				);
			}else{
				return (
					<a href={bookmarkUrl} target="_blank" className='bookmarkCount'><span className="count">{this.props.data.bookmarkCount}</span><span className="usersText">users</span></a>
				);
			}
		})();

		return(
			<div className="feedItem">
				<div className="footer">
					{scoreString}
					{bookmarkCountString}
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
				<FeedItemBookmarkComments link={this.props.data.link} users={this.users} />
			</div>
		);
	}
}