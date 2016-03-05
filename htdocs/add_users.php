<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
if(!isset($_REQUEST['users']) || empty($_REQUEST['users'])){
	die;
}
$users = new Users();
$user_list = explode(',', $_REQUEST['users']);

foreach ($user_list as $userid) {
	$users->add_user($userid);
}