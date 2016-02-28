import $ from 'jquery';
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
				return score.getScore(res);
			})
			.then((score) => {
				console.log(score);
			});
	});