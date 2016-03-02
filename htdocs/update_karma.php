<?php
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$queue_list = $users->update_users(100);
echo count($queue_list) . 'users updated';