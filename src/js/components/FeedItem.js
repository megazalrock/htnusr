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
		return Math.round( num * p ) / p ;
	}

	render(){
		return(
			<div className={'feedItem view-' + this.props.viewMode}>
				<div className="footer">
					<div className={'score ' + (this.props.data.score < 0 ? 'minus' : 'plus')}>{this.roundNum(this.props.data.score)}</div>
					<div className="date">{this.props.data.date}</div>
					<div className="category">{this.props.data.category}</div>
				</div>
				<div className="title"><a href={this.props.data.link} target="_blank">{this.props.data.title}</a><a href={'http://b.hatena.ne.jp/entry/' + (this.props.data.link.match(/^https/) ? 's/' : '') + this.props.data.link.replace(/^https?:\/\//, '')} target="_blank">{this.props.data.bookmarkCount}users</a></div>
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