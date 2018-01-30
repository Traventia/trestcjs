//Depences
const rerr = require('./response_error');
const iconv = require('iconv-lite');
const parseString = require('xml2js').parseString;  
const _typesAndEncoding = require('./types_and_encoding.js');

/**
 * This funciton parse body of response depending on configuration and headers
 * received
 */
exports.getBodyOfResponse = function(response,options,httpResponse,callback){
	//By default direct response
    if (typeof options.resdecod == 'undefined'){
        options.resdecod = {};
    }
    try{
        _typesAndEncoding.assignTypeOfData(options.resdecod,httpResponse.headers)


        //If we have spetials decoding requirement...
        if (typeof options.resdecod != 'undefined' && typeof options.resdecod.encoding != 'undefined'){
            response = _decodeResponse(response,options.resdecod.encoding);
        } else if(typeof options.encoding != 'undefined'){
            response = _decodeResponse(response,options.encoding);
        }

    } catch (error){
        return callback(error);
    }

    //Decod response   
    switch (options.resdecod.type){
        case 'xml' : 
        	_parseXmlResponse(response,options,httpResponse,callback)
            break;
        case 'json' :
        	_parseJsonResponse(response,options,httpResponse,callback);
            break;
        case 'direct' : 
        default :
        	return callback(null,response);
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

        var newBuff = Buffer.from(response);
        return iconv.decode(newBuff,encoding);
    }
};

/**
 * Parse xml reponse
 */
var _parseXmlResponse = function(response,options,httpResponse,callback){
    if (typeof response == 'undefined' || response == null || response == ''){
    	return callback(null,{})
    }

    var xmlOptions = (typeof options.resdecod.xmlParserOptions != 'undefined')?options.resdecod.xmlParserOptions:{explicitArray  : false};   
    parseString(response,xmlOptions,function trestcjsXmlParser(xmlperr, resdecoded) {
        if (xmlperr != null){
             return setImmediate(callback,xmlperr);
        }
        return setImmediate(callback,null,resdecoded);
    });
};

/**
 * Parse JSON response
 */
var _parseJsonResponse = function(response,options,httpResponse,callback){
    if (typeof response == 'undefined' || response == null || response == ''){
    	return callback(null,{})
    }
    var resdecoded = {};
    try {
        resdecoded = JSON.parse(response);
    } catch(error){
        return callback(error)
    }
    return callback(null,resdecoded);
}