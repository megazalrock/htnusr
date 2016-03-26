import React from 'react';
export default class About extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		return (
			<div className="about">
				<h2>このサイトについて</h2>
				<p>
					はてなブックマークのホットエントリーにブックマークしたユーザーから独自に計算した記事のスコアを表示しています。<br />
					新着エントリーも見れますし、ブコメもその場で表示できます。<br />
					ブコメもスターの多い順にソートしたいのですが、ブコメのパーマリンクごとにはてなスターのAPIを叩かないといけないのでやめました。<br />
					（はてブのAPIのレスポンスに含めて欲しい）
				</p>
				<p>対応OSはGoogleChromeとiOS Safariです。他は面倒なので確認してませんが、まともなモダンブラウザならきっと動きます。</p>
				<h2>技術的なこと</h2>
				<p>
					さくらのレンタルサーバーでフロントエンドはReact+jQuery、バックエンドはPHP+MySQLで動いています。<br />
					Gulp、Browserify、Bable、LessCssあたりを使ってES6（JSX）で書いてます。<br />
					バックエンドでは特にフレームワークは使っていません。<br />
					RSSや各ユーザーのカルマはcronで定期的に実行しています。
				</p>
				<h3>記事のスコアの計算方法</h3>
				<p>
					スコアは主にブックマークしているユーザーに基いて計算しています。<br />
					バックエンドで各ユーザーの独自に計算した<strong>カルマ</strong>を保持していています。
				</p>
				<h3>ユーザーのカルマの計算方法</h3>
				<p>
					スター<strong>など</strong>から計算しています。<br />
					簡単に言うとスターをたくさんもらうとカルマが上がりますが、仮にイエロースターを1万個もらってもカルマはわずかしか増えません。<br />
					アップデートするうちに「など」の方が比重が大きくなっています。
				</p>
				<h3>記事の並び順</h3>
				<p>スコアのローディングが終わらないと並び替えができません。並び順は、localstrage内に保存されます。</p>
				<h4>はてな</h4>
				<p>
					はてなのRSSそのままの順番です。<a href="http://b.hatena.ne.jp/hotentry" target="_blank">人気エントリー</a>や<a href="http://b.hatena.ne.jp/entrylist?sort=hot" target="_blank">新着エントリー</a>とほぼ同じ並び順です。<br />
					"ほぼ"なのは、はてなのサイト上には表示されずRSSには表示されるものがあったり無かったりするという噂を聞いたことがあるからです。（曖昧）
				</p>
				<h4>スコア+日時</h4>
				<p>
					記事のスコアと日時をから計算した並び順です。Redditで利用されているアルゴリズムに、スコア・ブクマ比を足して算出した数値を元に並べています。<br />
					新しいものは上の方に表示され、スコアが高いものは上に留まりやすい、と考えて下さい。<br />
					詳しくは<a href="https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9" target="_blank">How Reddit ranking algorithms work</a>を見てください。<br />
					ただ、Redditでは「最初の10upvote = 次の100upvote」というスコア補正が入りますが、現状ではそこまで再現していません。<br />
					オススメの並び順です。
				</p>
				<h4>スコア</h4>
				<p>
					当初スコア順だけ実装するつもりだったのですが、微妙に使いづらいのであまりオススメできません。
				</p>
				<h4>日時</h4>
				<p>
					はてなのRSSは記事の時間ではなく、観測された時間（ホットエントリーに入った or 3ブクマついた）時点の時間が記述されているようなのですが、<br />
					何故かRSSの個々のアイテム自体は別の順番で並んでいます。（はてブ7不思議の1つ）
				</p>
				<h2>作った人</h2>
				<p>
					Twitter : <a href="https://twitter.com/megazal_rock" target="_blank">@megazal_rock</a><br />
					はてな : <a href="http://profile.hatena.ne.jp/megazalrock/" target="_blank">megazalrock</a>
				</p>
				<h2>作った動機</h2>
				<p><a href="http://b.hatena.ne.jp/entry/280399009/comment/megazalrock" target="_blank">思いつき</a>です。</p>
			</div>
		);
	}
}