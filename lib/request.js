
// Dependences
const http  = require('http');
const https = require('https');
const querystring = require('querystring');
const constants = require('../config/constants.js');
const errors = require('../config/errors.js');
const _response = require('./response.js');
const _rerr = require('./response_error');
const _log = require('./trestc_log');
const js2xmlparser = require("js2xmlparser");


/**
 * Request
 */
exports.r = function(httpMethod,isHttps,host,port,path,options,data,pathparams,callback){
    //If exists path params, we add to query
    if (pathparams!= null){
        var q = querystring.stringify(pathparams);
        if (q != '')
            path += '?'+q;
    }

    //We get original parameters that will be usefull if we have to redirect
    var originalQueryRequest = _getOriginalRequestQuery(httpMethod,isHttps,host,port,path,options,data,pathparams);

    //Default Options    
    var httpOptions = _getHttpOptionsOfRequest(httpMethod,host,port,path,options);

    //Get body
    var body = _getBodyOfRequest(httpMethod,options,data,httpOptions);
    if (body == null){
        return _rerr.process(errors.ERROR_PARSING_BODY_REQUEST,null,null,null,callback)
    }
    
    //Generating request
    _executeHttpRequest(httpOptions,isHttps,body,options,originalQueryRequest,callback);
};

/**
 * This function execute a the http request
 */
