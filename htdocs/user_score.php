<?php
require_once ('../app/Hatena.php');

$users = $_REQUEST['users'];
$result = 0;
foreach ($users as $user) {
	$result += HatenaAPI::get_hateb_user_score($user);
}
echo $result;
/*var_dump(HatenaAPI::get_hateb_user_score('megazalrock'));
var_dump(HatenaAPI::get_hateb_user_score('comzoo'));
var_dump(HatenaAPI::get_hateb_user_score('guldeen'));
var_dump(HatenaAPI::get_hateb_user_score('pojihiguma'));*/
//var_dump(HatenaAPI::get_hateb_score('https://syncer.jp/hatebu-api-matome'));