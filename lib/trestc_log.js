
//Dependencies
const EventEmitter = require('events');
var evEm = new EventEmitter();

/**
 * 
 */
exports.logRequest = function(tag,trace){
	evEm.emit('requestStart',tag,trace);
};

/**
 * 
 */
exports.logResponse = function(tag,trace){
	evEm.emit('requestEnd',tag,trace);
};

/**
 * [on description]
 * @param  {[type]}   ev [description]
 * @param  {Function} cb [description]
 * @return {[type]}      [description]
 */
exports.on = function(ev,cb){
	evEm.on(ev,cb);
}


/**
 * This section is used in module in order to allow or not debug
 */
var _DEBUG_MODE_ = false;

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