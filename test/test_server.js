
const http = require('http');


var caseState = '';

exports.selectTest = function(cs){
	caseState = cs;
}

exports.createServerTest = function(port,callback){
	//create a server object:
	http.createServer(function (request, res) {
		var body = '';
	    request.on('data', function (data) {
	    	body += data;
	        // Too much POST data, kill the connection!
	        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
	        if (body.length > 1e6)
	            request.connection.destroy();
	    });

	    request.on('end', function () {


			switch (caseState){
				case 'timeout': 
					//timeout test
					break;
				case 'get':
					//normal get operation
					_getTest(request,body,res);
					break;
				case 'post':
					//normal get operation
					_postTest(request,body,res);
					break;
				case 'put':
					//normal get operation
					_putTest(request,body,res);					
					break;
				case 'delete':
					_deleteTest(request,body,res);
					break;
				case 'directDataAndCustomParameters':
					_directDataAndCustomParameters(request,body,res);
					break;
				case 'cleandelete':
					_cleandelete(request,body,res);
					break;
				case 'redirect':
					_redirect(request,body,res);
					break;
				case 'infiniteredirect':
					_infiniteRedirect(request,body,res);
					break;
				case 'infinitewrong':
					_redirectWithoutLocation(request,body,res);
					break;
				case 'err404':
					_err404(request,body,res);
					break;					
				case 'err503':
					_err503(request,body,res);
					break;	
				case 'moreinfo':
					_moreinfo(request,body,res);
					break;
				case 'log':
					_logTest(request,body,res);
					break;													

			}
	  	});
	}).listen(port,function(err){
		console.log('Se ha creado el servidor de testing en puerto '+port);
		callback();

	});
}

var _showInfo = function(request,body){
	console.log('-----------------------------------------------------------------');
	console.log('one request received');
	console.log(request.method,request.url);
	console.log(request.headers);
	console.log(body);
	console.log('-----------------------------------------------------------------');
}

//Normal get test
var _getTest = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	if (request.method != 'GET' || request.url !== '/path/get?p1=1&p2=2'){
		res.statusCode = 500;
	}
	
	var respuesta = {main:{node1:'value',complex:{n1:'v1',n2:'v2'}}};
	res.write(JSON.stringify(respuesta)); //write a response to the client
  	res.end();
}

//Normal post test
var _postTest = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	if (request.method != 'POST' || request.url !== '/path/post?p1=1&p2=3' || request.headers['content-type'] != 'application/x-www-form-urlencoded' || body != 'name=foo&password=bar'){
		res.statusCode = 500;
	}

	var respuesta = {main:{node1:'value',complex:{n1:'v1post',n2:'v2post'}}};
	res.write(JSON.stringify(respuesta)); //write a response to the client
  	res.end();
}

//Normal put test
var _putTest = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;

	var body_target ="<?xmlversion='1.0'?><trestcjs><name>foo</name><password>bar</password><complex><data>1</data><data>2</data><data>3</data></complex></trestcjs>";
	tbody = body.replace(/(\r\n|\n|\r)/gm,"");
	tbody = tbody.replace(/ /gm,"");
	tbody = tbody.replace(/(\t)/gm,"");

	if (request.method != 'PUT' || request.url !== '/path/put?p1=1&p2=4' || request.headers['content-type'] != 'text/xml' || tbody != body_target){
		res.statusCode = 500;
	}

	res.write(body); //write a response to the client
  	res.end();
}

//Normal delete test
var _deleteTest = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	var bodyExpected = JSON.stringify({"name":"foo","password":"bar","complex_json":{"data":[1,2,3]}});
	if (request.method != 'DELETE' || request.url !== '/path/delete?p1=1&p2=5' || body != bodyExpected || request.headers['content-type'] != 'application/json'){
		res.statusCode = 500;
	}

	var respuesta = "esto es una respuesta";
	res.write(respuesta); //write a response to the client
  	res.end();
}

//Normal delete test
var _directDataAndCustomParameters = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	if (request.method != 'POST' || request.url !== '/path/post/2?p1=2&p2=1' || body != "DATODIRECTO" || request.headers['soapaction'] != 'kakadevaka'){
		res.statusCode = 500;
	}

	var respuesta = body;
	res.write(respuesta);
  	res.end();
}

//Clean Delete
var _cleandelete = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	if (request.method != 'DELETE' || request.url !== '/path/delete/3'){
		res.statusCode = 500;
	}
  	res.end();
}


//redirect
var stRedirect = 0;
var _redirect = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 301;
	if (stRedirect == 1){
		res.statusCode = 200;
		if (request.method != 'PUT' || request.url !== '/path/redirect/here'){
			res.statusCode = 500;
		}
	} else {
		if (request.method != 'PUT' || request.url !== '/path/redirect/me'){
			res.statusCode = 500;
		}
	}
	res.setHeader('location', 'http://127.0.0.1:60000/path/redirect/here');
	stRedirect++;
  	res.end();
}

//Cause an infinite redirect that should end with an error
var _infiniteRedirect = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 301;
	if (request.method != 'DELETE' || request.url !== '/path/redirect/me/forever'){
		res.statusCode = 500;
	}
	res.setHeader('location', 'http://127.0.0.1:60000/path/redirect/me/forever');
  	res.end();
};

var _redirectWithoutLocation = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 301;
	if (request.method != 'POST' || request.url !== '/path/redirect/me'){
		res.statusCode = 500;
	}
  	res.end();
};


var _err404  = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 404;
	if (request.method != 'GET' || request.url !== '/path/no/exit'){
		res.statusCode = 500;
	}
  	res.end();
};

var _err503  = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 503;
	if (request.method != 'GET' || request.url !== '/path/no/exit'){
		res.statusCode = 500;
	}
  	res.end();
};


var _moreinfo  = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	if (request.method != 'GET' || request.url !== '/path/allinfo' ){
		res.statusCode = 500;
	}

	var respuesta = {main:{node1:'value',complex:{n1:'v1post',n2:'v2post'}}};
	
	res.setHeader('content-type', 'application/json');
	res.setHeader('inventado','me lo invento');
	res.write(JSON.stringify(respuesta)); //write a response to the client
  	res.end();
};

var _logTest  = function(request,body,res){
	//_showInfo(request,body);
	res.statusCode = 200;
	var respuesta = {main:{node1:'value',complex:{n1:'v1post',n2:'v2post'}}};
	res.setHeader('content-type', 'application/json');
	res.write(JSON.stringify(respuesta)); //write a response to the client
  	res.end();
};

