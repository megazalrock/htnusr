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
					ころころ変わるので<a href="http://megazalrock.hatenablog.com/archive/category/bh.mgzl.jp" target="_blank">ブログ</a>に書いていくことにしました。
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