import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
export default class UpdateInfo extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			title: null,
			link: null,
			date: null

		};
		this._getRss();
	}

	_getRss(){
		$.ajax({
			url: '/update_info.php',
			dataType: 'json'
		})
		.then((res) => {
			this.setState(res);
		})
		.fail((...args)=>{
			console.log(args);
		});
	}

	render(){
		if(_.isNull(this.state.title) || _.isNull(this.state.link) || _.isNull(this.state.link)){
			return null;
		}
		return(
			<span>
				{this.state.date}更新<br />
				<a href={this.state.link} target="_blank">{this.state.title}</a>
			</span>
		);
	}
}