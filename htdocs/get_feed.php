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
$feed = new Feed();
$is_local = preg_match('/.+\.otto$/', 'htnuser.otto');
$cache = new Cache(FEED_CACHE_EXPIRES, true, FEED_CACHE_DIR);
$cache->respond($type, 'application/json; charset=utf-8', array($feed, 'get_feed_json'), array($type, FEED_NUM), $is_local);