<?php
$url = rawurldecode($_REQUEST['url']);
if(empty($url)){
	echo false;
	die;
}
//$result = file_get_contents($url);
//var_dump($result);
$ch = curl_init(); // はじめ
$headers = array(
    "User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:26.0) Gecko/20100101 Firefox/26.0"
);

//オプション
curl_setopt($ch, CURLOPT_URL, $url); 
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
$html =  curl_exec($ch);
$info = curl_getinfo($ch);//この関数で取得
curl_close($ch); //終了
if($info['http_code'] !== 200){
	echo false;
	die;
}
header("Content-type: application/xml; charset=UTF-8");
echo $html;