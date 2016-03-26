import React from 'react';
import {Link} from 'react-router';
export default class FeedMenu extends React.Component{
	constructor(props){
		super(props);
	}

	componentWillReceiveProps(nextProp){
		console.log(nextProp);
	}

	dispatchSetViewMode(viewMode){
		this.props.handleSetViewMode(viewMode);
	}

	dispatchOnChangeOrderby(e){
		this.props.handleOnChangeOrderby(e.target.value);
	}

	render(){
		console.log(this.props);
		return (
			<div className="ui">
				<div className="feedType btnBox">
					<Link className={'hotentry btn' + (this.props.mode === 'hotentry' ? ' selected' : '')} to="/">人気</Link>
					<Link className={'new btn' + (this.props.mode === 'new' ? ' selected' : '')} href="/new" to="/new">新着</Link>
					<select className={'orderby ' + this.props.isFeedItemLoading ? 'disabled' : ''} disabled={this.props.isFeedItemLoading ? 'disabled' : ''} value={this.props.orderby} name="orderby" onChange={this.dispatchOnChangeOrderby.bind(this)}>
						<option value="default">はてな</option>
						<option value="smart">スコア+日時</option>
						<option value="score">スコア</option>
						<option value="date">日時</option>
					</select>
				</div>
				<div className="viewMode btnBox">
					<div className={'title btn' + (this.props.viewMode === 'title' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'title')}>タイトルのみ</div>
					<div className={'text btn' + (this.props.viewMode === 'text' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'text')}>簡易表示</div>
					<div className={'image btn' + (this.props.viewMode === 'image' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'image')}>画像表示</div>
				</div>
			</div>
		);
	}
}