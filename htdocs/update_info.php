<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Constant.php');
require_once (dirname(__FILE__) . '/../app/lib/RequestChecker.php');
require_once (dirname(__FILE__) . '/../app/lib/CurlWrapper.php');
require_once (dirname(__FILE__) . '/../app/lib/Cache.php');

function get_updateinfo_json(){
	$curl = new CurlWrapper();
	$feed = $curl->fetch('http://megazalrock.hatenablog.com/rss/category/bh.mgzl.jp%E3%81%AE%E6%9B%B4%E6%96%B0%E5%B1%A5%E6%AD%B4');
	if(!$curl->is_ok()){
		header('HTTP', true, 500);
		die;
	}
	try{
		$xml_object = new SimpleXMLElement($feed);
	}catch(Exception $e){
		header('HTTP', true, 500);
		die;
	}
	$test = $xml_object->channel->item[0];
	$result = array(
		'title' => (string) $xml_object->channel->item[0]->title,
		'link' => (string) $xml_object->channel->item[0]->link,
		'date' => date('Y/m/d', strtotime($xml_object->channel->item[0]->pubDate))
	);
	return json_encode($result);
}

$is_local = preg_match('/.+\.otto$/', $_SERVER['HTTP_HOST']);
$dirname = 'updateinfo';
$cache = new Cache(UPDATEINFO_CACHE_EXPIRES, true, UPDATEINFO_CACHE_DIR);
$cache->respond($dirname, 'application/json; charset=utf-8', 'get_updateinfo_json', array(), $is_local);