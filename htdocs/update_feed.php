<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/../app/Feed.php');
$feed = new Feed();
$feed->update_feed();