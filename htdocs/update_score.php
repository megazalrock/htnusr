<?php
//require_once ('../app/Hatena.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();


/*var_dump($user_list);
foreach ($user_list as $userid) {
	$users->add_user($userid);
}*/
//$users->update_users();
var_dump($users->update_users());
//var_dump($users->update_users());
/*$users = $_REQUEST['users'];
$result = 0;
foreach ($users as $user) {
	$result += HatenaAPI::get_hateb_user_score($user);
}
echo $result;*/
/*var_dump(HatenaAPI::get_hateb_user_score('megazalrock'));
var_dump(HatenaAPI::get_hateb_user_score('comzoo'));
var_dump(HatenaAPI::get_hateb_user_score('guldeen'));
var_dump(HatenaAPI::get_hateb_user_score('pojihiguma'));*/
//var_dump(HatenaAPI::get_hateb_score('https://syncer.jp/hatebu-api-matome'));