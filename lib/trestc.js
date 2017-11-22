
//Dependences
const request = require('./request.js');
const _log = require('./trestc_log');
const _rerr = require('./response_error');
const errors = require('../config/errors.js');

// Configurations
var _IMPLEMENTED_HTTP_METHODS_ = ['GET','POST','PUT','DELETE'];

/**
 * Http request wrapp functions
 */
exports.http = function(method,host,port,path,params,data,options,callback){
	//Check method exists
	if (_IMPLEMENTED_HTTP_METHODS_.indexOf(method)<0){
		return _rerr.process(errors.ERROR_METHOD_NOT_IMPLEMENTED,501,null,callback)
	}

	request.r(method,false,host,port,path,params,data,options,callback);
}
exports.https = function(method,host,port,path,params,data,options,callback){
	//Check method exists
	if (_IMPLEMENTED_HTTP_METHODS_.indexOf(method)<0){
		return _rerr.process(errors.ERROR_METHOD_NOT_IMPLEMENTED,501,null,callback)
	}

	request.r(method,true,host,port,path,params,data,options,callback);
}
exports.http_post = function(host,port,path,params,data,options,callback){
    request.r('POST',false,host,port,path,params,data,options,callback);
};
exports.http_get = function(host,port,path,params,options,callback){
    request.r('GET',false,host,port,path,params,null,options,callback);
};
exports.http_put = function(host,port,path,params,data,options,callback){
    request.r('PUT',false,host,port,path,params,data,options,callback);
};
exports.http_delete = function(host,port,path,params,data,options,callback){
    request.r('DELETE',false,host,port,path,params,data,options,callback);
};
exports.https_post = function(host,port,path,params,data,options,callback){
    request.r('POST',true,host,port,path,params,data,options,callback);
};
exports.https_get = function(host,port,path,params,options,callback){
    request.r('GET',true,host,port,path,params,null,options,callback);
};
exports.https_put = function(host,port,path,params,data,options,callback){
    request.r('PUT',true,host,port,path,params,data,options,callback);
};
exports.https_delete = function(host,port,path,params,data,options,callback){
    request.r('DELETE',true,host,port,path,params,data,options,callback);
};



/**
 *
 */
exports.on = _log.on;

