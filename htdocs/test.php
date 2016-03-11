<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/Hatena.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$users->update_scores();

/*$result = HatenaAPI::fetch_hateb_user_info(array(
	array('name' => 'megazalrock'),
	array('name' => 'guldeen'),
	array('name' => 'xevra')
));*/



//var_dump($result);

//var_dump(HatenaAPI::get_hateb_user_follower('guldeen'));
