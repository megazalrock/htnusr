<?php
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$limit = $_REQUEST['limit'];
if(!isset($limit)){
	$limit = 100;
}
$queue_list = $users->update_users($limit);
echo count($queue_list) . 'users updated';