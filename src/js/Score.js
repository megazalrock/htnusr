import $ from 'jquery';
import _ from 'lodash';
export default class Score {
	getScore(data){
		var promise = new Promise((resolve, reject) => {
			$.ajax({
				url:'user_score.php',
				dataType: 'text',
				type: 'post',
				data: {
					users: data.users
				}
			})
			.done((score) =>{
				resolve(score);
			})
			.fail((...args) => {
				reject(...args);
			});
		});
		return promise;
	}
}