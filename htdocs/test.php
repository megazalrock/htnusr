<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/Hatena.php');
require_once (dirname(__FILE__) . '/../app/Users.php');

$users = new Users();

$users_list = $users->get_star_update_queue_list(10);
$result = HatenaAPI::fetch_hateb_users_info($users_list);
//var_dump($users_list);
foreach ($users_list  as $user) {
	$star_count = $result[$user['name']]['star'];
	$followers = $result[$user['name']]['followers'];
	//var_dump($result[$user['name']]['star']);
	$users_list[$key] = $users->update_user_star($user, $star_count, $followers);
	/*if($star_count !== false && $followers !== false){
	}else{
		$queue_list[$key] = $users->update_user_failed($user);
	}*/
}
//$users->update_users_karma($users->get_karma_update_queue_list());