import _ from 'lodash';
import React from 'react';
import Users from '../../Users';
export default class ScoreViewr extends React.Component{
	constructor(props){
		super(props);
		this.buttonLabels = {
			loading: 'loading...',
			get: 'スコアを取得'
		};
		this.state = {
			results : [],
			url: null,
			buttonLabel: this.buttonLabels['get']
		};
		this.users = new Users();
	}

	handleSubmit(e){
		if(
			((e.type === 'keyup' && e.keyCode === 13) || e.type === 'click') &&
			_.isString(this.refs.inputUrl.value) && this.refs.inputUrl.value.length
		){
			this._getScore(this.refs.inputUrl.value);
		}
	}

	_getScore(url){
		var result = {};
		if(!url.match(/https?:\/\//)){
			url = 'http://' + url;
		}
		var a = document.createElement('a');
		a.href = url;
		url = a.protocol + '//' + a.hostname + a.pathname;
		this.setState({
			buttonLabel: this.buttonLabels['loading']
		});
		this.users.getUsers(url)
			.then((data) => {
				result.bookmarkCount = data.bookmarkCount;
				result.title = data.data.title;
				result.entryUrl = data.data.entry_url;
				result.url = data.data.url;
				return this.users.getScore(data, null);
			})
			.then((score) => {
				result.score = score;
				this.setState({
					results: this.state.results.concat(result)
				});
				this.setState({
					buttonLabel: this.buttonLabels['get']
				});

			})
			.fail(() => {
				this.setState({
					buttonLabel: this.buttonLabels['get']
				});
				alert('URLが存在しないっぽかったです。');
			});
	}

	_roundNum(num, dig = 2){
		var p = Math.pow( 10 , dig );
		return Math.floor( num * p ) / p ;
	}

	render(){
		var results = this.state.results.map((result, key) => {
			return (
				<tr key={key}>
					<td className="score">{this._roundNum(result.score, 2).toFixed(2)}</td>
					<td className="bookmarkCountBox"><a className="bookmarkCount" href={result.entryUrl} target="_blank">{result.bookmarkCount}users</a></td>
					<td className="pageTitle"><a href={result.url} target="_blank">{result.title}</a></td>
				</tr>
			);
		});

		return(
			<div className="scoreViewer">
				<div className="form">
					<input className="urlInput" name="url" type="url" placeholder="(http://)www.example.com" ref="inputUrl" onKeyUp={this.handleSubmit.bind(this)}/> <input className={"btn submitBtn" + (this.state.buttonLabel === 'loading...' ? ' active' : '')} type="button" value={this.state.buttonLabel} onClick={this.handleSubmit.bind(this)}/>
				</div>
				<table className="resultTable">
					<thead>
						<tr>
							<td className="score">スコア</td>
							<td className="bookmarkCountBox">ブクマ</td>
							<td className="pageTitle">ページ名</td>
						</tr>
					</thead>
					<tbody>
						{results}
					</tbody>
				</table>
			</div>
		);
	}
}