/**
 * This module wrapp function to connect to external apis using rest methods GET and POST
 * Allow several features and configurations in each request like gog,data parsing, etc.
 * 
 * - postHttpRequest(host,port,path,options,data,pathparams,callback)
 * - getHttpRequest(host,port,path,options,data,pathparams,callback)
 * - postHttpsRequest(host,port,path,options,data,pathparams,callback)
 * - getHttpsRequest(host,port,path,options,data,pathparams,callback)
 * - soapRequest(url,logname,method,args,soapOptions,callback)
 *
 * OPTIONS IN REQUEST:
 * {
 *     (auth) : http standard auth in request. Default: undefined
 *     headers : Object with key-value headers on request. Default: {'Accept-Encoding' : 'gzip, deflate'}
 *     (reqdecod) : Type of data conversion to make to object body data. Default: direct. Fields:
 *         + type: Valid:
 *                 - xml : convert object in XML
 *                 - json : convert object in JSON
 *                 - form : convert object in a HTML form
 *                 - direct : direct pass
 *                 - formstringify : convert object in a html stringy form
 *                 - none
 *         + (xmlhead) just for xml reqdecod type
 *     (resdecod) : Type of data received from server in order to convert it to object. Default: xml. Fields:
 *          + type: Valid:
 *                 - xml : convert object in XML
 *                 - json : convert object in JSON
 *                 - direct : direct pass
 *           + (encoding): Standard encoding to apply to response. Default: undefined
 *           + (xmlParserOptions): Options to apply to xml response parser
 *     (encoding): standard encoding to apply to body data and to response (if doesnt exist resdecod.encoding). Default: none
 *     (timeout) : timeout in miliseconds to request. Default: _DEFAULT_TIMEOUT_

 *     (logreq) : Objet that if exists allow log request and response. Default: undefined. Fields:
 *         + type: fs (file system) / db (database)
 *         + logname: name of module that create the log
 *         + operation: string that mark operation
 *         + key: key of operation
 *         + subkey: subkey of operation
 * }
 */
//var soap = require('soap');
var url   = require( "url" );
var http  = require('http');
var https = require('https');
var querystring = require('querystring');
var zlib  = require('zlib');
var iconv = require('iconv-lite');

/**
 * Configurations
 */
var _DEFAULT_TIMEOUT_           = 60000;
var _DEFAULT_RESPONSE_ENCODING_ = 'binary';


/**
 * Http request wrapp functions
 */
exports.http_post = function(host,port,path,options,data,pathparams,callback){
    _httpStRequest(true,false,host,port,path,options,data,pathparams,callback);
};
exports.http_get = function(host,port,path,options,data,pathparams,callback){
    _httpStRequest(false,false,host,port,path,options,data,pathparams,callback);
};
exports.http_get = function(host,port,path,options,data,pathparams,callback){
    _httpStRequest(false,false,host,port,path,options,data,pathparams,callback);
};
exports.https_post = function(host,port,path,options,data,pathparams,callback){
    _httpStRequest(true,true,host,port,path,options,data,pathparams,callback);
};
exports.https_get = function(host,port,path,options,data,pathparams,callback){
    _httpStRequest(false,true,host,port,path,options,data,pathparams,callback);
};

/**
 * This function execute a soap request
 * OBSOLETE. Shouldnt be used
 */
/*exports.soapRequest = function(url,logname,method,args,soapOptions,callback) {
    var reqHeaders = {};
    if(typeof soapOptions.header != 'undefined'){
        for(var i in soapOptions.header){
            reqHeaders[i] = JSON.parse(JSON.stringify(soapOptions.header[i]));
        }
        delete soapOptions.header;
    }   
    soap.createClient(url, soapOptions, function(err, client) {        
        if (err != null || client == null || typeof client == 'undefined' || typeof client[method] == 'undefined'){
            return callback({err:'Error creating soap client'},null);
        }
        client[method](args, function(err,result){
            var lastRequest = client.lastRequest;            
            var lastResponse = client.lastResponse;
            //console.log(client.lastRequestHeaders);
            _fileLogg.writeLog(logname,'__req__'+method,true,lastRequest);
            _fileLogg.writeLog(logname,'__res__'+method,true,lastResponse);
            callback(err,result);
        }, {timeout: _DEFAULT_TIMEOUT_},reqHeaders);
    });
};*/

