<?php
date_default_timezone_set('Asia/Tokyo');
require_once (dirname(__FILE__) . '/Constant.php');
require_once (dirname(__FILE__) . '/lib/DataBase.php');
require_once (dirname(__FILE__) . '/Hatena.php');
require_once (dirname(__FILE__) . '/lib/Cache.php');
require_once (dirname(__FILE__) . '/Users.php');
Class Feed extends DataBase{
	const HOTENTRY_FEED_URL = 'http://feeds.feedburner.com/hatena/b/hotentry';
	const NEW_FEED_URL = 'http://b.hatena.ne.jp/entrylist?mode=rss';
	const FEED_MAX_NUM = 10000;

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

	private function parse_feed_data_html($html){	
		$dom = new DOMDocument();
		$dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
		$xpath = new DOMXPath($dom);
		$query = '//img[@class="entry-image"]/@src';
		$entry_image = $xpath->evaluate('string(' . $query . ')');
		if(empty($entry_image)){
			$entry_image = null;
		}
		return array(
			'entry-image' => $entry_image
		);
	}

	public function parse_feed_data($type){
		$feed = $this->fetch_feed($type);
		$xml_object = new SimpleXMLElement($feed, LIBXML_NOCDATA);
		$items = array();
		foreach ($xml_object->item as $_item) {
			$link = (string) $_item->link;
			$date = strtotime($_item->children('dc', true)->date);
			$html = $_item->children('content', true);
			$html_array =  $this->parse_feed_data_html($html);
			$items[] = array(
				'title' => (string) $_item->title,
				'link' => $link,
				'description' => (string) $_item->description,
				'date' => $date,
				'category' => (string) $_item->children('dc', true)->subject,
				'html' => (string) serialize($html_array),
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
		$feed = array_reverse($feed);
		$max_index = $this->get_max_index($type);
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


	public function get_feed_data($type, $encodeJson = true, $order = 'ASC', $limit = null){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		try{
			$query = 'SELECT * FROM ' . $table_name . ' ORDER BY `index`';
			if($order == 'DESC'){
				$query = $query . ' ' . $order;
			}
			if(is_numeric($limit)){
				$query = $query . ' LIMIT 0, ' . $limit;
			}
			$dbh = $this->connection();
			$sth = $dbh->prepare($query);
			$sth->execute();
			$result = $sth->fetchAll(PDO::FETCH_ASSOC);
			foreach ($result as $key => $feed_item) {
				if(mb_strstr($feed_item['html'], '<blockquote')){
					$result[$key]['html'] = $this->parse_feed_data_html($feed_item['html']);
				}else{
					$result[$key]['html'] = unserialize($feed_item['html']);
				}
			}
			if($encodeJson){
				return json_encode($result);
			}else{
				return $result;
			}
		}catch(PDOException $e){
			echo $e->getMessage();
		}
	}

	public function get_feed_json($type, $limit){
		return $this->get_feed_data($type, true, 'DESC', $limit);
	}

	private function update_index($type){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		$feed = $this->get_feed_data($type, false, 'ASC');
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
				$sth = $dbh->prepare('DELETE FROM ' . $table_name . ' WHERE `index` < :index');
				$sth->bindValue(':index', $over_num , PDO::PARAM_INT);
				$sth->execute();
				echo "Delete ${over_num} items";
			}catch(PDOException $e){
				echo $e->getMessage();
			}
			$this->update_index($type);
		}
	}

	public function update_feed_data($type, $id, $bookmark_data){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		try{
			$query = 'UPDATE ' . $table_name . ' SET bookmarkData=:bookmarkData WHERE id=:id';
			$dbh = $this->connection();
			$sth = $dbh->prepare($query);
			$sth->bindParam(':id', $id, PDO::PARAM_STR);
			$sth->bindParam(':bookmarkData', $bookmark_data, PDO::PARAM_STR);
			$result = $sth->execute();
			return $result;
		}catch(PDOException $e){
			return false;
		}
	}

	public function update_feed_score($type, $limit = 100){
		if($type === 'hotentry'){
			$table_name = $this->feed_hot_table_name;
		}else if($type === 'new'){
			$table_name = $this->feed_new_table_name;
		}
		
		$limit_time = time() - 60 * 60 * 24;
		$query = 'SELECT * FROM ' . $table_name . ' WHERE date > :date OR (score IS NULL OR bookmarkCount IS NULL) ORDER BY date DESC LIMIT 0, ' . $limit;
		$dbh = $this->connection();
		$sth = $dbh->prepare($query);
		$sth->bindValue(':date', $limit_time , PDO::PARAM_INT);
		$sth->execute();
		$result = $sth->fetchAll(PDO::FETCH_ASSOC);

		$users = new Users();
		$count = count($result);
		foreach ($result as $index => $feed_item) {
			$result = $this->get_url_score($feed_item['link']);
			if(!is_null($result['score']) && !is_null($result['bookmarkCount']) && !empty($result['bookmark_info'])){
				echo ($index + 1) ." / ${count} " . $result['bookmark_info']['title'] . "\n";
				$query = 'UPDATE ' . $table_name . ' SET score=:score, bookmarkCount=:bookmarkCount WHERE id=:id';
				$sth = $dbh->prepare($query);
				$sth->bindParam(':score', $result['score'] , PDO::PARAM_STR);
				$sth->bindParam(':id', $feed_item['id'] , PDO::PARAM_STR);
				$sth->bindParam(':bookmarkCount', $result['bookmarkCount'], PDO::PARAM_INT);
				$sth->execute();
			}
			usleep(0.5 * 1000000);
		}
	}

	public function get_url_score($link){
		$users = new Users();
		$bookmark_info = HatenaAPI::fetch_bookmark_info($link);
		$score = null;
		$bookmarkCount = null;
		if(!is_null($bookmark_info)){
			$bookmarkCount = $bookmark_info['count'];
			if(isset($bookmark_info['bookmarks'])){
				$user_list = [];
				foreach ($bookmark_info['bookmarks'] as $bookmark) {
					$user_list[] = $bookmark['user'];
				}
				$score = $users->get_karma_sum($user_list, 0, $bookmark_info['count']);
			}else{
				$score = null;
			}
		}else{
			$bookmarkCount = null;
			$score = null;
		}
		return array(
			'bookmark_info' => $bookmark_info,
			'bookmarkCount' => $bookmarkCount,
			'score' => $score
		);
	}

	public function update_feed(){
		echo 'Start fetch feed' . "\n";
		$this->save_feed($this->parse_feed_data('hotentry'), 'hotentry');
		$this->save_feed($this->parse_feed_data('new'), 'new');
		echo 'Start delete old Feed' . "\n";
		$this->delete_old_feed('hotentry');
		$this->delete_old_feed('new');
		echo 'Update hotentry feed score' . "\n";
		$this->update_feed_score('hotentry', FEED_NUM);
		echo 'Update new feed score' . "\n";
		$this->update_feed_score('new', FEED_NUM);
		echo 'Done !!';
	}
}
