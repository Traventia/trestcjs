

// content of index.js
const trestc = require('../lib/trestc.js');
const http = require('http')  
const port = 3000

const requestHandler = (request, response) => {  
  console.log(request.url)
  response.end('Hello Node.js Server!')
}

//create a server object:
http.createServer(function (request, res) {
	var body = '';
    request.on('data', function (data) {
    	console.log(data.toString());
    	body += data;
        // Too much POST data, kill the connection!
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
        if (body.length > 1e6)
            request.connection.destroy();
    });

    request.on('end', function () {
		console.log('-----------------------------------------------------------------');
		console.log('one request received');
		console.log(request.method,request.url);
		console.log(request.headers);
		console.log(body);
		console.log('-----------------------------------------------------------------');
	        
		
		/*res.statusCode = 200;
		res.setHeader('Location', 'http://127.0.0.1:'+port+'/path/to');
	  	res.write('Hello World!'); //write a response to the client

	  	res.end(); //end the response*/


	  	//TIMEOUT TEST
	  	/*setTimeout(function(){
			res.statusCode = 200;
		  	res.write('Hello World!'); //write a response to the client

		  	res.end(); //end the response
		 },5000);

	  	//XML TEST
	  	/*res.statusCode = 200;
		res.setHeader('Location', 'http://127.0.0.1:'+port+'/path/to');
	  	res.write('<main><node1>value1</node1><complex><n1>v1</n1><n2></n2></complex></main>'); //write a response to the client
	  	res.end(); //end the response*/

	  	//JSON TEST
	  	/*res.statusCode = 200;
	  	console.log(JSON.parse(body));
	  	var respuesta = {main:{node1:'value',complex:{n1:'v1',n2:'v2'}}};
	  	res.write(JSON.stringify(respuesta)); //write a response to the client
	  	res.end(); */

	  	//FORM TEST
	  	res.statusCode = 200;
	  	var respuesta = {main:{node1:'value',complex:{n1:'v1',n2:'v2'}}};
	  	res.write(JSON.stringify(respuesta)); //write a response to the client
	  	res.end();
  	});
}).listen(port,function(err){

	//Subscribe a handler
	trestc.changeByDefaultConfiguration(true);
	trestc.subscribeLogHandler(function(logOptions,request,request_timestamp,response,response_timestamp){
		console.log('****************** LOG ^**************************');
		console.log(logOptions,request,request_timestamp,response,response_timestamp);
		console.log('***************************************************')
	})

	/*var options = {resdecod:{encoding:'utf8'},reqdecod:{type:'xml'}};
	var data = 'esto deberia liarla';


	trestc.http_post('127.0.0.1',port,'/path/to/resource',options,data,{value:1},function(err,res){
	//trestc.http_get('www.traventia.com',80,'/es-ES',{},null,{},function(err,res){
		console.log(err)
		console.log(res);
		process.exit(0);
	});*/

	//TIMEOUT TEST
	/*var options = {timeout:1000};
	trestc.http_get('127.0.0.1',port,'',options,null,{},function(err,res){
		console.log(err)
		console.log(res);
		process.exit(0);
	});*/


	//ERROR TEST
	/*var options = {};
	trestc.http_get('127.0.0.1',port+1,'',options,null,{},function(err,res){
		console.log(err)
		console.log(res);
		process.exit(0);
	});*/


	//XML SEND AND RECEIVED TEST
	/*var options = {
		reqdecod : {type:'xml'},
		resdecod : {type:'xml'},
	};
	var data = {
		node1 : 'value1',
		node2 : 'value2',
		complexNode : {
			cnode1 : 'cvalue1',
			cnode2 : 'cvalue2',
		}
	};
	trestc.http_post('127.0.0.1',port,'',options,data,{},function(err,res){
		console.log(err)
		console.log(res);
		process.exit(0);
	});*/


	//JSON SEND AND RECEIVED TEST
	/*var options = {
		reqdecod : {type:'json'},
		resdecod : {type:'json'},
	};
	var data = {
		node1 : 'value1',
		node2 : 'value2',
		complexNode : {
			cnode1 : 'cvalue1',
			cnode2 : 'cvalue2',
		}
	};
	trestc.http_post('127.0.0.1',port,'',options,data,{},function(err,res){
		console.log(err)
		console.log(res);
		process.exit(0);
	});*/

	//FORM SEND AND JSON RECEIVED TEST
	var options = {
		reqdecod : {type:'form'},
		resdecod : {type:'json'},
	};
	var data = {
		node1 : 'value1',
		node2 : 'value2',
		node3 : 'value3',
	};
	trestc.http_post('127.0.0.1',port,'',options,data,{},function(err,res){
		console.log(err)
		console.log(res);
		setTimeout(function(){
			process.exit(0);
		},1000);
		//process.exit(0);
	});	
});



