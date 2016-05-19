import React from 'react';
import {Link} from 'react-router';
import _ from 'lodash';
export default class FeedMenu extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			isDetailSettingVisible: false,
			isBookmarkCountEnable: false,
			isScoreEnable: false,
			isScoreBookmarkRatoEnable: false,
			filterParams:{

			}
		};
	}

	dispatchSetViewMode(viewMode){
		this.props.handleSetViewMode(viewMode);
	}

	dispatchOnChangeOrderby(e){
		this.props.handleOnChangeOrderby(e.target.value);
	}

	dispatchOnChangeFilterMode(filterMode){
		this.props.handleOnChangeFilterMode(filterMode);
	}

	toggleDetailSettingVisibility(){
		this.setState({ isDetailSettingVisible : !this.state.isDetailSettingVisible });
	}

	onFormChange(e){
		var key = e.target.name, value, _params = {};
		if(e.target.type === 'checkbox'){
			value = e.target.checked;
		}else{
			if(/\d+\.?\d*/.test(e.target.value)){
				value = Number(e.target.value);
			}else{
				value = null;
			}
		}
		_params[key] = value;
		var filterParams = _.defaultsDeep(_params, this.props.setting.filterParams[this.props.mode]);
		this.props.handleOnChangeFilterParams(filterParams);
	}

	render(){
		return (
			<div className="ui">
				<div className="setting">
					<div className="feedType btnBox">
						<Link className={'hotentry btn' + (this.props.mode === 'hotentry' ? ' selected' : '')} to="/">人気</Link>
						<Link className={'new btn' + (this.props.mode === 'new' ? ' selected' : '')} href="/new" to="/new">新着</Link>
						<select className='orderby btn' value={this.props.orderby} name="orderby" onChange={this.dispatchOnChangeOrderby.bind(this)}>
							<option value="default">はてな</option>
							<option value="smart">スコア+日時</option>
							<option value="score">スコア</option>
							<option value="date">日時</option>
							<option value="score-bookmark">スコア/ブクマ</option>
						</select>
						<div className={'btn toggleDetailSettingVisibility' + (this.state.isDetailSettingVisible ? ' selected' : '')} onClick={this.toggleDetailSettingVisibility.bind(this)}>詳細設定</div>
					</div>
					<div className="viewMode btnBox">
						<div className={'title btn' + (this.props.setting.viewMode === 'title' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'title')}>タイトルのみ</div>
						<div className={'text btn' + (this.props.setting.viewMode === 'text' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'text')}>簡易表示</div>
						<div className={'image btn' + (this.props.setting.viewMode === 'image' ? ' selected' : '')} onClick={this.dispatchSetViewMode.bind(this, 'image')}>画像表示</div>
					</div>
				</div>
				<div className={'detailSetting' + (this.state.isDetailSettingVisible ? ' visible' : '')}>
					<div className="filterMode">
						<div className={'detail btn' + (this.props.setting.filterMode[this.props.mode] === 'none' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'none')}>なし</div>
						<div className={'detail btn' + (this.props.setting.filterMode[this.props.mode] === 'recommend' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'recommend')}>オススメ</div>
						<div className={'detail btn' + (this.props.setting.filterMode[this.props.mode] === 'user' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'user')}>ユーザー設定</div>
					</div>
					<div className={'userFilterSetting' + (this.props.setting.filterMode[this.props.mode] === 'user' ? ' visible' : '')}>
						<p>下記の条件に当てはまるものは表示しない</p>
						<form onChange={this.onFormChange.bind(this)}>
							<div className="inputBoxes">
								<div className={'inputBox' + ((this.props.setting.filterParams[this.props.mode].isBookmarkCountEnable) ? '' : ' disabled')}>
									<label className="withCheckBox">
										<input
											type="checkbox" name="isBookmarkCountEnable"
											checked={this.props.setting.filterParams[this.props.mode].isBookmarkCountEnable}
											onChange={_.noop}
										/>
										<span className="disableable">ブクマ数</span>
									</label>
									<input
										className="disableable"
										disabled={this.props.setting.filterParams[this.props.mode].isBookmarkCountEnable ? '' : ' disable'}
										id="input-bookmarkCount" name="bookmarkCount" type="number" min="0"
										value={this.props.setting.filterParams[this.props.mode].bookmarkCount}
										onChange={_.noop}
									/>
									<label className="disableable">未満</label>
								</div>
								<div className={'inputBox' + ((this.props.setting.filterParams[this.props.mode].isScoreEnable) ? '' : ' disabled')}>
									<label className="withCheckBox">
										<input
											type="checkbox" name="isScoreEnable"
											checked={this.props.setting.filterParams[this.props.mode].isScoreEnable}
											onChange={_.noop}
										/>
										<span className="disableable">スコア</span>
									</label>
									<input
										className="disableable"
										id="input-score" name="score" type="number"
										disabled={this.props.setting.filterParams[this.props.mode].isScoreEnable ? '' : ' disable'}
										value={this.props.setting.filterParams[this.props.mode].score}
										onChange={_.noop}
									/>
									<label className="disableable">未満</label>
								</div>
								<div className={'inputBox' + ((this.props.setting.filterParams[this.props.mode].isScoreBookmarkRatoEnable) ? '' : ' disabled')}>
									<label className="withCheckBox">
										<input
											type="checkbox" name="isScoreBookmarkRatoEnable"
											checked={this.props.setting.filterParams[this.props.mode].isScoreBookmarkRatoEnable}
											onChange={_.noop}
										/>
										<span className="disableable">スコアブクマ比</span>
									</label>
									<input
										className="disableable"
										id="input-rato" name="scoreBookmarkRato" type="number" step="0.1"
										disabled={this.props.setting.filterParams[this.props.mode].isScoreBookmarkRatoEnable ? '' : ' disable'}
										value={this.props.setting.filterParams[this.props.mode].scoreBookmarkRato}
										onChange={_.noop}
									/>
									<label className="disableable">未満</label>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}