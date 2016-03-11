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

	getScore(data, type){
		var deferred = $.Deferred();
		var tags = [];
		_.forEach(data.data.bookmarks, (bookmark) =>{
			tags = tags.concat(bookmark.tags);
		});
		var readLaterTags = tags.join(',').match(/(?:あと|後)で(?:読|よ)む/g) || [];
		this.getScoreAjax = $.ajax({
			url:'get_score.php',
			dataType: 'text',
			type: 'post',
			ifModified: true,
			cache: true,
			data: {
				users: data.users.join(','),
				read_later_num: readLaterTags.length,
				bookmark_count: data.bookmarkCount,
				url: encodeURIComponent(data.data.url),
				type: type
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