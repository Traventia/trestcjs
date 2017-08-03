//Dependences
const r2xx = require('./response_2XX');
const r3xx = require('./response_3XX');
const rerr = require('./response_error');
const errors = require('../config/errors.js');

/**
 * 
 */
exports.r = function(res,options,reqLogObject,callback){
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
                        return rerr.process(errors.ERROR_GZIP_PARSING_RESPONSE,buffer,res,callback)
                    }
                    _httpCodeStatusResponseDecode(decoded,options,res,reqLogObject,callback);
                });
            }
        }
        if(typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
            var buffer = chunks.join('');
        }else {
            var buffer = Buffer.concat(chunks);            
        }
        _httpCodeStatusResponseDecode(buffer,options,res,reqLogObject,callback);
    }); 
}


/**
 * This funcion make final parse response of http request
 */
var _httpCodeStatusResponseDecode = function(response,options,httpResponse,reqLogObject,callback){
    switch (httpResponse.statusCode){
        case 200:
        case 201:
        case 202:
        case 203:
        case 204:
            r2xx.process(response,options,httpResponse,reqLogObject,callback);
            break;
        case 301:
        case 302:
            r3xx.process(response,options,httpResponse,reqLogObject,callback);
            break;
        default:
            rerr.process(errors.ERROR_STATUS_CODE,response,options,httpResponse,reqLogObject,callback)
            break;
    }
};
