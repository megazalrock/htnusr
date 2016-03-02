<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/lib/DataBase.php');
require_once (dirname(__FILE__) . '/Hatena.php');
class Users extends DataBase{
	public function add_user($userid){
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

	private function update_user($userid){
		$star_count = HatenaAPI::get_hateb_user_star($userid);
		$score_log10 = log($star_count['score'], 10);
		if($score_log10 < 0){
			$score_log10 = 0;
		}
		$last_updated = time();
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('UPDATE ' . $this->user_table_name . ' SET last_updated=:last_updated, priority=:priority, star_yellow=:star_yellow, star_green=:star_green, star_red=:star_red, star_blue=:star_blue, star_purple=:star_purple WHERE name=:userid');
			$sth->bindValue(':priority', 0, PDO::PARAM_INT);
			$sth->bindParam(':userid', $userid, PDO::PARAM_STR);
			//$sth->bindParam(':score', $star_count['score'], PDO::PARAM_STR);
			$sth->bindParam(':star_yellow', $star_count['yellow'], PDO::PARAM_INT);
			$sth->bindParam(':star_green', $star_count['green'], PDO::PARAM_INT);
			$sth->bindParam(':star_red', $star_count['red'], PDO::PARAM_INT);
			$sth->bindParam(':star_blue', $star_count['blue'], PDO::PARAM_INT);
			$sth->bindParam(':star_purple', $star_count['purple'], PDO::PARAM_INT);
			//$sth->bindParam(':score_log10', $score_log10, PDO::PARAM_STR);
			$sth->bindParam(':last_updated', $last_updated, PDO::PARAM_INT);
			$result = $sth->execute();
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	public function get_queue_list($limit = 100){
		$experiod = time() - 60 * 60 * 24 * 7;
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT name FROM ' . $this->user_table_name . ' WHERE priority >= 1 OR last_updated <= :experiod ORDER BY last_updated DESC LIMIT 0, :limit');
			$sth->bindParam(':limit', $limit, PDO::PARAM_INT);
			$sth->bindParam(':experiod', $experiod, PDO::PARAM_INT);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_COLUMN);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	public function update_users($limit = 100){
		$queue_list = $this->get_queue_list($limit);
		foreach ($queue_list as $userid) {
			$this->update_user($userid);
		}
		$this->update_users_karma();
		return $queue_list;
	}

	private function update_statics(){
		$this->update_users_score();
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
		unset($score_log10_list[0]);
		unset($score_log10_list[count($score_log10_list) - 1]);
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

	private function get_users_statics(){
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

	public function get_users_data(){
		try{
			$dbh = $this->connection();
			//score
			$sth = $dbh->prepare('SELECT * FROM ' . $this->user_table_name. ' ORDER BY karma DESC');
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}

	}

	private function update_users_karma(){
		$statics = $this->update_statics();
		$users_list = $this->get_users_data();
		$case = array();
		foreach ($users_list as $user) {
			$karma = $user['score_log10'] - ($statics['median'] / 2);

			try{
				$dbh = $this->connection();
				$sth = $dbh->prepare('UPDATE ' . $this->user_table_name . ' SET karma=:karma WHERE name=:name');
				$sth->bindParam(':karma', $karma, PDO::PARAM_INT);
				$sth->bindParam(':name', $user['name'], PDO::PARAM_INT);
				$sth->execute();
			}catch(PDOException $e){
				echo $e->getMessage();
			}
		}
	}

	private function update_users_score(){
		$users_list = $this->get_users_data();
		foreach ($users_list as $user) {
			$color_star = $user['star_green'] * 2 + $user['star_red'] * 4 + $user['star_blue'] * 25 + $user['star_purple'] * 256;
			$yellow_star_log = log($user['star_yellow'], 10);
			if($yellow_star_log < 0){
				$yellow_star_log = 0;
			}
			$score = $color_star + $yellow_star_log;

			$score_log10 = log($score * 10, 10);
			if($score_log10 < 0){
				$score_log10 = 0;
			}
			try{
				$dbh = $this->connection();
				$sth = $dbh->prepare('UPDATE ' . $this->user_table_name . ' SET score=:score, score_log10=:score_log10 WHERE name=:name');
				$sth->bindParam(':score', $score, PDO::PARAM_INT);
				$sth->bindParam(':score_log10', $score_log10, PDO::PARAM_INT);
				$sth->bindParam(':name', $user['name'], PDO::PARAM_INT);
				$sth->execute();
			}catch(PDOException $e){
				echo $e->getMessage();
			}
			echo $user['name'] . '<br>';
		}

	}

	public function get_users_score($users, $read_later_num){
		if(!is_array($users) && is_string($users)){
			$users = array($users);
		}
		$query_where = array();
		foreach ($users as $userid) {
			$query_where[]= '?';
		}
		$query = 'SELECT SUM(karma) FROM ' . $this->user_table_name . ' WHERE (name IN (' . implode(', ', $query_where) . ')) AND score > 0';
		try{	
			$dbh = $this->connection();
			$sth = $dbh->prepare($query);
			foreach ($users as $key => $userid) {
				$sth->bindValue($key + 1, $userid, PDO::PARAM_STR);
			}
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_COLUMN);
			return $result[0] - $read_later_num;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

}