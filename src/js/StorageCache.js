import _ from 'lodash';
export default class StorageCache {

	constructor(storage = window.localStorage, experiod = 60 * 60, keyPrefix = 'c-'){
		this.storage = storage;
		this.experiod = experiod;
		this.keyPrefix = keyPrefix;
	}

	_getKey(name){
		return this.keyPrefix + name;
	}

	getNow(){
		return Math.floor(new Date() / 1000);
	}

	saveItem(name, value){
		var key = this._getKey(name);
		return this.storage.setItem(key, JSON.stringify(value));
	}

	loadItem(name){
		var key = this._getKey(name);
		return JSON.parse(this.storage.getItem(key));

	}

	sweepCache(func = () => { return true; }){
		_.forEach(Object.keys(this.storage), (key) => {
			if(key.indexOf(this.keyPrefix) === 0){
				if(func(key, this.loadItem(key))){
					this.storage.removeItem(key);
				}
			}
		});
	}

}