<?php
date_default_timezone_set('Asia/Tokyo');
class Cache {
	static public $cache_expires;
	static private $cache_dir;
	static private $cache_base_dir;
	static private $is_gzip_enabled;

	public function __construct($expires, $is_gzip_enabled = false, $cache_dir = ''){
		$this->cache_expires = $expires;
		$this->cache_base_dir = dirname(__FILE__) . '/../../cache';
		$this->cache_dir = $this->cache_base_dir . $cache_dir;
		if(!(isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strstr($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip'))){
			$this->is_gzip_enabled = false;
		}else{
			$this->is_gzip_enabled = $is_gzip_enabled;
		}
	}

	private function make_cache_dir(){
		if(!file_exists($this->cache_base_dir)){
			mkdir($this->cache_base_dir);
		}
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
	public function respond($name, $content_type, $nocache_callback, $call_back_param_arr = array(), $force_nocache = false){
		$cache_file_path = $this->get_cache_file_path($name);
		if($this->is_gzip_enabled){
			$cache_file_path .= '.gz';
		}
		$file_time = $this->get_file_time($cache_file_path);
		header("Content-Type: " . $content_type);
		if(!$force_nocache && $this->has_cache($name)){
			//$result = file_get_contents($cache_file_path);
			$is_cache = $file_time;
			header('X-Mgzl-From-Cache: True');
			header('Last-Modified: ' . date('r', $file_time));
			if($this->is_gzip_enabled){
				header("Content-Encoding: gzip");
			}
			header('Content-Length: ' . filesize($cache_file_path));
			readfile($cache_file_path);
		}else{
			$is_cache = false;
			$result = call_user_func_array($nocache_callback, $call_back_param_arr);
			$this->save_cache($name, $result);
			header('Last-Modified: ' . date('r'));
			if($this->is_gzip_enabled){
				ob_start('ob_gzhandler');
			}
			echo $result;
			if($this->is_gzip_enabled){
				ob_end_flush();
			}
		}
		return $is_cache;
	}

	public function save_cache($name, $str){
		$this->make_cache_dir();
		$cache_file_path = $this->get_cache_file_path($name);
		if($this->is_gzip_enabled){
			$cache_file_path .= '.gz';
			$gzip = gzopen( $cache_file_path , 'w9' ) ;
			gzwrite( $gzip , $str ) ;
			gzclose( $gzip ) ;
		}else{
			$handle = fopen($cache_file_path, 'w');
			fwrite($handle, $str);
			fclose($handle);
		}
	}

	public function sweap_old_cache($force = false){
		if(!file_exists($this->cache_dir)){
			return false;
		}
		$files = scandir($this->cache_dir);
		foreach ($files as $file_name) {
			$file_path = $this->cache_dir . '/' . $file_name;
			if(!is_file($file_path)){
				continue;
			}
			$file_time = filemtime($file_path);
			if($force || $file_time < (time() - $this->cache_expires)){
				unlink($file_path);
			}
		}
	}
}