import React from 'react';
import {render} from 'react-dom';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import Feed from './components/Feed/Feed';
import About from './components/About';
import Footer from './components/Footer';
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
				<Footer />
			</div>
		);
	}
}

render((
	<Router history={browserHistory} onUpdate={() => window.scrollTo(0, 0)}>
		<Route path="/" component={App}>
			<IndexRoute component={Feed} mode="hotentry"></IndexRoute>
			<Route path="about" component={About} />
			<Route path="new" component={Feed} mode="new" />
		</Route>
	</Router>),
	document.getElementById('container')
);