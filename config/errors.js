

module.exports = Object.freeze({
	//Request Errors
	ERROR_PARSING_BODY_REQUEST      : {code:1,msg:'Error parsing body request'},
	ERROR_CONNECTION_TO_SERVER      : {code:2,msg:'Error tryning to connect to server'},
	ERROR_TIMEOUT_ON_REQUEST        : {code:3,msg:'Error timeout'},
	ERROR_INFINITE_REDIRECTIONS     : {code:4,msg:'Error Infinite redirection loop'},
	ERROR_PARSING_BODY_REQUEST      : {code:5,msg:'Error. Requested Http Method is not implemented'},

	ERROR_STATUS_CODE               : {code:10,msg:'Status code indicate an error'},
	ERROR_GZIP_PARSING_RESPONSE     : {code:11,msg:'Exception parsing gzip received'},
	REDIRECTION_WITHOUT_LOCATION    : {code:12,msg:'Received redirection status code but without location to redirect in headers'},
	REDIRECTION_UNPARSEABLE         : {code:13,msg:'Received redirection status code bug location in headers is unparseable'},

	EMPTY_RESPONSE_CANNOT_BE_PARSED : {code:14,msg:'Received configuration for parsing response but response doesnt exists'},
	ERROR_PARSING_XML_RESPONSE      : {code:15,msg:'Exception parsing response as a XML'},
	ERROR_PARSING_JSON_RESPONSE     : {code:16,msg:'Exception parsing response as a JSON'},
});

