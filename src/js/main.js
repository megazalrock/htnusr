/* global ga */
import React from 'react';
import ReactDom from 'react-dom';
import UaParser from 'ua-parser-js';
import Feed from './components/Feed';

class BetterHotentry{
	constructor(){
		this.rssUrls = {
			hotentry: 'http://feeds.feedburner.com/hatena/b/hotentry',//'http://b.hatena.ne.jp/hotentry?mode=rss',//http://feeds.feedburner.com/hatena/b/hotentry
			new: 'http://b.hatena.ne.jp/entrylist?mode=rss'
		};
	}

	init(){
		var uaparser = new UaParser();
		ReactDom.render(
			<Feed rssUrls={this.rssUrls} uaparser={uaparser}/>,
			document.getElementById('container')
		);
	}
}

var main = new BetterHotentry();
main.init();