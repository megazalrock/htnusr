import React from 'react';
import {Link} from 'react-router';
export default class Fotter extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		return(
			<footer className="globalFooter">
				<ul className="siteMap">
					<li><Link to="/" activeClassName="active">人気</Link></li>
					<li><Link to="/new" activeClassName="active">新着</Link></li>
					<li><Link to="/about" activeClassName="active">このサイトについて</Link></li>
					<li><Link to="/score" activeClassName="active">スコアだけ取得</Link></li>
				</ul>
				<small>
					Developed by Otto Kamiya(<a href="https://twitter.com/megazal_rock" target="_blank">@megazal_rock</a>)
				</small>
			</footer>
		);
	}
}