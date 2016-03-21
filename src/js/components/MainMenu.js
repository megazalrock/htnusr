import React from 'react';
import {Link} from 'react-router';
export default class MainMenu extends React.Component{
	constructor(props){
		super(props);
	}

	dispatchSetViewMode(viewMode){
		this.props.handleSetViewMode(viewMode);
	}

	render(){
		return (
			<div className="ui">
				<div className="feedType btnBox">
					<Link className={'hotentry btn' + (this.props.mode === 'hotentry' ? ' selected' : '')} to="/">人気</Link>
					<Link className={'new btn' + (this.props.mode === 'new' ? ' selected' : '')} href="/new" to="/new">新着</Link>
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