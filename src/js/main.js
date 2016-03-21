import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';
import {Router, Route, IndexRoute, Link, browserHistory} from 'react-router';
import Feed from './components/Feed';
import About from './components/About';
import StorageCache from './StorageCache';

class App extends React.Component{
	constructor(props){
		super(props);
		var storageCache = new StorageCache();
		storageCache.sweepCache((key, value) => {
			return value.expires < storageCache.getNow();
		});
	}

	render(){
		return(
			<div>
				{this.props.children}
			</div>
		);
	}
}
ReactDom.render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Feed}></IndexRoute>
			<Route path="about" component={About} />
			<Route path="new" component={Feed} />
		</Route>
	</Router>),
	document.getElementById('container')
);
/*class BetterHotentry{
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
main.init();*/