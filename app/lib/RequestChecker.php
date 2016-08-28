<?php
if($_SERVER['HTTP_HOST'] != 'htnusr.otto' && !isset($_SERVER['HTTP_X_REQUESTED_WITH']) && is_null($_SERVER['HTTP_X_REQUESTED_WITH'])){
	header('HTTP', true, 403);
	die();
}
header('X-Mgzl-Request-Checker: disabled');