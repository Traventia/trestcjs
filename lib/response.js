//Dependences
//const r2xx = require('./response_2XX');
const rbody = require('./response_body');
const r3xx = require('./response_3XX');
const rerr = require('./response_error');
const errors = require('../config/errors.js');
const zlib = require('zlib');
const _log = require('./trestc_log');

/**
 * Main of response. Is the function that will be called when a connection with
 * server is ready and we start to receive dataa
 */
exports.r = function(res,options,trace,callback){
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
                        return rerr.process(errors.ERROR_GZIP_PARSING_RESPONSE,null,trace,callback)
                    }
                    _httpCodeStatusResponseDecode(decoded,options,res,trace,callback);
                });
            }
        }
        if(typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
            var buffer = chunks.join('');
        }else {
            var buffer = Buffer.concat(chunks);            
        }
        _httpCodeStatusResponseDecode(buffer,options,res,trace,callback);
    }); 
}


/**
 * This funcion make final parse response of http request
 */
var _httpCodeStatusResponseDecode = function(response,options,httpResponse,trace,callback){
    rbody.getBodyOfResponse(response,options,httpResponse,function(err,body){
        var error = errors.ERROR_STATUS_CODE;

        if (err != null){
            httpResponse.statusCode = -1;
            error = errors.ERROR_PARSING_RESPONSE;
            error.info = err;
        }
        error.statusCode = httpResponse.statusCode;

        //Trace and log response
        _addResponseToTrace(trace,httpResponse,body,response,options);

        //Decod status Code of response
        switch (httpResponse.statusCode){
            case 200:
            case 201:
            case 202:
            case 203:
            case 204:
                //Return callback ok
                callback(null,body,httpResponse.statusCode,trace,null)
                break;
            case 301:
            case 302:
                r3xx.process(response,options,httpResponse,trace,callback);
                break;
            default:
                //Return callback ok
                rerr.process(error,httpResponse.statusCode,trace,callback);
                break;
        }
    });

};



/**
 * This function check if trace is enabled in options and in that
 * case create trace object and set req field with information of request.
 * If disabled, return null
 */
var _addResponseToTrace = function(trace,httpResponse,data,rawdata,options){
    if (trace==null){
        return null;
    }
    trace.res = _getResponseTrace(httpResponse,data,rawdata,options);
    trace.res.response_time = trace.res.timestamp.getTime()-trace.req.timestamp.getTime();
    if (options.log !== undefined && options.log !== null && options.log.tag !== undefined && options.log.tag != null){
        _log.logResponse(options.log.tag,trace.res)    
    }
}


/**
 * [_getTrace description]
 */
var _getResponseTrace = function(httpResponse,data,rawdata,options){
    var traceRes = {
        statusCode : httpResponse.statusCode,
        headers    : httpResponse.headers,
        body       : data,
        rawbody    : rawdata,
        timestamp  : new Date(),
    
    }
    return traceRes;
}