// ------------------------------------- INTERNAL FUNCTIONS ------------------------------------------------- 
/**
 * This function execute a http request as a client. Support several options of request
 * and response handling
 */
var _httpStRequest = function(isPost,isHttps,host,port,path,options,data,pathparams,callback){
    //First we ath to path query
    if (pathparams!= null){
        path += '?'+querystring.stringify(pathparams);
    }
    var originalParameters = {
        isPost:isPost,
        isHttps:isHttps,
        host:host,
        port:port,
        path:path,
        options:options,
        data:data,
        pathparams:pathparams
    }

    //Default Options    
    var httpOptions = _getHttpOptionsOfRequest(isPost,host,port,path,options);

    //Get body
    if (isPost){
        var body = _getBodyOfRequest(options,data,httpOptions);
        if (body===null){
            return callback(_errors.LIBIO_REQ_BODYGEN,null);
        }
    } else {
        var body = '';
    }
    /*console.log(body);
    console.log('------------------------');*/
    //log request
    _logOperation(options.logreq,'__req__',_getReqLogData(isHttps,body,httpOptions,pathparams));
    
    //Generating request
    var ohttp = isHttps?https:http;
    var callbackit = true;
    var req = ohttp.request(httpOptions, function(res) {
        if (callbackit){
            callbackit = false;
            _httpStResponse(res,options,originalParameters,callback);
        }
    });
    
    //On error request callback handler
    req.on('error', function(e) {
        if (callbackit){
            callbackit = false;
            var err = _errors.LIBIO_RES_COMERROR;
            err.info = e;
            _logOperation(options.logreq,'__res__',JSON.stringify(err));
            return callback(err,null);
        }
    });
    
    //Implementing timeout on request
    var timeout = (typeof options.timeout == 'undefined')?_DEFAULT_TIMEOUT_:options.timeout;
    if (timeout > 0){
        req.setTimeout(timeout,function () {
            if (callbackit){
                req.abort();
                callbackit = false;
                _logOperation(options.logreq,'__res__',JSON.stringify(_errors.LIBIO_RES_TIMEOUT));
                return callback(_errors.LIBIO_RES_TIMEOUT,null);
            }
        });
    }
    
    //Req execution
    if (isPost)
        req.write(body);
    req.end();
};

/**
 * This function return http options of request 
 */
/*var _getHttpOptionsOfRequest = function(isPost,host,port,path,options){
    var httpOptions = _getHttpDefaultOptions(isPost,host,port,path);
    options = options || {};
    
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
/*var _getHttpDefaultOptions = function(isPost,host,port,path){
    var defOptions = {
        host     : host,
        port     : port,
        path     : path,
        encoding : 'utf8',
        //encoding: 'iso-8859-15',
        method   : isPost?'POST':'GET',
        headers  : {
        	'Accept-Encoding' : 'gzip, deflate' //DRM. By default we allow this but...
        },
    };
    if(isPost){
        defOptions.headers["Content-Type"] = "text/xml";
    }
        
    return defOptions;
};

/**
 * This function add HTTP AUTH options to request if is configured
 */
/*var _authOptions = function(httpOptions,options){
    if (typeof options.auth !== 'undefined'){
        httpOptions.auth = options.auth;
    }
};


/**
 * This function add HTTPs Cert options to request if is configured
 */
/*var _addCertOptions = function(httpOptions,options){
    if (typeof options.cert !== 'undefined'){
        httpOptions.key = options.cert.key;
        httpOptions.cert = options.cert.cert;
    }
    if (typeof options.certca !== 'undefined'){
        httpOptions.ca = options.certca;
    }
    
};



/**
 * This function add special headers
 */
