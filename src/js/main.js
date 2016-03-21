import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';
import Feed from './components/Feed';
import StorageCache from './StorageCache';

class BetterHotentry{
	constructor(){
		this.rssUrls = {
			hotentry: 'http://feeds.feedburner.com/hatena/b/hotentry',
			new: 'http://b.hatena.ne.jp/entrylist?mode=rss'
		};
		var storageCache = new StorageCache();
		storageCache.sweepCache((key, value) => {
			return value.expires < storageCache.getNow();
		});
	}

	init(){
		ReactDom.render(
			<Feed rssUrls={this.rssUrls} cacheExpires={this.cacheExpires}/>,
			document.getElementById('container')
		);
	}
}

var main = new BetterHotentry();
main.init();