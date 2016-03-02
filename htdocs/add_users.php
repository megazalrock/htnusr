<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$user_list = $_REQUEST['users'];

if(empty($user_list)){
	die;
}

foreach ($user_list as $userid) {
	$users->add_user($userid);
}