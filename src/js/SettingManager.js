import _ from 'lodash';
export default class SettingManager{
	constructor(keyName = 'setting'){
		this.strage = window.localStorage;
		this.keyName = keyName;
	}

	get(key){
		var _setting = JSON.parse(this.strage.getItem(this.keyName));
		if(!_.isPlainObject(_setting)){
			_setting = {};
		}
		if(_.isUndefined(key)){
			return _setting;
		}else{
			return _setting[key];
		}
	}

	save(...args){
		var key, value, _setting, func, that;
		if(_.isString(args[0])){
			key = args[0];
			value = args[1];
			_setting = {};
			_setting[key] = value;
			func = args[2];
			that = args[3];
		}else if(_.isPlainObject(args[0])){
			_setting = args[0];
			func = args[1];
			that = args[2];
		}

		this.strage.setItem('setting', JSON.stringify( _.defaultsDeep(_setting, this.get()) ));

		if(_.isFunction(func)){
			if(that){
				func.apply(that, _setting);
			}else{
				func.apply(this, _setting);
			}
		}
	}

	delete(key){
		var _setting = this.get();
		delete _setting[key];
		this.save(_setting);
	}

	deleteAll(){
		this.strage.removeItem(this.keyName);
	}
}