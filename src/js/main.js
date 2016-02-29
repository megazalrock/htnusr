import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import ReactDom from 'react-dom';
import Feed from './components/Feed';

class BetterHotentry{
	constructor(){
		this.rssUrls = {
			hotentry: 'http://feeds.feedburner.com/hatena/b/hotentry',//'http://b.hatena.ne.jp/hotentry?mode=rss',//http://feeds.feedburner.com/hatena/b/hotentry
			new: 'http://b.hatena.ne.jp/entrylist?mode=rss'
		};
	}

	init(){
		ReactDom.render(
			<Feed rssUrls={this.rssUrls}/>,
			document.getElementById('container')
		);
	}
}

var main = new BetterHotentry();
main.init();