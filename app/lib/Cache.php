<?php
date_default_timezone_set('Asia/Tokyo');
class Cache {
	public $cache_expires;
	private $cache_dir;
	private $cache_base_dir;
	private $is_gzip_enabled;

	public function __construct($expires, $is_gzip_enabled = true, $cache_dir = ''){
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

	private function get_cache_file_path($name, $is_gzip_enabled = null){
		$this->make_cache_dir();
		$cache_file_path = $this->cache_dir . '/' . sha1($name);
		if(is_null($is_gzip_enabled)){
			$is_gzip_enabled = $this->is_gzip_enabled;
		}
		if($is_gzip_enabled){
			$cache_file_path .= '.gz';
		}
		return $cache_file_path;
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
		return (file_exists($cache_file_path) && $file_time && time() < $file_time + $this->cache_expires);
	}

	/**
	 * キャッシュとモノホンをスマートに判断して送信
	 * @param  string 	$name                ファイル名
	 * @param  string 	$content_type        コンテンツタイプ
	 * @param  function $nocache_callback    キャッシュがない時のコールバック
	 * @param  function	$call_back_param_arr コールバックの引数の配列
	 * @param  boolean	$disable_cache		 キャッシュの強制オフ
	 * @return [type]
	 */
	public function respond($name, $content_type, $nocache_callback, $call_back_param_arr = array(), $disable_cache = false){
		$cache_file_path = $this->get_cache_file_path($name);
		header("Content-Type: " . $content_type);
		if($this->has_cache($name) && !$disable_cache){
			//$result = file_get_contents($cache_file_path);
			$file_time = $this->get_file_time($cache_file_path);
			$etag = md5_file($cache_file_path);
			header('ETag: "' . $etag  . '"');
			header('X-Mgzl-From-Cache: True');
			if($this->is_gzip_enabled){
				header("Content-Encoding: gzip");
			}
			if(
				(isset($_SERVER['HTTP_IF_NONE_MATCH']) && preg_match("/{$etag}/", $_SERVER['HTTP_IF_NONE_MATCH']))
			){
				header('HTTP/1.1 304 Not Modified');
				exit;
			}
			$is_cache = $file_time;
			header('Content-Length: ' . filesize($cache_file_path));
			readfile($cache_file_path);
		}else{
			$is_cache = false;
			$result = call_user_func_array($nocache_callback, $call_back_param_arr);
			$this->save_cache($name, $result);
			$etag = md5_file($cache_file_path);
			header('ETag: "' . $etag  . '"');
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

	/**
	 * キャッシュファイルを保存
	 * @param  string  $name       ファイル名
	 * @param  string  $str        ファイル内容
	 * @param  boolean $force_gzip 強制的にgzipにするかどうか
	 */
	public function save_cache($name, $str, $force_gzip = false){
		$this->make_cache_dir();
		$tmp_dir = sys_get_temp_dir();
		if($force_gzip){
			$cache_file_path = $this->get_cache_file_path($name, true);
			$tmp_file_path = $tmp_dir . $name . 'gz';
		}else{
			$cache_file_path = $this->get_cache_file_path($name);
			$tmp_file_path = $tmp_dir . $name;
		}
		if($force_gzip || $this->is_gzip_enabled){
			$gzip = gzopen( $tmp_file_path , 'w9' ) ;
			gzwrite( $gzip , $str ) ;
			gzclose( $gzip ) ;
		}else{
			$handle = fopen($tmp_file_path, 'w');
			fwrite($handle, $str);
			fclose($handle);
		}
		if(file_exists($cache_file_path)){
			unlink($cache_file_path);
		}
		copy($tmp_file_path, $cache_file_path);
	}
}