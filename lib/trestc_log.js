
const constants = require('../config/constants.js');

var _generalTag = '________________'
var _logByDefault = constants.LOG_BY_DEFAULT;


var _logSubsCriber = {};

/**
 * This section blablabla
 */
exports.changeByDefaultConfiguration = function(byDefaultLog){
	_logByDefault = byDefaultLog;
}


/**
 * This function adds subscriber to log
 */
exports.subscribeLogHandler = function(logtag,logfunction){
	if (typeof logtag === 'function'){
		logfunction = logtag;
		logtag = _generalTag;
	}

	if (_logSubsCriber[logtag] === undefined){
		_logSubsCriber[logtag] = [];
	}

	_logSubsCriber[logtag].push(logfunction);
};

/**
 * This function calls to log subscribed functions for a particular tag
 * if log object is in options or logCom by default is enabled
 */
exports.logRequest = function(reqLogObject,response,response_timestamp){
	if (reqLogObject.options.log === undefined){
		if (!_logByDefault){
			return false;
		}
		reqLogObject.options.log = {}
	}

	var tag = reqLogObject.options.log.tag === undefined?_generalTag:reqLogObject.options.log.tag;

	if (_logSubsCriber[tag] !== undefined){
		var requestLog = {
			httpOptions : reqLogObject.httpOptions,
			isHttps     : reqLogObject.isHttps,
			body        : reqLogObject.body,
		}

		for(var i in _logSubsCriber[tag]){
			_logSubsCriber[tag][i](
				reqLogObject.options.log,
				requestLog,
				reqLogObject.timestamp,
				response,
				response_timestamp);
		}
	}
};


/**
 * This section is used in module in order to allow or not debug
 */
var _DEBUG_MODE_ = true;

exports.error = function(){
	if (_DEBUG_MODE_){
		console.error(arguments);
	}
};

exports.log = function(){
	if (_DEBUG_MODE_){
		console.log(arguments);
	}
};