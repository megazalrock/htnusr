<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/Hatena.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();

$user_list = $users->get_users_data(100);
if(!empty($user_list)){
	$result = HatenaAPI::fetch_hateb_user_info($user_list);
	$count = 0;
	foreach ($user_list  as $user) {
		if($result[$user['name']]['star'] !== false && $result[$user['name']]['followers'] !== false){
			$users->update_user_star($user, $result[$user['name']]['star'], $result[$user['name']]['followers']);
			$count++;
		}
	}
	echo '<br>' . $count;
}else{
	echo 'finished !!!!!';
}