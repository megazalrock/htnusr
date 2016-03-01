<?php
date_default_timezone_set('Asia/Tokyo');
Class DataBase{
	private $config;
	public $user_table_name = 'users';
	public $statistics_table_name = 'users_statistics';
	public $feed_hot_table_name = 'feed_hot';
	public $feed_new_table_name = 'feed_new';
	function __construct(){
		$this->config = parse_ini_file(dirname(__FILE__) . '/../../config.ini');
		try{
			$dbh = $this->connection();
			$rs = $dbh->query('SHOW TABLES');
			$tables = $rs->fetchAll(PDO::FETCH_COLUMN);
			if(!in_array('users', $tables)){
				$sth = $dbh->prepare(
					"CREATE TABLE `users` (
						`name` tinytext NOT NULL,
						`karma` float DEFAULT NULL,
						`score` float DEFAULT NULL,
						`score_log10` float DEFAULT NULL,
						`last_updated` int(11) DEFAULT NULL,
						`priority` varchar(255) NOT NULL DEFAULT '0',
						`star_yellow` int(11) DEFAULT NULL,
						`star_green` int(11) DEFAULT NULL,
						`star_red` int(11) DEFAULT NULL,
						`star_blue` int(11) DEFAULT NULL,
						`star_purple` int(11) DEFAULT NULL,
						PRIMARY KEY (`name`(32)),
						UNIQUE KEY `UNIQUE` (`name`(32))
					) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
				);
				$sth->execute();
			}
			if(!in_array('feed_hot', $tables)){
				$sth = $dbh->prepare(
					"CREATE TABLE `feed_hot` (
						`id` char(40) NOT NULL DEFAULT '',
						`title` longtext,
						`link` longtext,
						`description` longtext,
						`html` longtext,
						`date` int(11) unsigned DEFAULT NULL,
						`category` longtext,
						`index` int(11) NOT NULL,
						PRIMARY KEY (`id`),
						UNIQUE KEY `UNIQUE` (`id`)
					) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
				);
				$sth->execute();
			}
			if(!in_array('feed_new', $tables)){
				$sth = $dbh->prepare(
					"CREATE TABLE `feed_new` (
						`id` char(40) NOT NULL DEFAULT '',
						`title` longtext,
						`link` longtext,
						`description` longtext,
						`html` longtext,
						`date` int(11) unsigned DEFAULT NULL,
						`category` longtext,
						`index` int(11) NOT NULL,
						PRIMARY KEY (`id`),
						UNIQUE KEY `UNIQUE` (`id`)
					) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
				);
				$sth->execute();
			}
			if(!in_array($this->statistics_table_name, $tables)){
				$sth = $dbh->prepare(
					"CREATE TABLE `users_statistics` (
						`id` int(11) unsigned NOT NULL AUTO_INCREMENT,
						`key` text,
						`value` longtext,
						PRIMARY KEY (`id`)
					) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
				);
				$sth->execute();
				$sth = $dbh->prepare('INSERT INTO ' . $this->statistics_table_name . ' (`key`) VALUES (:key)');
				$sth->bindValue(':key', 'avg', PDO::PARAM_STR);
				$sth->execute();
				$sth = $dbh->prepare('INSERT INTO ' . $this->statistics_table_name . ' (`key`) VALUES (:key)');
				$sth->bindValue(':key', 'std', PDO::PARAM_STR);
				$sth->execute();
				$sth = $dbh->prepare('INSERT INTO ' . $this->statistics_table_name . ' (`key`) VALUES (:key)');
				$sth->bindValue(':key', 'max', PDO::PARAM_STR);
				$sth->execute();
				$sth = $dbh->prepare('INSERT INTO ' . $this->statistics_table_name . ' (`key`) VALUES (:key)');
				$sth->bindValue(':key', 'median', PDO::PARAM_STR);
				$sth->execute();
			}
		}catch(PDOException $e){
			die($e->getMessage());
		}

	}
	public function connection(){
		$dsn = 'mysql:host=' . $this->config['host'] . ';dbname=' . $this->config['name'] . ';charset=utf8';
		try{
			$dbh = new PDO($dsn, $this->config['user'], $this->config['password']);
			$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			$dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
		}catch (PDOException $e){
			die($e->getMessage());
		}
		return $dbh;
	}
	/*
	public function add_user($userid){
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('INSERT IGNORE INTO ' . $this->htnusr_table_name . ' (name) VALUES (:userid)');
			$sth->bindParam(':userid', $userid, PDO::PARAM_STR);
			$result = $sth->execute();
			return $result;
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}*/


	/*public function save_source($source){
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('INSERT IGNORE INTO ' . $this->source_table_name . ' (success, done, url, yearmonth, unique_key) VALUES (:success, :done, :url, :yearmonth, :unique_key)');
			$sth->bindValue(':success', 0, PDO::PARAM_INT);
			$sth->bindValue(':done', 0, PDO::PARAM_INT);
			$sth->bindParam(':url', $source['url'], PDO::PARAM_STR);
			$sth->bindParam(':yearmonth', $source['yearmonth'], PDO::PARAM_INT);
			$sth->bindParam(':unique_key', $source['unique_key'], PDO::PARAM_STR);
			$result = $sth->execute();
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	public function get_queue($is_success = 0, $is_done = 0){
		$result = array();
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT * FROM ' . $this->source_table_name . ' WHERE success=:is_success AND done=:is_done ORDER BY yearmonth DESC');
			$sth->bindParam(':is_success', $is_success, PDO::PARAM_INT);
			$sth->bindParam(':is_done', $is_done, PDO::PARAM_INT);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
		}catch(PDOException $e){
			echo $e->getMessage();
		}
		return $result;
	}*/
}