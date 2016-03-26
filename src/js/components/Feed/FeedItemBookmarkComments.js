/* global ga */
import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';

export default class FeedItemBookmarkComments extends React.Component{
	constructor(props){
		super(props);
		this.bookmarkCommentsBtnTexts = {
			show: 'ブックマークコメントを表示',
			hide: 'ブックマークコメントを非表示',
			loading: 'loading...'
		};
		this.state = {
			isCommentsOpen: false,
			bookmarkComments: [],
			bookmarkCommentsHtml: null,
			eid: null,
			bookmarkCommentsBtnText: this.bookmarkCommentsBtnTexts['show']
		};
		this.$window = null;
		this.$body = null;
		this.$feedItem = null;
		this.$comment = null;
		this.isCommentsOpen = false;
	}

	componentDidMount(){
	}

	handleOnClickShowBookmarkCommentBtn(){
		this.isCommentsOpen = !this.isCommentsOpen;
		this.setState({
			'isCommentsOpen' : this.isCommentsOpen
		});

		ga && ga('send', 'event', 'Feet Item', (this.isCommentsOpen ? 'Open' : 'Close') + ' Comment List', this.props.link);

		var toggleCommentBox = () => {
			var $window = this.$window = this.$window || $(window);
			var $body = this.$body = this.$body || $('body, html');
			var $comments = this.$comments = this.$comments || $(ReactDom.findDOMNode(this)).find('.comments');
			var $feedItem = this.$feedItem = this.$feedItem || $comments.parent().parent();
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
			this.props.users.getUsers(this.props.link)
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
	}

	_zeroPadding(n, l){
		return (Array(l).join('0') + n).slice(-l);
	}

	render(){
		return (
			<div className="bookmarkComments">
				<div className={'showBookmarkCommentsBtn' + (this.state.isCommentsOpen ? ' selected' : '')} onClick={this.handleOnClickShowBookmarkCommentBtn.bind(this)}>{this.state.bookmarkCommentsBtnText}</div>
				<div className={'comments' + (this.state.isCommentsOpen ? ' open' : '')}>{this.state.bookmarkCommentsHtml}</div>
			</div>
		);
	}
}