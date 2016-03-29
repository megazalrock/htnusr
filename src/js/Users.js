import $ from 'jquery';
import _ from 'lodash';
export default class Users {
	constructor(){
		this.addUsersAjax = null;
		this.getScoreAjax = null;
		this.getUsersAjax = null;
	}

	abort(){
		if(!_.isNull(this.getScoreAjax) &&_.isFunction(this.getScoreAjax.abort)){
			this.getScoreAjax.abort();
		}
		if(!_.isNull(this.getUsersAjax) &&_.isFunction(this.getUsersAjax.abort)){
			this.getUsersAjax.abort();
		}
	}

	getUsers(url){
		var deferred = $.Deferred();
		this.getUsersAjax = $.ajax({
			url: 'http://b.hatena.ne.jp/entry/jsonlite/',
			dataType: 'jsonp',
			data: {
				url: url
			}
		})
		.then((data, status, jqXHR) => {
			if(_.isNull(data)){
				deferred.reject(status, jqXHR);
			}else{
				deferred.resolve({
					data: data,
					bookmarkCount: data.count
				});
			}
		})
		.fail((...args) => {
			deferred.reject(args);
		});
		return deferred.promise();
	}

	getScore(url){
		var deferred = $.Deferred();
		this.getScoreAjax = $.ajax({
			url: 'get_score.php',
			data: {
				url: url
			}
		})
		.then((data) => {
			deferred.resolve(data);
		})
		.fail((...args) => {
			deferred.reject(args);
		});
		return deferred.promise();
	}
}