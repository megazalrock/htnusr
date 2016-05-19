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
			socre: null,
			bookmarkCount: null,
			scoreBookmarkRato: null
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

	dispatchOnChangeFilterParam(e){
		/*var filterParams = {
			bookmarkCount : this.state.setting.bookmarkCount,
			score : this.setting.state.score,
			scoreBookmarkRato : this.state.setting.scoreBookmarkRato
		};
		filterParams[e.target.name] = Number(e.target.value);
		if(!_.isNumber(filterParams[e.target.name])){
			alert('数値で入力して下さい。');
		}
		this.setState(filterParams);
		this.props.handleOnChangeFilterParams(filterParams);*/
	}

	toggleDetailSettingVisibility(){
		this.setState({ isDetailSettingVisible : !this.state.isDetailSettingVisible });
	}

	toggleFilterParamCheckbox(e){
		/*var _obj = {};
		_obj[e.target.name] = e.target.checked;
		var keyName;
		if(e.target.name === 'isBookmarkCountEnable'){
			keyName = 'bookmarkCount';
		}else if(e.target.name === 'isScoreEnable'){
			keyName = 'socre';
		}else if(e.target.name === 'isScoreBookmarkRatoEnable'){
			keyName = 'scoreBookmarkRato';
		}
		var filterParams = {
			bookmarkCount : this.state.setting.bookmarkCount,
			score : this.state.setting.score,
			scoreBookmarkRato : this.state.scoreBookmarkRato
		};
		var value = null;
		if(e.target.checked){
			value = this.state[keyName];
		}
		filterParams[keyName] = value;
		this.props.handleOnChangeFilterParams(filterParams);
		_obj[keyName] = value;
		this.setState(_obj);*/
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
						<div className={'detail btn' + (this.props.setting.filterMode === 'none' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'none')}>なし</div>
						<div className={'detail btn' + (this.props.setting.filterMode === 'recommend' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'recommend')}>オススメ</div>
						<div className={'detail btn' + (this.props.setting.filterMode === 'user' ? ' selected' : '')} onClick={this.dispatchOnChangeFilterMode.bind(this, 'user')}>ユーザー設定</div>
					</div>
					<div className={'userFilterSetting' + (this.props.setting.filterMode === 'user' ? ' visible' : '')}>
						<p>下記の条件に当てはまるものは表示しません。</p>
						<div className="inputBoxes">
							<div className="inputBox">
								<label className="withCheckBox">
									<input
										type="checkbox" name="isBookmarkCountEnable"
										defaultChecked={this.state.isBookmarkCountEnable}
										checked={this.state.isBookmarkCountEnable}
										onChange={this.toggleFilterParamCheckbox.bind(this)}
									/>
									ブックマーク数
								</label>
								<input
									disabled={this.state.isBookmarkCountEnable ? '' : ' disable'}
									id="input-bookmarkCount" name="bookmarkCount" type="number" min="0"
									defaultValue={this.props.setting.filterParams.bookmarkCount}
									onChange={this.dispatchOnChangeFilterParam.bind(this)}
								/>
								<label>未満</label>
							</div>
							<div className="inputBox">
								<label className="withCheckBox">
									<input
										type="checkbox" name="isScoreEnable"
										defaultChecked={this.state.isScoreEnable}
										checked={this.state.isScoreEnable}
										onChange={this.toggleFilterParamCheckbox.bind(this)}
									/>
									スコア
								</label>
								<input
									id="input-score" name="score" type="number"
									disabled={this.state.isScoreEnable ? '' : ' disable'}
									defaultValue={this.props.setting.filterParams.score}
									onChange={this.dispatchOnChangeFilterParam.bind(this)}
								/>
								<label>未満</label>
							</div>
							<div className="inputBox">
								<label className="withCheckBox">
									<input
										type="checkbox" name="isScoreBookmarkRatoEnable"
										defaultChecked={this.state.isScoreBookmarkRatoEnable}
										checked={this.state.isScoreBookmarkRatoEnable}
										onChange={this.toggleFilterParamCheckbox.bind(this)}
									/>
									スコアブクマ比
								</label>
								<input
									id="input-rato" name="scoreBookmarkRato" type="number" step="0.1"
									disabled={this.state.isScoreBookmarkRatoEnable ? '' : ' disable'}
									defaultValue={this.props.setting.filterParams.scoreBookmarkRato}
									onChange={this.dispatchOnChangeFilterParam.bind(this)}
								/>
								<label>未満</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}