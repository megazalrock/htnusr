import $ from 'jquery';
import _ from 'lodash';
export default class Hatena {
	getUsers(url){
		var deferred = $.Deferred();
		$.ajax({
			url: 'http://b.hatena.ne.jp/entry/jsonlite/',
			dataType: 'jsonp',
			data: {
				url: url
			}
		})
		.done((data, textStatus, jqXHR) => {
			if(_.isNull(data)){
				deferred.reject(textStatus, jqXHR);
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