/*var _addRequestHeaders = function(httpOptions,options){
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
var _getBodyOfRequest = function(options,data,httpOptions){
    var body = '';

    if (typeof options.reqdecod == 'undefined'){
        options.reqdecod = {type:'direct'};
    }

    //Decoding data request
    switch (options.reqdecod.type){
        case 'xml':
            try {
                var jsOptions = (typeof options.reqdecod.jsParserOptions != 'undefined')?options.reqdecod.jsParserOptions:{ attributeString: '@' };
                var js2xmlparser = require("js2xmlparser");
                body = js2xmlparser.parse(options.reqdecod.xmlhead, data,jsOptions);
                body += '                                 ';
                httpOptions.headers["Content-Length"] =  Buffer.byteLength(body, 'utf8');
            } catch (e) {
                console.log('Exceptoin xml :' ,e.message, e.stack);
                return null;
            }
            break;
        case 'json':
            try{
                body = JSON.stringify(data);
            } catch(e){
                console.log('Exception:' ,e.message, e.stack);
                return null;
            }
            httpOptions.headers['Content-Type'] = 'application/json';
            httpOptions.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');        
            break;
        case 'form':
            //use this option with get
            body = data;
            //body = querystring.stringify(data);
            httpOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';        
            break;
        case 'direct':
            try {
                httpOptions.headers['Content-Length'] =  Buffer.byteLength(data, 'utf8');
                body = data;
            } catch (e) {
                console.log('Exceptoin:' ,e.message, e.stack);
                return null;
            }
            break;         
        case 'formstringify':
            try {
                body = data;
                body = querystring.stringify(data);
                httpOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            } catch (e) {
                console.log('Exceptoin:' ,e.message, e.stack);
                return null;
            }
            break;   
        case 'none':
        default : 
            break;

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


/*
 * This function set enconding of response
 */
/*var _setResEncoding = function(res,options){
    return;
    if (typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
        res.setEncoding(options.resdecod.encoding);
    } else if (typeof options.encoding != 'undefined'){
        var converterStream = iconv.decodeStream(options.encoding);
        //res.pipe(converterStream);
    }else {
        //res.setEncoding(_DEFAULT_RESPONSE_ENCODING_);
    }
};*/


/**
 * This function handle the response of http request
 */
var _httpStResponse = function(res,options,originalParameters,callback){
    var chunks = [];
    //Set encoding
    //_setResEncoding(res,options);

    //Get data chunks 
    res.on('data', function (chunk) {
        chunks.push(chunk);
    });
    
    //Catching end of data
    res.on('end', function () {
        if(typeof res.headers['content-encoding'] !== 'undefined'){
            if (res.headers['content-encoding'] == 'gzip'){
                var buffer = Buffer.concat(chunks);
                return zlib.gunzip(buffer,function(gziperr,decoded){
                    if (gziperr != null){
                        var err = _errors.LIBIO_RES_GUNZIPERROR;
                        err.info = {gziperr: gziperr,headers:res.headers};
                        _logOperation(options.logreq,'__res__',JSON.stringify(err));
                        return callback(err,null);
                    }
                    _httpStParseResponse(decoded,options,res,originalParameters,callback);
                });
            }
        }
        if(typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
            var buffer = chunks.join('');
        }else {
            var buffer = Buffer.concat(chunks);            
        }
        _httpStParseResponse(buffer,options,res,originalParameters,callback);
    }); 
};

/**
 * decode string to selected encoding
 */
var _decodeResponse = function(response,encoding){
    if (encoding == 'latin1'){
        var newBuff = Buffer.from(response, 'latin1');
        return newBuff.toString('latin1');
    } else {
        //pas from buffer to string with encoding
        response = iconv.decode(response,encoding);
        //convert that string into a buffer with ut8 encoding
        response = iconv.encode(response,'utf8');
        response = iconv.decode(response,'utf8');
        return response;
    }
};

