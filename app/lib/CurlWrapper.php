<?php
class CurlWrapper{
	private $ch;
	private $info;
	private $timeout;
	private $ua;

	function __construct($timeout = 10, $ua = "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36"){
		$this->ch = curl_init();
		$this->timeout = $timeout;
		$this->ua = $ua;
	}

	public function fetch($url){
		$headers = array($this->ua);
		curl_reset($this->ch);
		curl_setopt($this->ch, CURLOPT_URL, $url);
		curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($this->ch, CURLOPT_FRESH_CONNECT, true);
		curl_setopt($this->ch, CURLOPT_HTTPHEADER, $headers);
		curl_setopt($this->ch, CURLOPT_TIMEOUT, $this->timeout);
		$result =  curl_exec($this->ch);
		$this->info = curl_getinfo($this->ch);
		//curl_close($this->ch);
		return $result;
	}

	public function get_info(){
		return $this->info;
	}

	public function is_ok(){
		return $this->info['http_code'] == 200;
	}

	function __destruct(){
		curl_close($this->ch);
	}
}