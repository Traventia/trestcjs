/**
 * This module wrapp function to connect to external apis using rest methods GET and POST
 * Allow several features and configurations in each request like gog,data parsing, etc.
 * - http(method,host,port,path,options,data,pathparams,callback)
 * - https(hethod,host,port,path,options,data,pathparams,callback)
 * - http_post(host,port,path,options,data,pathparams,callback)
 * - http_get(host,port,path,options,data,pathparams,callback)
 * - http_put(host,port,path,options,data,pathparams,callback)
 * - http_delete(host,port,path,options,data,pathparams,callback)
 * - https_post(host,port,path,options,data,pathparams,callback)
 * - https_get(host,port,path,options,data,pathparams,callback)
 * - https_put(host,port,path,options,data,pathparams,callback)
 * - https_delete(host,port,path,options,data,pathparams,callback)
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

 *     (log) : Objet that if exists allow log request to subscriber callback. The object will be passed throught to
 *     		   suscriber functions but one field is important:
 *     		   tag. It will only call to susbribed function to this tag (if not tag configured, then call to general)
 * }
 */
'use strict'
module.exports = require('./lib/trestc');