var _executeHttpRequest = function(httpOptions,isHttps,body,options,originalQueryRequest,callback){
    //Object for logging request
    var reqLogObject = {httpOptions:httpOptions,isHttps:isHttps,body:body,options:options,timestamp:new Date()};

	//Flag for avoid recallback problem found in some node versions
	var callbackit = true;

	//Select correct protocol
	var ohttp = isHttps?https:http;
    
    //Execute request
    var req = ohttp.request(httpOptions, function(res) {
        if (callbackit){
            callbackit = false;
            _response.r(res,options,reqLogObject,function(err,response,redirection,moreinfo){
                if (err != null){
                    callback(err);
                } else if (redirection !== undefined && redirection!=null){
                    _executeRedirection(redirection,originalQueryRequest,reqLogObject,callback);
                } else {
                    callback(null,response,moreinfo);
                }
            });
        }
    });
    
    //On error request callback handler
    req.on('error', function(e) {
        if (callbackit){
            callbackit = false;
            return _rerr.process(errors.ERROR_CONNECTION_TO_SERVER,null,null,reqLogObject,callback)
        }
    });
    
    //Implementing timeout on request
    var timeout = (typeof options.timeout == 'undefined')?constants.DEFAULT_TIMEOUT:options.timeout;
    if (timeout > 0){
        req.setTimeout(timeout,function () {
            if (callbackit){
                callbackit = false;
                req.abort();
                return _rerr.process(errors.ERROR_TIMEOUT_ON_REQUEST,null,null,reqLogObject,callback)
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
var _executeRedirection = function(redirection,originalQueryRequest,reqLogObject,callback){
    if (typeof originalQueryRequest.options == 'undefined'){
        originalQueryRequest.options = {}
    }
    if (typeof originalQueryRequest.options.maxRedirects == 'undefined'){
        originalQueryRequest.options.maxRedirects = constants.MAX_REDIRECTION_DEPTH;
    }
    originalQueryRequest.options.maxRedirects--;
    if (originalQueryRequest.options.maxRedirects==0){
        return _rerr.process(errors.ERROR_INFINITE_REDIRECTIONS,null,null,reqLogObject,callback);
    }

    //Redirect
    exports.r(originalQueryRequest.httpMethod,
                redirection.isHttps,
                redirection.host,
                redirection.port,
                redirection.path,
                originalQueryRequest.options,
                originalQueryRequest.data,
                originalQueryRequest.pathparams,
                callback);
};

/**
 * This function return http options of request 
 */
var _getOriginalRequestQuery = function(httpMethod,isHttps,host,port,path,options,data,pathparams){
    return {
        httpMethod:httpMethod,
        isHttps:isHttps,
        host:host,
        port:port,
        path:path,
        options:options,
        data:data,
        pathparams:pathparams
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
        	'Accept-Encoding' : 'gzip, deflate' //DRM. By default we allow this but...
        },
    };
        
    return defOptions;
};

/**
 * This function add HTTP AUTH options to request if it's configured
 */
var _authOptions = function(httpOptions,options){
    if (typeof options.auth !== 'undefined'){
        httpOptions.auth = options.auth;
    }
};

/**
 * This function add HTTPs Cert options to request if it's configured
 */
var _addCertOptions = function(httpOptions,options){
    if (typeof options.cert !== 'undefined'){
        httpOptions.key = options.cert.key;
        httpOptions.cert = options.cert.cert;
    }
    if (typeof options.certca !== 'undefined'){
        httpOptions.ca = options.certca;
    }
    
};

/**
 * This function add custom header options given
 */
var _addRequestHeaders = function(httpOptions,options){
    options.headers = options.headers||{};
    
    for(var headertag in options.headers){
        if ((headertag == 'Accept-Encoding') && (options.headers[headertag] == '')){
            delete httpOptions.headers[headertag];
            continue;
        }
        httpOptions.headers[headertag] = options.headers[headertag];
    }
};


/*
 * This funciton return body
 */
var _getBodyOfRequest = function(httpMethod,options,data,httpOptions){
	if (httpMethod == 'GET'){
		return '';
	}
    var body = '';

    //By default request decod is direct (no decod)
    if (typeof options.reqdecod == 'undefined'){
        options.reqdecod = {type:'direct'};
    }

    //Decoding data request
    switch (options.reqdecod.type){
        case 'xml':
        	body = _bodyToXml(data,options,httpOptions);
            break;
        case 'json':
      		body = _bodyToJSON(data,options,httpOptions);
            break;
        case 'form':
            body = _bodyToForm(data,options,httpOptions);
            break;
        case 'direct':
            body = data!== undefined && data !== null && (typeof data === 'string' || data instanceof String)?data:'';
        	break;
        case 'none':
            break;   
        default : 
            break;

    }
    if (body == null){
        return null;
    }

    //Assign content length
    try{
    	httpOptions.headers['Content-Length'] =  Buffer.byteLength(body, 'utf8');
    } catch(eX){
        _log.error('Exception extracting Content-Length of data to send ',eX);
        return null;
    }

    //Encoding request
    if(typeof options.encoding != 'undefined'){
        body = _encodeRequest(body,options.encoding);
        httpOptions.headers['Content-Length'] =  Buffer.byteLength(body, options.encoding);
    }

    return body;
};

/**
 * encode string to selected encoding
 */
var _encodeRequest = function(request,encoding){
    request = iconv.encode(request,encoding);
    request = iconv.decode(request,encoding);
    return request;
};

/**
 * Body is a xml
 */
var _bodyToXml = function(data,options,httpOptions){
    try {
        var jsOptions = (typeof options.reqdecod.jsParserOptions != 'undefined')?options.reqdecod.jsParserOptions:{ attributeString: '@' };
        if (typeof options.reqdecod.xmlhead === 'undefined'){
            options.reqdecod.xmlhead = 'trestcjs';
        }
        body = js2xmlparser.parse(options.reqdecod.xmlhead, data,jsOptions);
        body += '                                 ';
        httpOptions.headers['Content-Type'] = 'text/xml';
    } catch (e) {
        _log.error('Exception converting body data to xml string',e);
        return null;
    }
    return body;
};

/**
 * Body is a json
 */
var _bodyToJSON = function(data,options,httpOptions){
    try{
        body = JSON.stringify(data);
    } catch(e){
        _log.error('Exception converting body data to JSON string',e);
        return null;
    }
    httpOptions.headers['Content-Type'] = 'application/json';
    return body;
};

/**
 * Body is a json
 */
var _bodyToForm = function(data,options,httpOptions){
	try {
        body = querystring.stringify(data);
        httpOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } catch (e) {
        _log.error('Exception converting body data to x-www-form-urlencoded string');
        return null;
    }
    return body;
};