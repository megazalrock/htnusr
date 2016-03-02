import _ from 'lodash';
import React from 'react';
import Users from '../Users';

export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			bookmarkCount: null,
			score: null
		};
		this.users = new Users(this.props.device);
	}

	componentWillUnmount(){
		this.users.abort();
	}

	componentDidMount(){
		if(_.isNull(this.state.bookmarkCount) || _.isNull(this.state.score)){	
			this.users.getUsers(this.props.data.link)
				.then((data) => {
					//if(this.props.mode === 'hotentry'){
					this.users.addUsers(data);
					//}
					this.setState({bookmarkCount: data.bookmarkCount});
					return this.users.getScore(data);
				})
				.then((score) => {
					this.setState({score: this._roundNum(score).toFixed(2)});
				})
				.fail((...args) => {
					console.log(args);
				});
		}
	}

	_roundNum(num, dig = 2){
		var p = Math.pow( 10 , dig );
		return Math.floor( num * p ) / p ;
	}

	render(){
		var date = new Date(this.props.data.date * 1000);
		var bookmarkUrl = 'http://b.hatena.ne.jp/entry/' + (this.props.data.link.match(/^https/) ? 's/' : '') + this.props.data.link.replace(/^https?:\/\//, '');
		return(
			<div className={'feedItem view-' + this.props.viewMode}>
				<div className="footer">
					<div className={'score ' + (this.state.score < 0 ? 'minus' : this.state.score > 0 ? 'plus' : 'zero')}>{this.state.score}</div>
					<a href={bookmarkUrl} target="_blank" className='bookmarkCount'><span className="count">{this.state.bookmarkCount}</span><span className="usersText">users</span></a>
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