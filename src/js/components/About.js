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
					ブコメもスターの多い順にソートしたいのですが、ブコメのパーマリンクごとにはてなスターのAPIを叩かないといけないのでやめました。
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