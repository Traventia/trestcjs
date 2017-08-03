//Depences
const rerr = require('./response_error');
const iconv = require('iconv-lite');
const parseString = require('xml2js').parseString;  
const errors = require('../config/errors.js');
const _log = require('./trestc_log');

/**
 * [process description]
 */
exports.process = function(response,options,httpResponse,reqLogObject,callback){
	//By default direct response
    if (typeof options.resdecod == 'undefined'){
        options.resdecod = {type : 'direct'};
    }

    //If we have spetials decoding requirement...
    if (typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
        response = _decodeResponse(response,options.resdecod.encoding);
    } else if(typeof options.encoding != 'undefined'){
        response = _decodeResponse(response,options.encoding);
    }

    //Decod response   
    switch (options.resdecod.type){
        case 'xml' : 
        	_parseXmlResponse(response,options,httpResponse,reqLogObject,callback)
            break;
        case 'json' :
        	_parseJsonResponse(response,options,httpResponse,reqLogObject,callback);
            break;
        case 'direct' : 
        default :
        	_generalCallbackResponse(httpResponse,response,reqLogObject,callback);
            break;
    }
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

/**
 * Parse xml reponse
 */
var _parseXmlResponse = function(response,options,httpResponse,reqLogObject,callback){
    if (typeof response == 'undefined' || response == null){
    	return rerr.process(errors.EMPTY_RESPONSE_CANNOT_BE_PARSED,response,httpResponse,callback)
    }
    var xmlOptions = (typeof options.resdecod.xmlParserOptions != 'undefined')?options.resdecod.xmlParserOptions:{explicitArray  : false};   
    parseString(response,xmlOptions,function (xmlperr, resdecoded) {
        if (xmlperr != null){
            return rerr.process(errors.ERROR_PARSING_XML_RESPONSE,response,httpResponse,callback)
        }
        _generalCallbackResponse(httpResponse,resdecoded,reqLogObject,callback);
    });
};

/**
 * Parse JSON response
 */
var _parseJsonResponse = function(response,options,httpResponse,reqLogObject,callback){
    if (typeof response == 'undefined' || response == null){
    	return rerr.process(errors.EMPTY_RESPONSE_CANNOT_BE_PARSED,response,httpResponse,callback)
    }	
    var resdecoded = {};
    try {
        resdecoded = JSON.parse(response);
    } catch(e){
         return rerr.process(errors.ERROR_PARSING_JSON_RESPONSE,response,httpResponse,callback)
    }
   _generalCallbackResponse(httpResponse,resdecoded,reqLogObject,callback);
}

/**
 * This function create general response object and callback it
 */
var _generalCallbackResponse = function(httpResponse,body,reqLogObject,callback){
    var response = {
    	statusCode : httpResponse.statusCode,
    	headers    : httpResponse.headers,
    	body       : body,
    }
    _log.logRequest(reqLogObject,response,new Date());
    return callback(null,body,null,response);
}