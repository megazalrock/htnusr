<?php
date_default_timezone_set('Asia/Tokyo');
class Cache {
	static public $cache_expires;
	static private $cache_dir;

	public function __construct($expires, $cache_dir = '/cache'){
		$this->cache_expires = $expires;
		$this->cache_dir = dirname(__FILE__) . '/../..' . $cache_dir;
	}

	private function make_cache_dir(){
		if(!file_exists($this->cache_dir)){
			mkdir($this->cache_dir);
		}
	}

	private function get_cache_file_path($name){
		$this->make_cache_dir();
		return $this->cache_dir . '/' . sha1($name);
	}

	public function get_file_time($file_path){
		if(file_exists($file_path)){
			return filemtime($file_path);
		}else{
			return false;
		}
	}

	public function has_cache($name){
		$cache_file_path = $this->get_cache_file_path($name);
		$file_time = $this->get_file_time($cache_file_path);
		return (file_exists($cache_file_path) && $file_time && $file_time < time() - $this->cache_expires);
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
		$cache_file_path = $this->get_cache_file_path($name);
		$file_time = $this->get_file_time($cache_file_path);
		header("Content-Type: " . $content_type);
		if($this->has_cache($name)){
			$result = file_get_contents($cache_file_path);
			$is_cache = $file_time;
			header('X-Mgzl-From-Cache: True');
			header('Last-Modified: ' . date('r', $file_time));
		}else{
			$is_cache = false;
			$result = call_user_func_array($nocache_callback, $call_back_param_arr);
			$this->save_cache($name, $result);
			header('Last-Modified: ' . date('r'));
		}
		echo $result;
		return $is_cache;
	}

	public function save_cache($name, $str){
		$this->make_cache_dir();
		$cache_file_path = $this->get_cache_file_path($name);
		$handle = fopen($cache_file_path, 'w');
		fwrite($handle, $str);
		fclose($handle);
	}
}