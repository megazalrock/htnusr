import _ from 'lodash';
export default class StorageCache {
	constructor(storage = window.localStorage, keyPrefix = 'c-'){
		this.storage = storage;
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

	loadItem(name, noprefix = false){
		var key = noprefix ? name : this._getKey(name);
		var value = this.storage.getItem(key);
		if(_.isUndefined(value)){
			return null;
		}else{
			return JSON.parse(value);
		}

	}

	sweepCache(conditionFnc = () => { return true; }){
		_.keys(this.storage).map((key) => {
			if(key.indexOf(this.keyPrefix) === 0 && conditionFnc.call(this, key, this.loadItem(key, true))){
				this.storage.removeItem(key);
			}
		});
	}

}