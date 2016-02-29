import React from 'react';

export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			score: 0
		};
	}

	roundNum(num, dig = 2){
		var p = Math.pow( 10 , dig );
		return Math.floor( num * p ) / p ;
	}

	render(){
		var date = new Date(this.props.data.date);
		var bookmarkUrl = 'http://b.hatena.ne.jp/entry/' + (this.props.data.link.match(/^https/) ? 's/' : '') + this.props.data.link.replace(/^https?:\/\//, '');
		return(
			<div className={'feedItem view-' + this.props.viewMode}>
				<div className="footer">
					<div className={'score ' + (this.props.data.score < 0 ? 'minus' : 'plus')}>{this.roundNum(this.props.data.score).toFixed(2)}</div>
					<a href={bookmarkUrl} target="_blank" className='bookmarkCount'><span className="count">{this.props.data.bookmarkCount}</span><span className="usersText">users</span></a>
					<time className="date" dateTime={this.props.data.date}>{date.toLocaleString()}</time>
					<div className="category">{this.props.data.category}</div>
				</div>
				<div className="title"><a href={this.props.data.link} target="_blank">{this.props.data.title}</a></div>
				<div className="text">
					<div className="description">
						{this.props.data.description}
					</div>
				</div>
				<div className="html" dangerouslySetInnerHTML={{__html:this.props.data.html}}></div>
			</div>
		);
	}
}