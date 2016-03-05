<?php
date_default_timezone_set('Asia/Tokyo');
class Cache {
	const CACHE_DIR = '/cache';
	const CACHE_EXPERIOD = 3600;//60 * 60 * 1
	static private $cache_dir;

	private function make_cache_dir(){
		self::$cache_dir = dirname(__FILE__) . '/../..' . self::CACHE_DIR;
		if(!file_exists(self::$cache_dir)){
			mkdir(self::$cache_dir);
		}
	}

	private function get_cache_file_path($name){
		self::make_cache_dir();
		return self::$cache_dir . '/' . sha1($name);
	}

	private function get_file_time($file_path){
		if(file_exists($file_path)){
			return filemtime($file_path);
		}else{
			return false;
		}
	}

	/**
	 * キャッシュとモノホンをスマートに判断して送信
	 * @param  string 	$name                ファイル名
	 * @param  string 	$content_type        コンテンツタイプ
	 * @param  function $nocache_callback    キャッシュがない時のコールバック
	 * @param  function	$call_back_param_arr コールバックの引数の配列
	 * @return [type]
	 */
	public function respond($name, $content_type, $nocache_callback, $call_back_param_arr = array()){
		$cache_file_path = self::get_cache_file_path($name);
		$file_time = self::get_file_time($cache_file_path);
		header("Content-Type: " . $content_type);
		if((file_exists($cache_file_path) && $file_time && time() - $file_time < self::CACHE_EXPERIOD)){
			$result = file_get_contents($cache_file_path);
			header('X-Mgzl-From-Cache: True');
			header('Last-Modified: ' . date('r', $file_time));
		}else{
			$result = call_user_func_array($nocache_callback, $call_back_param_arr);
			self::save_cache($name, $result);
			header('Last-Modified: ' . date('r'));
		}
		echo $result;
	}

	public function save_cache($name, $str){
		self::make_cache_dir();
		$cache_file_path = self::get_cache_file_path($name);
		$handle = fopen($cache_file_path, 'w');
		fwrite($handle, $str);
		fclose($handle);
	}
}