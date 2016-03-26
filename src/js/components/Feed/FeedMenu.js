import React from 'react';
import {Link} from 'react-router';
export default class FeedMenu extends React.Component{
	constructor(props){
		super(props);
	}

	dispatchSetViewMode(viewMode){
		this.props.handleSetViewMode(viewMode);
	}

	dispatchOnChangeOrderby(e){
		this.props.handleOnChangeOrderby(e.target.value);
	}

	render(){
		return (
			<div className="ui">
				<div className="feedType btnBox">
					<Link className={'hotentry btn' + (this.props.mode === 'hotentry' ? ' selected' : '')} to="/">人気</Link>
					<Link className={'new btn' + (this.props.mode === 'new' ? ' selected' : '')} href="/new" to="/new">新着</Link>
					<select className={'orderby btn' + (this.props.isFeedItemLoading ? ' hidden' : '')} disabled={this.props.isFeedItemLoading ? 'disabled' : ''} value={this.props.orderby} name="orderby" onChange={this.dispatchOnChangeOrderby.bind(this)}>
						<option value="default">{(this.props.isFeedItemLoading ? 'loading score...' : 'はてな')}</option>
						<option value="smart">{(this.props.isFeedItemLoading ? 'loading score...' : 'スコア+日時')}</option>
						<option value="score">{(this.props.isFeedItemLoading ? 'loading score...' : 'スコア')}</option>
						<option value="date">{(this.props.isFeedItemLoading ? 'loading score...' : '日時')}</option>
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