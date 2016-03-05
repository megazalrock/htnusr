<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/lib/Cache.php');
require_once (dirname(__FILE__) . '/../app/Feed.php');
$type = $_REQUEST['type'];
if(empty($type)){
	die;
}
$cache = new Cache(FEED_CACHE_EXPIRES);
$feed = new Feed();
$cache->respond($type, 'application/json; charset=utf-8', array($feed, 'get_feed_data'), array($type));
/*header("Content-Type: application/json; charset=utf-8");
header("Last-Modified: " . gmdate('r', $last_modified));
header("Cache-Control: max-age=" . ( 60 * 5));
header("Paragma: cache");
echo json_encode($result);*/