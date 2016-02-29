import $ from 'jquery';
import _ from 'lodash';
export default class Users {
	addUsers(data){
		var deferred = $.Deferred();
		$.ajax({
			url:'add_users.php',
			dataType: 'text',
			type: 'post',
			data: {
				users: data.users
			}
		})
		.done((score) =>{
			deferred.resolve(score);
		})
		.fail((...args) => {
			deferred.reject(...args);
		});
		return deferred.promise();
	}
	
	getScore(data){
		var deferred = $.Deferred();
		$.ajax({
			url:'get_score.php',
			dataType: 'text',
			type: 'post',
			data: {
				users: data.users
			}
		})
		.done((score) =>{
			deferred.resolve(score - data.bookmarkCount);
		})
		.fail((...args) => {
			deferred.reject(...args);
		});
		return deferred.promise();
	}
}