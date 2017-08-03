
//Dependences
const request = require('./request.js');
const _log = require('./trestc_log');

// Configurations
var _IMPLEMENTED_HTTP_METHODS_ = ['GET','POST','PUT','DELETE'];

/**
 * Http request wrapp functions
 */
exports.http = function(method,port,path,options,data,pathparams,callback){
	//Check method exists
	if (_IMPLEMENTED_HTTP_METHODS_.indexOf(httpMethod)<0){
		return callback({err:'TODO'});
	}

	request.r(method,false,host,port,path,options,data,pathparams,callback);
}
exports.https = function(method,port,path,options,data,pathparams,callback){
	//Check method exists
	if (_IMPLEMENTED_HTTP_METHODS_.indexOf(httpMethod)<0){
		return callback({err:'TODO'});
	}

	request.r(method,true,host,port,path,options,data,pathparams,callback);
}
exports.http_post = function(host,port,path,options,data,pathparams,callback){
    request.r('POST',false,host,port,path,options,data,pathparams,callback);
};
exports.http_get = function(host,port,path,options,data,pathparams,callback){
    request.r('GET',false,host,port,path,options,data,pathparams,callback);
};
exports.http_put = function(host,port,path,options,data,pathparams,callback){
    request.r('PUT',false,host,port,path,options,data,pathparams,callback);
};
exports.http_delete = function(host,port,path,options,data,pathparams,callback){
    request.r('DELETE',false,host,port,path,options,data,pathparams,callback);
};
exports.https_post = function(host,port,path,options,data,pathparams,callback){
    request.r('POST',true,host,port,path,options,data,pathparams,callback);
};
exports.https_get = function(host,port,path,options,data,pathparams,callback){
    request.r('GET',true,host,port,path,options,data,pathparams,callback);
};
exports.https_put = function(host,port,path,options,data,pathparams,callback){
    request.r('PUT',true,host,port,path,options,data,pathparams,callback);
};
exports.https_delete = function(host,port,path,options,data,pathparams,callback){
    request.r('DELETE',true,host,port,path,options,data,pathparams,callback);
};



/**
 * LOGS SECTION
 */
exports.changeByDefaultConfiguration = _log.changeByDefaultConfiguration;
exports.subscribeLogHandler = _log.subscribeLogHandler;

