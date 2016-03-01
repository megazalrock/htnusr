<?php
date_default_timezone_set('Asia/Tokyo');
class HatenaAPI{
	const STAR_API = 'http://s.hatena.ne.jp/blog.json?uri=%s';
	const HATEB_USER_PAGE = 'http://b.hatena.ne.jp/%s/';
	const HATEB_API = 'http://b.hatena.ne.jp/entry/jsonlite/?url=%s';

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
			$json = json_decode($json, true);
			return array(
				'score' => (float) self::calc_star($json['count']) + 1,
				'purple' => (int) $json['count']['purple'],
				'blue' => (int) $json['count']['blue'],
				'red' => (int) $json['count']['red'],
				'green' => (int) $json['count']['green'],
				'yellow' => (int) $json['count']['yellow']
			);
		}catch(Exception $e){
			return 0;
		}
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
}