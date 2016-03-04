<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
//$user_list = array('megazalrock', 'comzoo', 'guldeen', 'test');
if(!isset($_REQUEST['users']) || 
	!isset($_REQUEST['read_later_num']) || 
	!isset($_REQUEST['bookmark_count']) || 
	!isset($_REQUEST['url']) || 
	!isset($_REQUEST['type'])
){
	die;
}
$user_list = explode(',', $_REQUEST['users']);
$read_later_num = $_REQUEST['read_later_num'];
$bookmark_count = $_REQUEST['bookmark_count'];
$url = rawurldecode($_REQUEST['url']);
$type = $_REQUEST['type'];
$result = $users->get_karma_sum($user_list, $read_later_num, $bookmark_count, $type);
foreach ($user_list as $userid) {
	$users->add_user($userid);
}
if($result['is_cache']){
	header('X-MGZL-From-Cache: true');
}
echo $result['score'];
