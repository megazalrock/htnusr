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
		$score = HatenaAPI::get_hateb_user_score($userid);
		$score_log10 = log($score, 10);
		if($score_log10 < 0){
			$score_log10 = 0;
		}
		$last_updated = time();
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('UPDATE ' . $this->user_table_name . ' SET score=:score, score_log10=:score_log10, last_updated=:last_updated, priority=:priority WHERE name=:userid');
			$sth->bindValue(':priority', 0, PDO::PARAM_INT);
			$sth->bindParam(':userid', $userid, PDO::PARAM_STR);
			$sth->bindParam(':score', $score, PDO::PARAM_STR);
			$sth->bindParam(':score_log10', $score_log10, PDO::PARAM_STR);
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

	public function update_users(){
		$queue_list = $this->get_queue_list();
		foreach ($queue_list as $userid) {
			$this->update_user($userid);
		}
		$this->update_users_karma();
		return $queue_list;
	}

	private function update_statics(){
		$dbh = $this->connection();
		//avg
		$sth = $dbh->prepare('SELECT AVG(score_log10) FROM ' . $this->user_table_name . ' WHERE score >= 0');
		$sth->execute();
		$avg = $sth->fetchAll(PDO::FETCH_COLUMN);
		$avg = $avg[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'avg', PDO::PARAM_STR);
		$sth->bindValue(':value', $avg, PDO::PARAM_INT);
		$sth->execute();
		//std
		$sth = $dbh->prepare('SELECT STD(score_log10) FROM ' . $this->user_table_name . ' WHERE score >= 0');
		$sth->execute();
		$std = $sth->fetchAll(PDO::FETCH_COLUMN);
		$std = $std[0];
		$sth = $dbh->prepare('UPDATE ' . $this->statistics_table_name . ' SET `value`=:value WHERE `key`=:key');
		$sth->bindValue(':key', 'std', PDO::PARAM_STR);
		$sth->bindValue(':value', $std, PDO::PARAM_INT);
		$sth->execute();

		return array(
			'avg' => $avg,
			'std' => $std
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

	private function get_users_score(){
		try{
			$dbh = $this->connection();
			//score
			$sth = $dbh->prepare('SELECT name, score, score_log10 FROM ' . $this->user_table_name . ' WHERE score >= 0');
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}

	}

	private function update_users_karma(){
		
		$statics = $this->update_statics();
		$users_list = $this->get_users_score();
		$case = array();
		foreach ($users_list as $user) {
			//$case[] = 'WHEN `' . $user['name'] . '` THEN `' . (($statics['avg'] - $user['score']) / $statics['std'] * 10 + 50 . '`');
			//$case[] = 'WHEN `' . $user['name'] . '` THEN `100`';
			$karma = (($user['score_log10'] - $statics['avg']) / $statics['std']) * 10 + 50;

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

}