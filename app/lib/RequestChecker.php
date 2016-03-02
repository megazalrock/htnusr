<?php
if(!isset($_SERVER['HTTP_X_REQUESTED_WITH']) && is_null($_SERVER['HTTP_X_REQUESTED_WITH'])){
	header('HTTP', true, 403);
	die();
}