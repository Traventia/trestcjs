
exports.process = function(error,statusCode,trace,callback){
    if (statusCode === undefined){
        statusCode = null;
    }
    return callback(error,null,statusCode,trace); 
};