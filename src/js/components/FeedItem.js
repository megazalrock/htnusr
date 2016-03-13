import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import Users from '../Users';
import StorageCache from '../StorageCache';
export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
		this.bookmarkCommentsBtnTexts = {
			show: 'ブックマークコメントを表示',
			hide: 'ブックマークコメントを非表示',
			loading: 'loading...'
		};
		this.state = {
			bookmarkCount: null,
			score: null,
			isCommentsOpen: false,
			bookmarkComments: [],
			bookmarkCommentsHtml: null,
			eid: null,
			bookmarkCommentsBtnText: this.bookmarkCommentsBtnTexts['show']
		};
		this.users = new Users();
		this.$window = null;
		this.$body = null;
		this.$feedItem = null;
		this.$comment = null;
		this.$wrapper = null;
		this.isCommentsOpen = false;
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
						this.setState({score: this._roundNum(score).toFixed(2)});
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
					score: this._roundNum(cache.score).toFixed(2)
				});
			}			
		}
	}

	handleOnClickShowBookmarkCommentBtn(){
		this.isCommentsOpen = !this.isCommentsOpen;
		this.setState({
			'isCommentsOpen' : this.isCommentsOpen
		});

		var toggleCommentBox = () => {
			var $window = this.$window = this.$window || $(window);
			var $body = this.$body = this.$body || $('body, html');
			var $feedItem = this.$feedItem = this.$feedItem || $(ReactDom.findDOMNode(this));
			var $comments = this.$comments = this.$comments || $feedItem.find('.bookmarkComments .comments');
			var top = $feedItem.offset().top;
			var duration = 500;
			if(this.isCommentsOpen){
				$feedItem.data('top', top);
				$body
					.animate({
						scrollTop: top
					},{
						duration: duration
					});
				$comments.css({
					maxHeight:  $window.height() - $feedItem.outerHeight(true),
					height: 300
				});
				this.setState({
					bookmarkCommentsBtnText: this.bookmarkCommentsBtnTexts['hide']
				});
			}else{
				$comments.css({
					height: 0
				});
				this.setState({
					bookmarkCommentsBtnText: this.bookmarkCommentsBtnTexts['show']
				});
			}
		};

		var setBookmarkCommentHtml = () => {
			var html = '';
			if(this.state.bookmarkComments && this.state.bookmarkComments.length){
				html = this.state.bookmarkComments.map((comment, key) => {
					if(comment.comment.length){
						key = this.state.eid + '-' + key;
						var bhatena = 'http://b.hatena.ne.jp';
						var userImage = ['http://cdn1.www.st-hatena.com/users', comment.user.slice(0, 2),comment.user, 'profile_l.gif'].join('/');
						var date = new Date(comment.timestamp);
						var commentDate = [date.getFullYear(), this._zeroPadding(date.getMonth() + 1, 2), this._zeroPadding(date.getDate(), 2)].join('');
						var tags = comment.tags.map((tag, key) => {
							var encodedTag = encodeURIComponent(tag);
							return (
								<a className="tag" key={key} href={[bhatena, comment.user, encodedTag].join('/')}>{tag}</a>
							);
						});
						var commentLink = [bhatena, comment.user, ''].join('/') + commentDate + '#bookmark-' + commentDate;
						return (
							<div key={key} className="comment">
								<a target="_blank" className="profileIcon" href={[bhatena, comment.user, ''].join('/')}><img src={userImage} alt={comment.user} title={comment.user} width="24" height="24" /></a>
								<div className="commentBox">
									<a target="_blank" className="name" href={commentLink}>{comment.user}</a>
									<span className="commentBody">{comment.comment}</span>
									<span className="tags">{tags}</span>
								</div>
								<div className="info">
									<a target="_blank" href={[bhatena, 'entry', this.state.eid, 'comment', comment.user].join('/')} className="permalink" title="パーマリンク">リンク</a>
									<a target="_blank" href={commentLink} className="timestamp">{comment.timestamp}</a>
								</div>
							</div>
						);
					}
				});
			}
			if(!(html && _.compact(html).length)){
				html = (<div className="noComment">コメントはありません</div>);
			}
			this.setState({
				'bookmarkCommentsHtml': html
			});
		};

		if(!this.state.bookmarkComments || !this.state.bookmarkComments.length){
			this.setState({
				bookmarkCommentsBtnText: this.bookmarkCommentsBtnTexts['loading']
			});
			this.users.getUsers(this.props.data.link)
				.then((data) => {
					this.setState({
						bookmarkComments: data.data.bookmarks,
						eid: data.data.eid
					});
					setBookmarkCommentHtml();
					toggleCommentBox();
				});
		}else{
			if(_.isNull(this.state.bookmarkCommentsHtml)){	
				setBookmarkCommentHtml();
			}
			toggleCommentBox();
		}

		
		



		/*console.log(reactid.replace(/\.\d+\.\d+$/, ''));
		this.$feedList*/
		//this.$comment = $(ReactDom.findDOMNode(this)).find('[data-reactid="' + reactid + '"]').parent();

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
			var entryImageSrc = this.props.data.html.match(/"(http:\/\/cdn-ak\.b\.st-hatena\.com\/entryimage\/.*?)"/);
			if(entryImageSrc){
				return (<img src={entryImageSrc[1]} className="entryImage" alt=""/>);
			}
		})();

		var dateString = (() => {
			var date = new Date(this.props.data.date * 1000);
			return _.template('${y}/${m}/${d} ${h}:${i}:${s}')({
				y: date.getFullYear(),
				m: (date.getMonth() + 1),
				d: date.getDay(),
				h: this._zeroPadding(date.getHours(), 2),
				i: this._zeroPadding(date.getMinutes(), 2),
				s: this._zeroPadding(date.getSeconds(), 2)
			});
		})();

		return(
			<div className="feedItem">
				<div className="footer">
					<div style={scoreStyle} className="score">{this.state.score || 'loading'}</div>
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
				<div className="bookmarkComments">
					<div className={'showBookmarkCommentsBtn' + (this.state.isCommentsOpen ? ' selected' : '')} onClick={this.handleOnClickShowBookmarkCommentBtn.bind(this)}>{this.state.bookmarkCommentsBtnText}</div>
					<div className={'comments' + (this.state.isCommentsOpen ? ' open' : '')}>{this.state.bookmarkCommentsHtml}</div>
				</div>
			</div>
		);
	}
}