/*
 * This funcion make final parse response of http request
 */
var _httpStParseResponse = function(response,options,httpResponse,originalParameters,callback){
    switch (httpResponse.statusCode){
        case 200:
            _http200ParseReponse(response,options,callback);
            break;
        case 301:
        case 302:
            _http301ParseReponse(response,options,httpResponse,originalParameters,callback);
            break;
        default:
            _errorStatusCodeParseResponse(response,options,httpResponse,originalParameters,callback)
            break;
    }

};

var _errorStatusCodeParseResponse = function(response,options,httpResponse,originalParameters,callback){
    var logReponse = 'StatusCode: '+httpResponse.statusCode;
    logReponse += require('os').EOL+require('os').EOL+'------- HTTP RESPONSE HEADERS ------'+require('os').EOL;
    if (typeof httpResponse.headers != 'undefined'){
        for(var key in httpResponse.headers){
            logReponse += key+' = '+httpResponse.headers[key]+require('os').EOL;
        }
    }
    logReponse += require('os').EOL+require('os').EOL+'------- HTTP RESPONSE BODY ------'+require('os').EOL;
    try{
        response = response.toString();
    } catch(eX){
        response = 'Traza generada automáticamente por libio (no son datos recibidos en request): Exception toString Parsing';
    }
    logReponse += response;

    var err = _errors.LIBIO_RES_WRONGSTATUSCODE;
    err.info = httpResponse.statusCode;
    err.moreInfo = {
        headers : httpResponse.headers,
        body    : response
    }
    _logOperation(options.logreq,'__res__',logReponse);
    callback(err,null)
};

var _http301ParseReponse = function(response,options,httpResponse,originalParameters,callback){
    if (typeof httpResponse.headers['location'] == 'undefined' && typeof httpResponse.headers['Location'] == 'undefined'){
        //Unknown location!!!!
        var err = _errors.LIBIO_RES_REDIRECTWITHOUTLOCATION;
        callback(err)
    } else {
        var location = typeof httpResponse.headers['location'] !== 'undefined'
                       ? httpResponse.headers['location']
                       : httpResponse.headers['Location'];
        var uParts = location.split('?');
        var pathParts = uParts[0].split('/');
        var host = null;
        for(i=0;i<pathParts.length;i++){
            var possibleHost = pathParts[i].trim();
            pathParts.splice(0,1);i--;
            if (possibleHost!='' && possibleHost!= 'http:' & possibleHost!= 'https:'){
                host = possibleHost;
                break;
            }
        }
        if (host == null){
            var err = _errors.LIBIO_RES_REDIRECTMALFORMED;
            return callback(err);
        }

        var port = host.split(':');
        port = (typeof port[1] != 'undefined' && port[1] != '')?port[1]:originalParameters.port;
        pathParts = pathParts.join('/');
        if (pathParts != ''){
            pathParts = '/'+pathParts;
        }
        var options = originalParameters.options;
        var data = originalParameters.data;
        var pathparams = originalParameters.pathparams;

        if (typeof options.redirects == 'undefined'){
            options.redirects = 0;
        }
        options.redirects++;
        if (options.redirects>=6){
            var err = _errors.LIBIO_RES_TOOMANYREDIRECTS;
            return callback(err);
        }
        

        if (typeof uParts[1] != 'undefined'){
            //TODO AQUI HABRIA QUE AÑADIR A PATHPARAMS LOS PARAMETROS DE uParts[1]
        }

        console.log('EJECUTANDO RECIRECT 301 o 302 A '+host+':'+port+pathParts);
        _httpStRequest(originalParameters.isPost,originalParameters.isHttps,host,port,pathParts,options,data,pathparams,callback);
    }
};

    
/**
 * [_http200ParseReponse description]
 * @param  {[type]}   response [description]
 * @param  {[type]}   options  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var _http200ParseReponse = function(response,options,callback){
    if (typeof options.resdecod == 'undefined'){
        options.resdecod = {type : 'xml'};
    }

    if (typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
        response = _decodeResponse(response,options.resdecod.encoding);
    } else if(typeof options.encoding != 'undefined'){
        response = _decodeResponse(response,options.encoding);
    }

    //Log response
    _logOperation(options.logreq,'__res__',response)
    /*console.log(response.toString('utf8'));
    console.log('--------------------');*/

    
    //Decod response   
    switch (options.resdecod.type){
        case 'xml' : 
            if (typeof response == 'undefined' || response == null){
                return callback({err:'connection error. Impossible convert xml of null or undefined'},null);
            }
            var parseString = require('xml2js').parseString;   
            var xmlOptions = (typeof options.resdecod.xmlParserOptions != 'undefined')?options.resdecod.xmlParserOptions:{};   
            parseString(response,xmlOptions,function (xmlperr, resdecoded) {
                if (xmlperr != null){
                    var err = _errors.LIBIO_RES_XMLPARSEERROR;
                    err.info = {xmlperr: xmlperr,xmlOptions:xmlOptions};
                    _logOperation(options.logreq,'__res__',JSON.stringify(err));
                    return callback(err,null);
                }
                callback(null,resdecoded);
            });
            break;
        case 'json' : 
            var resdecoded = {};
            try {
                resdecoded = JSON.parse(response);
            } catch(e){
                var err = _errors.LIBIO_RES_JSONPARSEERROR;
                err.info = {e: e};
                _logOperation(options.logreq,'__res__',JSON.stringify(err));
                return callback(err,null);
            }
            callback(null,resdecoded);
            break;
        case 'direct' : 
            callback(null,response);
            break;
        default :
            var err = _errors.LIBIO_RES_UNKNOWNRESDATA;
            err.info = {resdecod: options.resdecod};
            _logOperation(options.logreq,'__res__',JSON.stringify(err));
            callback(err,null);
            break;
    }
};


