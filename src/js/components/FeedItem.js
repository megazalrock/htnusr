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
		this.users = new Users();
	}

	componentWillUnmount(){
		this.users.abort();
	}

	componentDidMount(){
		if(_.isNull(this.state.bookmarkCount) || _.isNull(this.state.score)){
			this.users.getUsers(this.props.data.link)
				.then((data) => {
					this.props.onAddUser(data.users);
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
		var scoreColor;
		var scoreSaturation = Math.abs(this.state.score);
		var s = 0;
		if(100 < scoreSaturation){
			scoreSaturation = 100;
		}
		var easing = (t, b, c, d) =>{
			return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
		};

		if(this.state.score < 0){ //minus
			s = easing(scoreSaturation, 0, 1, 100);
			s *= 100;
			s = (50 < s) ? 50 : s;
			s = this._roundNum(s, 0);
			scoreColor = 'hsl(0, ' + s + '%, 50%)';
		}else if(0 < this.state.score){ //plus
			s = easing(scoreSaturation, 0, 1, 1000);
			s *= 100;
			s = this._roundNum(s, 0);
			//console.log(s);
			scoreColor = 'hsl(100, ' + s + '%, 50%)';
		}else{
			scoreColor = 'hsl(100, 0%, 50%)';
		}
		var scoreStyle = {
			background: scoreColor
		};
		return(
			<div className={'feedItem view-' + this.props.viewMode}>
				<div className="footer">
					<div style={scoreStyle} className="score">{this.state.score || 'loading'}</div>
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