<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$user_list = $_REQUEST['users'];
$read_later_num = $_REQUEST['read_later_num'];
$bookmark_count = $_REQUEST['bookmark_count'];
//$user_list = array('megazalrock', 'comzoo', 'guldeen', 'test');
if(!isset($user_list) || !isset($read_later_num) || !isset($bookmark_count)){
	die;
}
$score = $users->get_karma_sum($user_list, $read_later_num, $bookmark_count);
echo $score;