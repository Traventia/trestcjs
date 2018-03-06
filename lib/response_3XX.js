/**
 * This file implement redirect funcionality
 */
const errors = require('../config/errors.js');
const rerr = require('./response_error');

/**
 * Process 3XX Response.
 * With a 3XX response, server is telling us that resource is in other location. This function
 * will extract the new location from resource and callback to request procedur with new direction.
 * In case of error, will response with an error
 */
exports.process = function(response,options,httpResponse,trace,callback){

    if (typeof httpResponse.headers['location'] == 'undefined' && typeof httpResponse.headers['Location'] == 'undefined'){
    	//Unknown new location...we treat like an error
        return rerr.errorInResponse(errors.REDIRECTION_WITHOUT_LOCATION,502,trace,callback)
    }

    //Get new location:
    var location = typeof httpResponse.headers['location'] !== 'undefined' ? httpResponse.headers['location'] : httpResponse.headers['Location'];

    //Get new location parts
    try{
        var newDestination = _extactNewDestinationFromLocation(location);
    } catch(error){
        return rerr.errorInResponse(errors.REDIRECTION_UNPARSEABLE+error.message,502,trace,callback)
    }
    
    if (newDestination == null){
    	//Location cannot be parsed
        return rerr.errorInResponse(errors.REDIRECTION_UNPARSEABLE,502,trace,callback)
    }

    //return to request
    return callback(null,null,null,null,newDestination);
};


/**
 * This function receive a new location and return its parts
 */
var _extactNewDestinationFromLocation = function(location){
	//Split location
    var uParts = location.split('?');
    var pathParts = uParts[0].split('/');
    var possibleProtocol = pathParts[0];

	//We loop path parts finding host
	var host = _getHostFromSplittedLocationParts(pathParts)

    //If no host...return null
    if (host == null){
        return null;
    }

    //Check protocol and new protocol from parts and host
    var protocol = _getNewProtocolAndNewPort(possibleProtocol,host)

    //We get new path
    var path = pathParts.join('/');
    if (path != ''){
        path = '/'+path;
    }

    var params = {};
    if (typeof uParts[1] != 'undefined'){
        //TODO AQUI HABRIA QUE AÑADIR A params LOS PARAMETROS DE uParts[1]
    }

    return {
    	host       : protocol.host,
    	isHttps    : protocol.isHttps,
    	port       : protocol.port, 
    	path       : path,
    	params : params,
    }
};

/**
 * This function get host from location splited parts
 */
var _getHostFromSplittedLocationParts = function(pathParts){
	var host = null;
    for(i=0;i<pathParts.length;i++){
        var possibleHost = pathParts[i].trim();
        pathParts.splice(0,1);i--;
        if (possibleHost!='' && possibleHost!= 'http:' & possibleHost!= 'https:'){
            host = possibleHost;
            break;
        }
    }
    return host;
};

/**
 * This function get from location splitted parts and host
 * the port and protocol from a redirection
 */
var _getNewProtocolAndNewPort = function(possibleProtocol,host){
	//Check protocol
	var isHttps = false;
	var defaultPort = 80;
	if (possibleProtocol == 'https:'){
		defaultPort = 443;
		isHttps = true;
	}
    //divide host in host/port
    var host_port = host.split(':');

    //we assign new host (to avoid : character)
    host = host_port[0];

    //Check if new port is need
    port = (typeof host_port[1] != 'undefined' && host_port[1] != '')?host_port[1]:defaultPort;


    return {
    	host    : host,
    	isHttps : isHttps,
    	port    : port,
    }
};

