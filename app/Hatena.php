<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/Constant.php');
class HatenaAPI{
	const STAR_API = 'http://s.hatena.ne.jp/blog.json?uri=%s';
	const HATEB_USER_PAGE = 'http://b.hatena.ne.jp/%s/';
	const HATEB_API = 'http://b.hatena.ne.jp/entry/jsonlite/?url=%s';
	const HATEB_USER_FOLLOWER_PAGE = 'follower';
	const TIMEOUT = 10;

	public function get_hateb_score($url){		
		$json = @file_get_contents(sprintf(self::HATEB_API, $url));
		if($json === false){
			return false;
		}
		$json = json_decode($json, true);
	}

	public function get_hateb_user_star($userid){
		try{
			$json = @file_get_contents(sprintf(self::STAR_API, rawurlencode(sprintf(self::HATEB_USER_PAGE, $userid))));
			return self::parse_hateb_user_star($json);
		}catch(Exception $e){
			return 0;
		}
	}

	public function parse_hateb_user_star($json){
		$json = json_decode($json, true);
		if(!isset($json['count']['purple'])){
			$json['count']['purple'] = 0;
		}
		if(!isset($json['count']['blue'])){
			$json['count']['blue'] = 0;
		}
		if(!isset($json['count']['red'])){
			$json['count']['red'] = 0;
		}
		if(!isset($json['count']['green'])){
			$json['count']['green'] = 0;
		}
		if(!isset($json['count']['yellow'])){
			$json['count']['yellow'] = 0;
		}
		return array(
			//'score' => (float) self::calc_star($json['count']) + 1,
			'purple' => (int) $json['count']['purple'],
			'blue' => (int) $json['count']['blue'],
			'red' => (int) $json['count']['red'],
			'green' => (int) $json['count']['green'],
			'yellow' => (int) $json['count']['yellow']
		);
	}

	//黄 + 緑 * 2 + 赤 * 4 + 青 * 25 + 紫 * 256
	private function calc_star($star_count){
		$result = 0;
		if(!is_array($star_count)){
			return 0;
		}
		foreach ($star_count as $star => $count) {
			switch ($star) {
				case 'purple':
					$result += $count * 256;
				break;
				case 'blue':
					$result += $count * 25;
				break;
				case 'red':
					$result += $count * 4;
				break;
				case 'green':
					$result += $count * 2;
				break;
				default:
					$result += ($count / 100);
				break;
			}
		}
		return $result;
	}

	public function get_hateb_user_follower($userid){
		$follower_url = sprintf(self::HATEB_USER_PAGE . self::HATEB_USER_FOLLOWER_PAGE, $userid);
		$ch = curl_init(); // はじめ
		$headers = array(
		    "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:26.0) Gecko/20100101 Firefox/26.0"
		);
		curl_setopt($ch, CURLOPT_URL, $follower_url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$html =  curl_exec($ch);
		$info = curl_getinfo($ch);
		curl_close($ch); //終了

		return self::parse_hateb_user_follower($html, $userid);
	}

	public function parse_hateb_user_follower($html, $userid){
		$dom = new DOMDocument();
		@$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
		$xpath = new DOMXPath($dom);
		$query = '//div[@class="hatena-module hatena-module-profile"]/div[@class="hatena-module-body"]/ul/li/a[@href=\'/' . $userid . '/follower\']';
		$follower = $xpath->evaluate('string(' . $query . ')');
		$follower = preg_replace('/,/', '', $follower);
		if(empty($follower)){
			$follower = 0;
		}
		return (int) $follower;
	}

	public function fetch_hateb_user_info($user_list){
		$mh = curl_multi_init();
		$header = array("User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36");
		$connection = array();
		foreach ($user_list as $key => $user) {
			$userid = $user['name'];
			$star_url = sprintf(self::STAR_API, rawurlencode(sprintf(self::HATEB_USER_PAGE, $userid)));
			$follower_url = sprintf(self::HATEB_USER_PAGE . self::HATEB_USER_FOLLOWER_PAGE, $userid);

			$connection[$userid] = array();
			$connection[$userid]['star'] = curl_init();
			curl_setopt($connection[$userid]['star'], CURLOPT_URL, $star_url);
			curl_setopt($connection[$userid]['star'], CURLOPT_RETURNTRANSFER, true);
			curl_setopt($connection[$userid]['star'], CURLOPT_FRESH_CONNECT, true);
			curl_setopt($connection[$userid]['star'], CURLOPT_HTTPHEADER, array("User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"));
			curl_setopt($connection[$userid]['star'], CURLOPT_TIMEOUT, self::TIMEOUT);
			curl_multi_add_handle($mh, $connection[$userid]['star']);

			$connection[$userid]['followers'] = curl_init();
			curl_setopt($connection[$userid]['followers'], CURLOPT_URL, $follower_url);
			curl_setopt($connection[$userid]['followers'], CURLOPT_RETURNTRANSFER, true);
			curl_setopt($connection[$userid]['followers'], CURLOPT_FRESH_CONNECT, true);
			curl_setopt($connection[$userid]['followers'], CURLOPT_HTTPHEADER, array("User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"));
			curl_setopt($connection[$userid]['followers'], CURLOPT_TIMEOUT, self::TIMEOUT);
			curl_multi_add_handle($mh, $connection[$userid]['followers']);
		}

		$active = null;
		do{
			$mrc = curl_multi_exec($mh, $active);
		}while ($mrc == CURLM_CALL_MULTI_PERFORM);

		while ($active && $mrc == CURLM_OK) {
			if (curl_multi_select($mh) != -1) {
				do {
					$mrc = curl_multi_exec($mh, $active);
					usleep(100000);
				} while ($mrc == CURLM_CALL_MULTI_PERFORM);
			}
		}

		if ($mrc != CURLM_OK) {
			echo '読み込みエラーが発生しました:'.$mrc;
		}

		$result = array();

		foreach ($connection as $userid => $ch_set) {
			$result[$userid] = array();
			foreach ($ch_set as $type => $ch) {
				if($error = curl_error($connection[$userid][$type]) == ''){
					$result[$userid][$type] = curl_multi_getcontent($connection[$userid][$type]);
					if($type == 'star'){
						$result[$userid][$type] = self::parse_hateb_user_star($result[$userid][$type]);
					}else if($type == 'followers'){
						$result[$userid][$type] = self::parse_hateb_user_follower($result[$userid][$type], $userid);
					}
				}else{
					//echo 'Failed : ' . $userid . ' <br>';
					$result[$userid][$type] = false;
				}
				curl_multi_remove_handle($mh, $connection[$userid][$type]);
				curl_close($connection[$userid][$type]);
			}
		}
		curl_multi_close($mh);

		return $result;
	}

	private function get_curl_handler($url, $type){
		$ch = curl_init();
		$header = array("User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36");
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		return $ch;
	}

}