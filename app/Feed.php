<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/Constant.php');
require_once (dirname(__FILE__) . '/lib/DataBase.php');
Class Feed extends DataBase{
	const HOTENTRY_FEED_URL = 'http://feeds.feedburner.com/hatena/b/hotentry';
	const NEW_FEED_URL = 'http://b.hatena.ne.jp/entrylist?mode=rss';
	const FEED_MAX_NUM = 100;

	private function fetch_feed($type){
		if($type === 'hotentry'){
			$url = self::HOTENTRY_FEED_URL;
		}else if($type === 'new'){
			$url = self::NEW_FEED_URL;
		}

		$ch = curl_init(); // はじめ
		$headers = array(
		    "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:26.0) Gecko/20100101 Firefox/26.0"
		);

		//オプション
		curl_setopt($ch, CURLOPT_URL, $url); 
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		$feed =  curl_exec($ch);
		$info = curl_getinfo($ch);
		curl_close($ch); //終了
		if($info['http_code'] !== 200){
			return false;
		}
		return $feed;
	}

	private function parse_feed_data($type){
		$feed = $this->fetch_feed($type);
		$xml_object = new SimpleXMLElement($feed, LIBXML_NOCDATA);
		$items = array();
		foreach ($xml_object->item as $_item) {
			$link = (string) $_item->link;
			$date = strtotime($_item->children('dc', true)->date);
			$items[] = array(
				'title' => (string) $_item->title,
				'link' => $link,
				'description' => (string) $_item->description,
				'date' => $date,
				'category' => (string) $_item->children('dc', true)->subject,
				'html' => (string) $_item->children('content', true),
				'id' => sha1($link . $date)
			);
		}
		return $items;
	}

	private function get_max_index($type){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT MAX(`index`) FROM ' . $table_name);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_COLUMN);
			return $result[0];
		}catch(PDOException $e){
			echo $e->getMessage();
		}

	}

	private function save_feed($feed, $type){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		$max_index = $this->get_max_index('hotentry');
		try{
			$sql = 'INSERT IGNORE INTO ' . $table_name . ' (id, title, link, description, date, category, html, `index`) VALUES ';
			$values = array();
			for($i = 0; $i < count($feed); $i++){
				$values[] = '(?, ?, ?, ?, ?, ?, ?, ?)';
			}
			$sql .= implode(', ', $values);
			$dbh = $this->connection();
			$sth = $dbh->prepare($sql);
			foreach ($feed as $key => $feed_item) {
				$values = array();
				$sth->bindParam($key * 8 + 1, $feed_item['id'], PDO::PARAM_STR);
				$sth->bindParam($key * 8 + 2, $feed_item['title'], PDO::PARAM_STR);
				$sth->bindParam($key * 8 + 3, $feed_item['link'], PDO::PARAM_STR);
				$sth->bindParam($key * 8 + 4, $feed_item['description'], PDO::PARAM_STR);
				$sth->bindParam($key * 8 + 5, $feed_item['date'], PDO::PARAM_INT);
				$sth->bindParam($key * 8 + 6, $feed_item['category'], PDO::PARAM_STR);
				$sth->bindParam($key * 8 + 7, $feed_item['html'], PDO::PARAM_STR);
				$sth->bindValue($key * 8 + 8, $key + $max_index, PDO::PARAM_INT);
			}
			$sth->execute();

		}catch(PDOException $e){
			echo $e->getMessage();
		}

		$this->update_index($type);
	}


	public function get_feed_data($type, $encodeJson = true){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT * FROM ' . $table_name . ' ORDER BY `date` DESC');
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			if($encodeJson){
				return json_encode($result);
			}else{
				return $result;
			}
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	private function update_index($type){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		$feed = $this->get_feed_data($type);
		foreach ($feed as $key => $feed_item) {
			//$index = self::FEED_MAX_NUM - $key;
			try{
				$dbh = $this->connection();
				$sth = $dbh->prepare('UPDATE ' . $table_name . ' SET `index`=:index WHERE `id`=:id');
				$sth->bindParam(':index', $key, PDO::PARAM_INT);
				$sth->bindParam(':id', $feed_item['id'], PDO::PARAM_STR);
				$sth->execute();
			}catch(PDOException $e){
				echo $e->getMessage();
			}
		}
	}

	private function get_over_num($type){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		try{
			$dbh = $this->connection();
			$sth = $dbh->prepare('SELECT COUNT(*) FROM ' . $table_name);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_COLUMN);
			return $result[0] - self::FEED_MAX_NUM;
		}catch(PDOException $e){
			echo $e->getMessage();
		}


	}


	private function delete_old_feed($type){
		$over_num = $this->get_over_num($type);
		if($over_num > 0){
			if($type === 'hotentry'){
				$table_name = $this->feed_hot_table_name;
			}else if($type === 'new'){
				$table_name = $this->feed_new_table_name;
			}

			try{
				$dbh = $this->connection();
				$sth = $dbh->prepare('DELETE FROM ' . $table_name . ' WHERE `index` >= :index');
				$sth->bindValue(':index', self::FEED_MAX_NUM, PDO::PARAM_INT);
				$sth->execute();
			}catch(PDOException $e){
				echo $e->getMessage();
			}
			$this->update_index($type);
		}
	}

	public function update_feed(){
		$this->save_feed($this->parse_feed_data('hotentry'), 'hotentry');
		$this->save_feed($this->parse_feed_data('new'), 'new');
		$this->delete_old_feed('hotentry');
		$this->delete_old_feed('new');
		echo 'Done !!';
	}


}
