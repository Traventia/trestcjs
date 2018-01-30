// Dependences
const js2xmlparser = require("js2xmlparser");
const _typesAndEncoding = require('./types_and_encoding.js');
const querystring = require('querystring');
const _log = require('./trestc_log');
const iconv = require('iconv-lite');

/*
 * This funciton return body
 */
exports.getBodyOfRequest = function(httpMethod,options,data,httpOptions){
	if (httpMethod == 'GET' || data == null || data == ''){
		return '';
	}
    var body = '';

    //By default request decod is direct (no decod)
    if (typeof options.reqdecod == 'undefined'){
        options.reqdecod = {};
    }

    _typesAndEncoding.assignTypeOfData(options.reqdecod,httpOptions.headers);

    

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
        default :
            body = null; 
            break;

    }
    if (body === null){
        throw new Error('Body is null');
    }

    //Assign content length
    //try{
    	httpOptions.headers['content-length'] =  Buffer.byteLength(body, 'utf8');
    //} catch(eX){
    //    _log.error('Exception extracting Content-Length of data to send ',eX);
    //    return null;
    //}

    //Encoding request
    if(typeof options.encoding != 'undefined'){
        //try{
            body = _encodeRequest(body,options.encoding);
            httpOptions.headers['content-length'] =  Buffer.byteLength(body, options.encoding);
        //}catch(eX){
        //    _log.error('Exception encoding body request ',eX);
        //    return null;
        //}
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
    //try {
        var jsOptions = (typeof options.reqdecod.jsParserOptions != 'undefined')?options.reqdecod.jsParserOptions:{ attributeString: '@' };
        if (typeof options.reqdecod.xmlhead === 'undefined'){
            options.reqdecod.xmlhead = 'trestcjs';
        }
        body = js2xmlparser.parse(options.reqdecod.xmlhead, data,jsOptions);
        body += '                                 ';
        httpOptions.headers['content-type'] = 'text/xml';
    //} catch (e) {
    //    _log.error('Exception converting body data to xml string',e);
    //    return null;
    //}
    return body;
};

/**
 * Body is a json
 */
var _bodyToJSON = function(data,options,httpOptions){
    //try{
        body = JSON.stringify(data);
    //} catch(e){
    //    _log.error('Exception converting body data to JSON string',e);
    //    return null;
    //}
    httpOptions.headers['content-type'] = 'application/json';
    return body;
};

/**
 * Body is a json
 */
var _bodyToForm = function(data,options,httpOptions){
	//try {
        body = querystring.stringify(data);
        httpOptions.headers['content-type'] = 'application/x-www-form-urlencoded';
    //} catch (e) {
    //    _log.error('Exception converting body data to x-www-form-urlencoded string');
    //    return null;
    //}
    return body;
};