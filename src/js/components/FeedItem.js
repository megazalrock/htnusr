import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import Users from '../Users';
import Hatena from '../Hatena';

export default class FeedItem extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			score: 0
		};
	}

	componentDidMount(){
		//this._updateScore();
	}
	/*componentWillReceiveProps(){
		this._updateScore();
	}*/

	/*_updateScore(){
		var users = new Users();
		var hatena = new Hatena();
		hatena.getUsers(this.props.data.link)
			.then((data) => {
				return users.getScore(data);
			})
			.then((score) => {
				this.setState({
					score: score
				});
			});
	}*/

	render(){
		return(
			<div className={'feedItem view-' + this.props.viewMode}>
				<div className="footer">
					<div className="score">{this.props.data.score}</div>
					<div className="date">{this.props.data.date}</div>
					<div className="category">{this.props.data.category}</div>
				</div>
				<div className="title"><a href={this.props.data.link} target="_blank">{this.props.data.title}</a><a href={'http://b.hatena.ne.jp/entry/' + this.props.data.link.replace(/https?:\/\//, '')} target="_blank">{this.props.data.bookmarkCount}users</a></div>
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