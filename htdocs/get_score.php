<?php
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$user_list = $_REQUEST['users'];
//$user_list = array('megazalrock', 'comzoo', 'guldeen', 'test');
if(empty($user_list)){
	die;
}
$score = $users->get_users_score($user_list);
echo $score;