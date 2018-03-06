
/**
 * TRest Error definition
 */
function RequestError(message,http_code) {
	//Error init
	this.constructor.prototype.__proto__ = Error.prototype;
	Error.captureStackTrace( this, this.constructor);

	//Override default name property
	this.name = "RequestError";

	//Assign message property or add general
	this.message = message;

	//Error status assign
	this.http_code = http_code;

	//No httpCode received
	this.http_code_rx = null;
}

/**
 * TRest Error definition
 */
function ResponseError(message,http_code) {
	//Error init
	this.constructor.prototype.__proto__ = Error.prototype;
	Error.captureStackTrace( this, this.constructor);

	//Override default name property
	this.name = "ResponseError";

	//Assign message property or add general
	this.message = message;

	//Error status assign
	this.http_code = http_code;

	//No httpCode received
	this.http_code_rx = http_code;
}


exports.errorInRequest = function(message,http_code,trace,callback){
	var error = new RequestError(message,http_code);
    return callback(error,null,http_code,trace); 
};

exports.errorInResponse = function(message,http_code,trace,callback){
	var error = new ResponseError(message,http_code);
    return callback(error,null,http_code,trace); 
};