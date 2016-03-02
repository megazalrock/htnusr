<?php
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$user_list = $_REQUEST['users'];

if(empty($user_list)){
	die;
}

var_dump($user_list);
foreach ($user_list as $userid) {
	$users->add_user($userid);
}