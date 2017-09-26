
// Dependences
const http  = require('http');
const https = require('https');
const constants = require('../config/constants.js');
const errors = require('../config/errors.js');
const querystring = require('querystring');
const _response = require('./response.js');
const _rerr = require('./response_error');
const _request_body = require('./request_body.js');
const _log = require('./trestc_log');


/**
 * Main of request. Is the first function that execute request and call rest of
 * modules.
 */
exports.r = function(httpMethod,isHttps,host,port,path,params,data,options,callback){
    //If exists path params, we add to query
    if (params!= null){
        var q = querystring.stringify(params);
        if (q != '')
            path += '?'+q;
    }

    //We get original parameters that will be usefull if we have to redirect
    var originalQueryRequest = _getOriginalRequestQuery(httpMethod,isHttps,host,port,path,params,data,options);

    //Default Options    
    var httpOptions = _getHttpOptionsOfRequest(httpMethod,host,port,path,options);

    //Get body
    var body = _request_body.getBodyOfRequest(httpMethod,options,data,httpOptions);
    if (body == null){
        return _rerr.process(errors.ERROR_PARSING_BODY_REQUEST,null,null,callback)
    }
    
    options.trace = true;
    //Object for trace to return
    var trace = _createTraceOfRequest(httpOptions,isHttps,data,body,options);

    //Log request if required
    _logRequest(trace,options);

    //Generating request
    _executeHttpRequest(httpOptions,isHttps,body,options,originalQueryRequest,trace,callback);
};

/**
 * This function execute a the http request
 */
var _executeHttpRequest = function(httpOptions,isHttps,body,options,originalQueryRequest,trace,callback){
	//Flag for avoid recallback problem found in some node versions
	var callbackit = true;

	//Select correct protocol
	var ohttp = isHttps?https:http;
    
    //Execute request
    var req = ohttp.request(httpOptions, function(res) {
        if (callbackit){
            callbackit = false;
            _response.r(res,options,trace,function(err,response,statusCode,ttrace,redirection){
                if (err != null){
                    callback(err,response,statusCode,ttrace);
                } else if (redirection !== undefined && redirection!=null){
                    _executeRedirection(redirection,originalQueryRequest,ttrace,callback);
                } else {
                    callback(null,response,statusCode,ttrace);
                }
            });
        }
    });
    
    //On error request callback handler
    req.on('error', function(e) {
        if (callbackit){
            callbackit = false;
            return _rerr.process(errors.ERROR_CONNECTION_TO_SERVER,null,trace,callback)
        }
    });
    
    //Implementing timeout on request
    var timeout = (typeof options.timeout == 'undefined')?constants.DEFAULT_TIMEOUT:options.timeout;
    if (timeout > 0){
        req.setTimeout(timeout,function () {
            if (callbackit){
                callbackit = false;
                req.abort();
                return _rerr.process(errors.ERROR_TIMEOUT_ON_REQUEST,null,trace,callback)
            }
        });
    }
    
    //Req execution
    if (body != null && body != '')
        req.write(body);
    req.end();
}

/**
 * This function is called when a redirection is received from server and we have to repeat
 * request to other new location
 */
var _executeRedirection = function(redirection,originalQueryRequest,trace,callback){
    if (typeof originalQueryRequest.options == 'undefined'){
        originalQueryRequest.options = {}
    }
    if (typeof originalQueryRequest.options.maxRedirects == 'undefined'){
        originalQueryRequest.options.maxRedirects = constants.MAX_REDIRECTION_DEPTH;
    }
    originalQueryRequest.options.maxRedirects--;
    if (originalQueryRequest.options.maxRedirects==0){
        return _rerr.process(errors.ERROR_INFINITE_REDIRECTIONS,null,trace,callback);
    }

    //Redirect
    exports.r(originalQueryRequest.httpMethod,
                redirection.isHttps,
                redirection.host,
                redirection.port,
                redirection.path,
                originalQueryRequest.params,
                originalQueryRequest.data,
                originalQueryRequest.options,
                callback);
};

