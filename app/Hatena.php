<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/Constant.php');
require_once (dirname(__FILE__) . '/lib/CurlWrapper.php');
class HatenaAPI{
	const STAR_API = 'http://s.hatena.ne.jp/blog.json?uri=%s';
	const HATEB_USER_PAGE = 'http://b.hatena.ne.jp/%s/';
	const HATEB_API = 'http://b.hatena.ne.jp/entry/jsonlite/?url=%s';
	const HATEB_USER_FOLLOWER_PAGE = 'follower';
	const TIMEOUT = 10;

	/**
	 * スターのjson文字列をパース
	 * @param  string $json json文字列
	 * @return array
	 */
	private static function parse_hateb_user_star($json){
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
			'star_purple' => (int) $json['count']['purple'],
			'star_blue' => (int) $json['count']['blue'],
			'star_red' => (int) $json['count']['red'],
			'star_green' => (int) $json['count']['green'],
			'star_yellow' => (int) $json['count']['yellow']
		);
	}

	/**
	 * はてブのプロフィールページのHTMLのパース
	 * @param  string $html   html文字列
	 * @param  string $userid ユーザーのID
	 * @return int
	 */
	private static function parse_hateb_user_follower($html, $userid){
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

	/**
	 * 複数のはてなユーザーの情報を取得
	 * @param  array $user_list ユーザーの配列
	 * @return array
	 */
	public static function fetch_hateb_users_info($user_list){
		$mh = curl_multi_init();
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
				$info = curl_getinfo($ch);
				$error = curl_error($connection[$userid][$type]);
				if($error == '' && $info['http_code'] == 200){
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

	public function fetch_bookmark_info($url){
		$curl = new CurlWrapper();
		$result = json_decode( $curl->fetch(sprintf(self::HATEB_API, rawurlencode($url))), true );
		if($curl->is_ok()){
			return $result;
		}else{
			return null;
		}
	}

}