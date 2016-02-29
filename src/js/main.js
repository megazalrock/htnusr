import $ from 'jquery';
import _ from 'lodash';
import Hatena from './Hatena';
import Score from './Score';

var $form = $('#form');
var $input = $form.find('input');
$form.find('button')
	.on('click', function () {
		var hatena = new Hatena();
		hatena.getUsers($input.val())
			.then((res) => {
				var score = new Score();
				/*var users = (() => {
					var array = [];
					_.forEach(res.users, (user) => {
						array.push('"' + user + '"');
					});
					return array;
				})();
				var result = 'array(' + users.join(',') +  ')';
				$('#result').html(result);*/
				//console.log(res);
				return score.getScore(res);
			})
			.then((score) => {
				console.log(score);
			});
	});