/**
 * This options return an object with all original data of request. This object will be useful
 * later in redirects
 */
var _getOriginalRequestQuery = function(httpMethod,isHttps,host,port,path,params,data,options){
    return {
        httpMethod: httpMethod,
        isHttps   : isHttps,
        host      : host,
        port      : port,
        path      : path,
        options   : options,
        data      : data,
        params    : params
    }
};

/**
 * This function return http options of request 
 */
var _getHttpOptionsOfRequest = function(httpMethod,host,port,path,options){
	options = options || {};

	//Get default options
    var httpOptions = _getHttpDefaultOptions(httpMethod,host,port,path);
    
    //Check if auth
    _authOptions(httpOptions,options);
    
    //Adding request headers
    _addRequestHeaders(httpOptions,options);

    //Adding cert
    _addCertOptions(httpOptions,options);

    return httpOptions;
};

/**
 * This funciton return the http request default options
 */
var _getHttpDefaultOptions = function(httpMethod,host,port,path){
    var defOptions = {
        host     : host,
        port     : port,
        path     : path,
        encoding : 'utf8', //default encoding????
        //encoding: 'iso-8859-15',
        method   : httpMethod,
        headers  : {
        	'accept-encoding' : 'gzip, deflate' //DRM. By default we allow this but...
        },
    };
        
    return defOptions;
};

/**
 * This function add HTTP AUTH options to request if it's configured
 */
var _authOptions = function(httpOptions,options){
    if (typeof options.auth !== 'undefined' && options.auth.type !== undefined){
        switch(options.auth.type){
            case 'basic':
                if (options.auth.username !== undefined && options.auth.password !== undefined ){
                    httpOptions.auth = options.auth.username+':'+options.auth.password;
                }
                break;
        }
    }
};

/**
 * This function add HTTPs Cert options to request if it's configured
 */
var _addCertOptions = function(httpOptions,options){
    if (typeof options.cert !== 'undefined'){
        httpOptions.key = options.cert.key;
        httpOptions.cert = options.cert.cert;
        if (typeof options.cert.ca !== 'undefined'){
            httpOptions.ca = options.cert.ca;
        }
    }
};

/**
 * This function add custom header options given
 */
var _addRequestHeaders = function(httpOptions,options){
    options.headers = options.headers||{};
    
    for(var headertag in options.headers){
        var cshtag = headertag.toLowerCase();
        if ((cshtag == 'accept-encoding') && (options.headers[headertag] == '')){
            delete httpOptions.headers[cshtag];
            continue;
        }
        httpOptions.headers[cshtag] = options.headers[headertag];
    }
};


/**
 * This function check if trace is enabled in options and in that
 * case create trace object and set req field with information of request.
 * If disabled, return null
 */
var _createTraceOfRequest = function(httpOptions,isHttps,data,rawdata,options){
    if ((options.trace !== undefined && options.trace)||(options.log !== undefined && options.log !== null && options.log.tag !== undefined && options.log.tag != null)){
        return _getTrace(httpOptions,isHttps,data,rawdata,options);
    } else {
        return null;
    }
}

/**
 * This function call to logRequest funciton (if apply)
 */
var _logRequest = function(trace,options){
    if (options.log !== undefined && options.log !== null && options.log.tag !== undefined && options.log.tag != null){
        _log.logRequest(options.log.tag,trace.req)    
    }
};

/**
 * Return the trace object created with request data
 */
var _getTrace = function(httpOptions,isHttps,data,rawdata,options){
    var trace = {
        req : {
            protocol : isHttps?'https':'http',
            method   : httpOptions.method,
            host     : httpOptions.host,
            port     : httpOptions.port,
            path     : httpOptions.path,
            encoding : httpOptions.encoding,
            headers  : httpOptions.headers,
            body     : data,
            rawbody  : rawdata,
            timestamp: new Date(),
        }
    }
    return trace;
}