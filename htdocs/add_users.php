<?php
//require_once ('../app/Hatena.php');
require_once (dirname(__FILE__) . '/../app/Users.php');
$users = new Users();
$user_list = $_REQUEST['users'];
/*$user_list = array("taberareruyasou","masayo08765","hatomugicha","coolpix","toshiyukino","momonouchi1","freestyleblog","naggg","yo1994","akiakane_1109","charismanbou","hotelsekininsya","shinichikudoh","Okaz","martaka","tnkke3sc","yoshikoyamazil","jiwer5959","gurutakezawa","marumaru_sankaku","ryosuke8","nekora","user8107","lbtmplz","rartan","saitamawasshoi","eijiasakura9281","s35253387","skt244","n314","byosoku_boku","Hashi_Takahiro","yamashiro0110","kaionji","robertgabishan","koartist","doodleon","tg30yen","rararaman","saxoxhi","yuto2805","AKIMOTO","jitsuzon","yuki-inoue08100725","htamaaki","uoz","t_mina","supu6000","masakuroy","tsry9000","nobu666","tangeikujira","Josequervo","k2k2monta","tsunge0714","reasonofreason","fwd0039","aLa","weep","tkosuga","sharp_m","shaki_shaki","dpdp","l3l","usutaru","jojojojoen","taskapremium","lovevoiceryu","monomonomo","waribashiwareta","alpi-co","yuuntim","MoneyReport","yurikago12","chicken_geek","seo-sem-hp","T_Tachibana","chikoshoot","ymif","cheeeee731","k-tachikawa1028","maple_magician","tran9uility","mugingo","mmdawson","sizx","aoternative","out5963","YukeSkywalker","kazoo_oo","uunfo","hinail","tharunobu","namicky","yellowbell","Laylack","abababababababa","atuminc","neachi","hiro-458","hac20380","chinpokomon_master","Rishatang","gyoki","rajahbrooke","OkadaHiroshi","seizethelife","yuki1995jp","nashiyasan","yotafer","monochrome_K2","ntakanashi","inaba629","toaruR","NAMEOVER","gnufrfr","trade_heaven","cheap_watchdog","H_YKJ","zakki_51","kzm1760","attic2","rti7743","kazumae","bookboy","daiki_17","sigwyg","ykhmfst2012","nami-hey75","fazz0611","switch7","kankichi20","y-kawaz","djehgrtnlr","hiro2460","j_naito","toney1104","isgk","i7241126","nijikoange","oxy_oxynotes","tpircs","enemyoffreedom","clapon","azumaon","Gustav13","toronei","hanabi_si","yujing_musume","nabinno","kantei3","shag","luxsuperpoor","osakana110","raf00","kamkiri","deco3","netonlinejob","ichinotani","michiruler","artofnoise","tani_yanz","penguin-diary","senrisato","yatata","Rag-Rush","Bosssuke","noodlemaster","ikea_dless","kagoblo","akikonian","hisa_ino","djwdjw","dj_superaids","nnbus","Caerleon0327","morobitokozou","pukarix","kapiyvachang","richest21","enderuku","toshi20","tbsmcd","halmali","hiroyuke6","tomato1918s","gatsby485","ichijikuboy","suVene","yoiIT","Dursan","reijikan","TJATS4G","bedosaku","sny22015","parapara29","ghostbass","trois333","miragebrigade","megazalrock","ganot","negi_a","houyhnhm","ustam","hikata10","hilda_i","yatana240","ShinyaHirai","Rela930","yuki3mori","cloverstudioceo","astronomy710","teatime1515","NANA_NO1","dogear1988","yetch","kawatayuu","potekenpi","speed_star_99","hinopapa","norikk","mionosuke","isshoku","GOD_tomato","saikorohausu","dev0000_1","miyadai454","takefuji1106","g_Buchwald","koenjilala","takashi0314","doksensei","unkosama","ganchang1003","thesecret3","masatotachan","suiyujin","bijodokusho","kotosinokabu","minoru0707","tamasuji","infobloga","satoshie","masumizaru","ichiro2015","happy_222","yasuhiro1212","satorun1519","zheyang","yujtasaka","ochiaihideki","MISSILE","solidstatesociety","tottoko_8686","hidelax","togawa1110","kyoumoe","japan-tama","kaos2009","it_means","akira28","SaitoAtsushi","chisakichi","kilminwq","kkkk0515","yoshi-na","murishinai","kinokonoko_h","qwerton","htb48","TTTT2","dandy611","tensaychang");*/
if(empty($user_list)){
	die;
}

var_dump($user_list);
foreach ($user_list as $userid) {
	$users->add_user($userid);
}
//$users->update_users();
//var_dump($users->update_users());
//var_dump($users->update_users());
/*$users = $_REQUEST['users'];
$result = 0;
foreach ($users as $user) {
	$result += HatenaAPI::get_hateb_user_score($user);
}
echo $result;*/
/*var_dump(HatenaAPI::get_hateb_user_score('megazalrock'));
var_dump(HatenaAPI::get_hateb_user_score('comzoo'));
var_dump(HatenaAPI::get_hateb_user_score('guldeen'));
var_dump(HatenaAPI::get_hateb_user_score('pojihiguma'));*/
//var_dump(HatenaAPI::get_hateb_score('https://syncer.jp/hatebu-api-matome'));