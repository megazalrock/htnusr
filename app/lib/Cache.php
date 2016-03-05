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
		return self::$cache_dir . '/' . sha1($name);
	}

	private function get_file_time($file_path){
		if(file_exists($file_path)){
			return filemtime($file_path);
		}else{
			return false;
		}
	}

	public function get_cache($name){
		self::make_cache_dir();
		$cache_file_path = self::get_cache_file_path($name);
		$file_time = self::get_file_time($cache_file_path);
		if(file_exists($cache_file_path) && $file_time && time() - $file_time < self::CACHE_EXPERIOD){
			return file_get_contents($cache_file_path);
		}else{
			return false;
		}
	}

	public function save_cache($name, $str){
		self::make_cache_dir();
		$cache_file_path = self::get_cache_file_path($name);
		$handle = fopen($cache_file_path, 'w');
		fwrite($handle, $str);
		fclose($handle);
	}
}