import $ from 'jquery';
import _ from 'lodash';
export default class Users {
	constructor(device){
		this.addUsersAjax = null;
		this.getScoreAjax = null;
		this.getUsersAjax = null;
		this.device = device;
	}

	abort(){
		if(!_.isNull(this.addUsersAjax) && _.isFunction(this.addUsersAjax.abort)){
			this.addUsersAjax.abort();
		}
		if(!_.isNull(this.getScoreAjax) &&_.isFunction(this.getScoreAjax.abort)){
			this.getScoreAjax.abort();
		}
		if(!_.isNull(this.getUsersAjax) &&_.isFunction(this.getUsersAjax.abort)){
			this.getUsersAjax.abort();
		}
	}

	addUsers(data){
		var deferred = $.Deferred();
		this.addUsersAjax = $.ajax({
			url:'add_users.php',
			dataType: 'text',
			type: 'post',
			data: {
				users: data.users
			}
		})
		.then((score, status, jqXhr) =>{
			this.addUsersAjax = jqXhr;
			deferred.resolve(score);
		})
		.fail((...args) => {
			deferred.reject(...args);
		});
		return deferred.promise();
	}
	
	getScore(data){
		var deferred = $.Deferred();
		var readLaterNum = 0;
		_.forEach(data.data.bookmarks, (bookmark) =>{
			if(bookmark.tags.includes('あとで読む')){
				readLaterNum += 1;
			}
		});

		this.getScoreAjax = $.ajax({
			url:'get_score.php',
			dataType: 'text',
			type: 'post',
			data: {
				users: data.users,
				read_later_num: readLaterNum,
				bookmark_count: data.bookmarkCount
			}
		})
		.then((score) =>{
			deferred.resolve(score);
		})
		.fail((...args) => {
			deferred.reject(...args);
		});
		return deferred.promise();
	}

	getUserScore(userid){
		var userPageUrl = 'http://b.hatena.ne.jp/' + userid + '/';
		/*$.ajax({
			url: 'http://s.hatena.ne.jp/blog.json',
			dataType: 'jsonp',
			data: {
				uri : encodeURIComponent(userPageUrl)
			}
		})
		.then((result) =>{
			console.log(result.count);
		});*/
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
				var result = [];
				_.forEach(data.bookmarks, (bookmark)=>{
					result.push(bookmark.user);
				});
				deferred.resolve({
					data: data,
					users: result,
					bookmarkCount: data.count
				});
			}
		})
		.fail((...args) => {
			deferred.reject(...args);
		});
		return deferred.promise();
	}
}