

module.exports = Object.freeze({
	//Request Errors
	ERROR_PARSING_BODY_REQUEST      : 'Error parsing body request',
	ERROR_CONNECTION_TO_SERVER      : 'Error tryning to connect to server',
	ERROR_TIMEOUT_ON_REQUEST        : 'Error timeout',
	ERROR_INFINITE_REDIRECTIONS     : 'Error Infinite redirection loop',
	ERROR_METHOD_NOT_IMPLEMENTED    : 'Error. Requested Http Method is not implemented',

	ERROR_STATUS_CODE               : 'Status code of response indicate an error',
	ERROR_GZIP_PARSING_RESPONSE     : 'Exception parsing gzip received',
	REDIRECTION_WITHOUT_LOCATION    : 'Received redirection status code but without location to redirect in headers',
	REDIRECTION_UNPARSEABLE         : 'Received redirection status code bug location in headers is unparseable',

	EMPTY_RESPONSE_CANNOT_BE_PARSED : 'Received configuration for parsing response but response doesnt exists',
	ERROR_PARSING_XML_RESPONSE      : 'Exception parsing response as a XML',
	ERROR_PARSING_JSON_RESPONSE     : 'Exception parsing response as a JSON',
	ERROR_PARSING_RESPONSE          : 'Received configuration for parsing response but response doesnt exists'
});

