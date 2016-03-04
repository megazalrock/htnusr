<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
//$user_list = array('megazalrock', 'comzoo', 'guldeen', 'test');
if(!isset($_REQUEST['users']) || empty($_REQUEST['users']) ||
	!isset($_REQUEST['read_later_num']) || empty($_REQUEST['read_later_num']) ||
	!isset($_REQUEST['bookmark_count']) || empty($_REQUEST['bookmark_count']) ||
	!isset($_REQUEST['url']) || empty($_REQUEST['url']) 
){
	die;
}
$user_list = explode(',', $_REQUEST['users']);
$read_later_num = $_REQUEST['read_later_num'];
$bookmark_count = $_REQUEST['bookmark_count'];
$url = rawurldecode($_REQUEST['url']);
$score = $users->get_karma_sum($user_list, $read_later_num, $bookmark_count);
foreach ($user_list as $userid) {
	$users->add_user($userid);
}
echo $score;
