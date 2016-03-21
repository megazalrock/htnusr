import React from 'react';
export default class MainMenu extends React.Component{
	constructor(props){
		super(props);
		this.mode = this.props.route.path === 'new' ? 'new' : 'hotentry';
	}

	dispatchSetViewMode(viewMode){
		this.props.handleSetViewMode(viewMode);
	}

	render(){
		return (
			<div className="ui">
				<div className="feedType btnBox">
					<a className={'hotentry btn' + (this.mode === 'hotentry' ? ' selected' : '')} href="/">人気</a>
					<a className={'new btn' + (this.mode === 'new' ? ' selected' : '')} href="/new">新着</a>
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