<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/Constant.php');
require_once (dirname(__FILE__) . '/lib/DataBase.php');
require_once (dirname(__FILE__) . '/lib/Cache.php');
require_once (dirname(__FILE__) . '/Hatena.php');
class Users extends DataBase{
	const EXPIRES_UNIXTIME = 604800;//60 * 60 * 24 * 7;
	public $statics;
	public function __construct(){
		parent::__construct();
		$this->statics = $this->get_statics();
		$this->cache = new Cache(USER_SCORE_CAHCE_EXPIRES, false, USER_SCORE_CAHCE_DIR);
	}

	/**
	 * ユーザーをDBに追加
	 * @param string $userid はてなユーザーID
	 */
	public function add_user($userid){
		if(empty($userid)){
			return false;
		}
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('INSERT IGNORE INTO ' . $this->user_table_name . ' (name, priority) VALUES (:userid, :priority)');
			$sth->bindValue(':priority', 1, PDO::PARAM_INT);
			$sth->bindParam(':userid', $userid, PDO::PARAM_STR);
			$result = $sth->execute();
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * スターを更新する対象を取得
	 * @param  integer $limit 更新する最大数
	 * @return array
	 */
	public function get_star_update_queue_list($limit = 100){
		$expires = time() - self::EXPIRES_UNIXTIME;
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT * FROM ' . $this->user_table_name . ' WHERE priority >= 0 OR last_updated < :expires ORDER BY priority DESC, last_updated LIMIT 0, :limit');
			$sth->bindParam(':limit', $limit, PDO::PARAM_INT);
			$sth->bindParam(':expires', $expires, PDO::PARAM_INT);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * スコアを更新する対象を取得
	 * @return array
	 */
	public function get_score_update_queue_list(){
		$expires = time() - self::EXPIRES_UNIXTIME;
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT * FROM ' . $this->user_table_name . ' WHERE ((star_yellow IS NOT NULL) AND (star_green IS NOT NULL) AND (star_red IS NOT NULL) AND (star_blue IS NOT NULL) AND (star_purple IS NOT NULL)) OR followers IS NOT NULL');
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * ユーザースコアを計算
	 * @param  array $star スター
	 * @return integer
	 */
	private function calc_user_score($star_count, $followers){
		//黄 + 緑 * 2 + 赤 * 4 + 青 * 25 + 紫 * 256
		if(is_array($star_count)){
			$star = $star_count['star_yellow'] + $star_count['star_green'] * 2 + $star_count['star_red'] * 4 + $star_count['star_blue'] * 25 + $star_count['star_purple'] * 256;
		}else{
			$star = 0;
		}
		$star_log = log($star, 10);
		if($star_log < 0){
			$star_log = 0;
		}
		if($followers === false){
			$followers = 0;
		}
		return $star_log + $followers;
	}

	/**
	 * ユーザーのスターを更新
	 * @param  string $userid はてなユーザーID
	 * @return boolean
	 */
	public function update_user_star($user, $star_count, $followers, $no_last_update = false){
		$user['priority'] = 0;
		if($user['score_log10'] < 0){
			$user['score_log10'] = 0;
		}
		$user['last_updated'] = time();
		//$user['followers'] = $followers;
		$user['score'] = $this->calc_user_score($star_count, $followers);
		$user['score_log10'] = log($user['score'], 10);
		if(
			(
				(!isset($user['star_yellow']) || is_null($user['star_yellow'])) ||
					(!isset($user['star_green']) || is_null($user['star_green'])) ||
					(!isset($user['star_red']) || is_null($user['star_red'])) ||
					(!isset($user['star_blue']) || is_null($user['star_blue'])) ||
					(!isset($user['star_purple']) || is_null($star_purple['star_yellow']))
				) && $star_count === false
		){
			$user['star_yellow'] = null;
			$user['star_green'] = null;
			$user['star_red'] = null;
			$user['star_blue'] = null;
			$user['star_purple'] = null;
		}else if($star_count !== false){
			foreach ($star_count as $key => $value) {
				$user[$key] = $value;
			}
		}

		if( (!isset($user['followers']) || is_null($user['followers'])) && $followers === false){
			$user['followers'] = null;
		}else if($followers !== false){
			$user['followers'] = $followers;
		}
		$query = 'UPDATE ' . $this->user_table_name . ' SET score=:score, score_log10=:score_log10, priority=:priority, star_yellow=:star_yellow, star_green=:star_green, star_red=:star_red, star_blue=:star_blue, star_purple=:star_purple, followers=:followers';
		if(!$no_last_update){
			$query .= ', last_updated=:last_updated';
		}
		$query .= ' WHERE name=:userid';
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare($query);
			$sth->bindValue(':priority', 0, PDO::PARAM_INT);
			$sth->bindParam(':userid', $user['name'], PDO::PARAM_STR);
			$sth->bindParam(':score', $user['score'], PDO::PARAM_STR);
			$sth->bindParam(':score_log10', $user['score_log10'], PDO::PARAM_STR);
			$sth->bindParam(':star_yellow', $user['star_yellow'], PDO::PARAM_INT);
			$sth->bindParam(':star_green', $user['star_green'], PDO::PARAM_INT);
			$sth->bindParam(':star_red', $user['star_red'], PDO::PARAM_INT);
			$sth->bindParam(':star_blue', $user['star_blue'], PDO::PARAM_INT);
			$sth->bindParam(':star_purple', $user['star_purple'], PDO::PARAM_INT);
			if(!$no_last_update){
				$sth->bindParam(':last_updated', $user['last_updated'], PDO::PARAM_INT);
			}
			$sth->bindParam(':followers', $user['followers'], PDO::PARAM_INT);
			$result = $sth->execute();
			echo $user['name'] . ' ';
			return $user;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * ユーザーのスターをまとめて更新
	 * @param  array $queue_list 更新対象
	 * @return array
	 */
	public function update_users_star($queue_list){
		echo "\nstar update start\n";
		$start = microtime(true);
		$result = HatenaAPI::fetch_hateb_users_info($queue_list);
		foreach ($queue_list as $key => $user) {
			$star_count = $result[$user['name']]['star'];
			$followers = $result[$user['name']]['followers'];
			if($star_count !== false && $followers !== false){
				$queue_list[$key] = $this->update_user_star($user, $star_count, $followers);
			}else{
				echo "\e[31m" . $user['name'] . "m";
			}
		}
		echo "\nstar update end " . (microtime(true) - $start) . 'sec';
		return $queue_list;
	}

	/**
	 * 全ユーザーの情報をDBから取得
	 * @return array
	 */
	public function get_users_data($ordeyby = 'score',$limit = false){
		$query = 'SELECT * FROM ' . $this->user_table_name;
		if(is_numeric($limit)){
			$query .=  ' LIMIT 0, :limit';
		}
		try{
			$dbh = $this->connection();
			//score
			$sth = $dbh->prepare($query);
			if(is_numeric($limit)){
				$sth->bindParam(':limit', $limit, PDO::PARAM_INT);
			}
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	//karma
	/**
	 * ユーザーのカルマを更新する対象を取得
	 * @param  boolean $all 対象を全ユーザーにするかのフラグ
	 * @return boolean
	 */
	public function get_karma_update_queue_list($limit = false){
		try{
			$dbh = $this->connection();
			$query = 'SELECT * FROM ' . $this->user_table_name;
			if($limit === false){
				$query .= ' WHERE (karma IS NULL AND score IS NOT NULL)';
			}
			$query .= ' ORDER BY score DESC';
			if(is_numeric($limit)){
				$query .= ' LIMIT 0, :limit';
			}
			$sth = $dbh->prepare($query);
			if(is_numeric($limit)){
				$sth->bindParam(':limit', $limit, PDO::PARAM_INT);
			}
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}	
	}

	/**
	 * ユーザーのカルマを計算
	 * @param  float $score_log10 スコアの常用対数の底
	 * @return float
	 */
	private function calc_user_karma($score_log10){
		return $score_log10 - $this->statics['median'] / 2;
	}

	/**
	 * ユーザーのカルマをまとめて更新
	 * @param  array $queue_list 更新対象
	 * @return queue_list
	 */
	public function update_users_karma($queue_list){
		echo "\nkarma update start\n";
		$this->statcis = $this->update_statics();
		$start = microtime(true);
		foreach ($queue_list as $key => $user) {
			$queue_list[$key] = $this->update_user_karma($user, array($this, 'calc_user_karma'));
		}
		echo "\nkarma update end " . (microtime(true) - $start) . 'sec';
		return $queue_list;
	}

	/**
	 * ユーザーのカルマを更新
	 * @param  array $user           DBから取得したユーザー情報
	 * @param  array $karma_calc_fnc カルマを計算する関数を指定する配列
	 * @return null
	 */
	private function update_user_karma($user, $karma_calc_fnc){
		$user['karma'] = call_user_func($karma_calc_fnc, $user['score_log10']);
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('UPDATE ' . $this->user_table_name . ' SET karma=:karma WHERE name=:name');
			$sth->bindParam(':karma', $user['karma'], PDO::PARAM_INT);
			$sth->bindParam(':name', $user['name'], PDO::PARAM_INT);
			$sth->execute();
			//echo $user['name'] . ' ';
			return $user;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * ユーザーリストから合計カルマを取得
	 * @param  array $users          ユーザーIDのリスト
	 * @param  int $read_later_num 「後で読む」の数
	 * @return int
	 */
	public function get_karma_sum($users, $read_later_num, $bookmark_count){
		if(!is_array($users) && is_string($users)){
			$users = array($users);
		}
		if(empty($users)){
			return null;
		}
		$query_where = array();
		foreach ($users as $userid) {
			$query_where[]= '?';
		}
		$query = 'SELECT * FROM ' . $this->user_table_name . ' WHERE (name IN (' . implode(', ', $query_where) . ')) AND karma IS NOT NULL';
		try{	
			$dbh = $this->connection();
			$sth = $dbh->prepare($query);
			foreach ($users as $key => $userid) {
				$sth->bindValue($key + 1, $userid, PDO::PARAM_STR);
			}
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			usort($result, function($users){
				return function($a, $b) use ($users){
					$a_index = array_search($a['name'], $users);
					$b_index = array_search($b['name'], $users);
					return $b_index - $a_index;
				};
			});
			$score = 0;
			$fixed_score = 0;
			foreach ($result as $key => $user) {
				if($key < 3){
					$rato = 1;
				}else{
					$rato = 1 / sqrt( sqrt(ceil( ($key - 2) / 10 )) );
				}
				$score += $user['karma'];
				$fixed_score += ($user['karma'] * $rato);
			}
			//var_dump(array_search('jtw', $users));
			//$result = ($result[0]);
			return array(
				'score' => $score,
				'fixed_score' => $fixed_score
			);
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	/**
	 * 各種統計値を更新
	 * @return array
	 */
	private function update_statics(){
		//$this->update_users_score();
		$dbh = $this->connection();
		//avg
		$sth = $dbh->prepare('SELECT AVG(score_log10) FROM ' . $this->user_table_name . ' WHERE score_log10 >= 0');
		$sth->execute();
		$avg = $sth->fetchAll(PDO::FETCH_COLUMN);
		$avg = $avg[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'avg', PDO::PARAM_STR);
		$sth->bindValue(':value', $avg, PDO::PARAM_INT);
		$sth->execute();
		//std
		$sth = $dbh->prepare('SELECT STD(score_log10) FROM ' . $this->user_table_name . ' WHERE score_log10 >= 0');
		$sth->execute();
		$std = $sth->fetchAll(PDO::FETCH_COLUMN);
		$std = $std[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'std', PDO::PARAM_STR);
		$sth->bindValue(':value', $std, PDO::PARAM_INT);
		$sth->execute();

		//max
		$sth = $dbh->prepare('SELECT MAX(score_log10) FROM ' . $this->user_table_name . ' WHERE score_log10 >= 0');
		$sth->execute();
		$max = $sth->fetchAll(PDO::FETCH_COLUMN);
		$max = $max[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'max', PDO::PARAM_STR);
		$sth->bindValue(':value', $max, PDO::PARAM_INT);
		$sth->execute();

		//min
		$sth = $dbh->prepare('SELECT MIN(score_log10) FROM ' . $this->user_table_name . ' WHERE score_log10 > 0');
		$sth->execute();
		$min = $sth->fetchAll(PDO::FETCH_COLUMN);
		$min = $min[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'min', PDO::PARAM_STR);
		$sth->bindValue(':value', $min, PDO::PARAM_INT);
		$sth->execute();

		//median
		$sth = $dbh->prepare(
			'SELECT score_log10 FROM ' . $this->user_table_name . ' WHERE score_log10 > 0 ORDER BY score_log10'
		);
		$sth->execute();
		$score_log10_list = $sth->fetchAll(PDO::FETCH_COLUMN);
		$score_log10_list = array_unique($score_log10_list);
		$score_log10_list = array_merge(array_diff($score_log10_list, array("")));
		if(count($score_log10_list) % 2 === 0){
			$median = ($score_log10_list[ floor((count($score_log10_list) / 2) - 1) ] + $score_log10_list[ floor((count($score_log10_list) / 2)) ]) / 2;
		}else{
			$median = $score_log10_list[ floor(count($score_log10_list) / 2) ];
		}
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'median', PDO::PARAM_STR);
		$sth->bindValue(':value', $median, PDO::PARAM_INT);
		$sth->execute();

		return array(
			'avg' => $avg,
			'std' => $std,
			'max' => $max,
			'min' => $min,
			'median' => $median
		);
	}

	public function update_scores($users_list){
		foreach ($users_list as $user) {
			$star_count = array();
			foreach ($user as $key => $value) {
				if(strstr($key, 'star_')){
					$star_count[$key] = $value;
				}
			}
			$followers = $user['followers'];
			$this->update_user_star($user, $star_count, $followers, true);
		}
	}

	/**
	 * 統計値をDBから取得
	 * @return array
	 */
	private function get_statics(){
		$dbh = $this->connection();
		//statics
		$sth = $dbh->prepare('SELECT `key`, `value` FROM ' . $this->statistics_table_name . ' GROUP BY `key`');
		$sth->execute();
		$_statics = $sth->fetchAll(PDO::FETCH_ASSOC);
		$statics = array();
		foreach ($_statics as $_static) {
			$statics[$_static['key']] = $_static['value'];
		}
		return $statics;
	}
}