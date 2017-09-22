const _log = require('./trestc_log');

exports.process = function(error,response,httpResponse,reqLogObject,callback){
	//Initialice error object
	var err = {error: error};

	//Check if we can add statusCode and headers information
    if (httpResponse!=null && httpResponse.statusCode !== undefined){
    	err.statusCode = httpResponse.statusCode;
    }

	if (httpResponse!=null && httpResponse.headers !== undefined){
    	err.headers = httpResponse.headers;
    }

    //We check if we have a response
    if (response != null){
    	//We try to "humanitize" response
		try{
            if (typeof response !== 'string'){
                response = response.toString();    
            }
	    } catch(eX){
	        response = 'TRESTCJS AUTOMATIC TRACE (Not received from server): Exception toString Parsing error response. MoreInfo '+JSON.stringify(eX);
	    }
	    err.body = response;
    }

    if (reqLogObject != null){
        _log.logRequest(reqLogObject,err,new Date());    
    }
    

    //reponse
    return callback(err);    
};

