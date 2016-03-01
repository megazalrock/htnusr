<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Feed.php');
$type = $_REQUEST['type'];
if(empty($type)){
	die;
}

$feed = new Feed();
$result = $feed->get_feed_data($type);
header("Content-Type: application/json; charset=utf-8");
echo json_encode($result);