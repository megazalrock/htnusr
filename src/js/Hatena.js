import $ from 'jquery';
import _ from 'lodash';
export default class Hatena {
	getUsers(url){
		var promise = new Promise((resolve, reject) =>{
			$.ajax({
				url: 'http://b.hatena.ne.jp/entry/jsonlite/',
				dataType: 'jsonp',
				data: {
					url: url
				}
			})
			.done((data, textStatus, jqXHR) => {
				if(_.isNull(data)){
					reject(textStatus, jqXHR);
				}else{
					var result = [];
					_.forEach(data.bookmarks, (bookmark)=>{
						result.push(bookmark.user);
					});
					resolve({
						users: result,
						bookmarkCount: data.count
					});
				}
			})
			.fail((...args) => {
				reject(...args);
			});
		});
		return promise;
	}
}