/**
 * This function execute log operations
 */
var _logOperation = function(logreq,subtype,strToLog){
    if (typeof logreq !== 'undefined' && logreq != null && typeof logreq.type !== 'undefined'){    
        if (logreq.type == 'fs'){
            _fileLogg.writeLog(logreq.logname,subtype+logreq.operation,true,strToLog);
        } if (logreq.type == 'db'){
            var target = null;
            if (typeof logreq.target !== 'undefined'){
                target = logreq.target;
            }
            var customParams = null;
            if ( typeof logreq.customParams !== 'undefined'){
                customParams = logreq.customParams;
            }
            _dblog.logdata(logreq.key,logreq.subkey,logreq.logname,subtype+logreq.operation,strToLog,customParams,target);
        }
    }
    
}

/**
 * get log data
 */
var _getReqLogData = function(isHttps,body,httpOptions,pathparams){
    var logStr = isHttps?'isHttps = true':'isHttps = false';
    logStr += require('os').EOL;

    if(httpOptions != null && typeof httpOptions != 'undefined'){
        logStr += require('os').EOL+require('os').EOL+'------- HTTP OPTIONS ------'+require('os').EOL;
        for(var key in httpOptions){
            if (key != 'headers')
                logStr += key+' = '+httpOptions[key]+require('os').EOL;
        }
        if (typeof httpOptions.headers !== 'undefined'){
            logStr += require('os').EOL+require('os').EOL+'------- HTTP REQUEST HEADERS ------'+require('os').EOL;
            for(var key in httpOptions.headers){
                logStr += key+' = '+httpOptions.headers[key]+require('os').EOL;
            }
        }
    }

    if(pathparams != null && typeof pathparams != 'undefined'){
        logStr += require('os').EOL+require('os').EOL+'------- PATH PARAMS ------'+require('os').EOL;
        for(var key in pathparams){
            logStr += key+' = '+pathparams[key]+require('os').EOL;
        }        
    }

    logStr += require('os').EOL+require('os').EOL+'------- BODY ------'+require('os').EOL;
    logStr += body;


    return logStr;
};

