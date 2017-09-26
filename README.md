# trestcjs

Fast, simple, powerfull rest client for [node](http://nodejs.org).

```js
var trestcjs = require('trestcjs')
var options = {resdecod:{type:'json'}}
trestcjs.http_get('www.domain.com',80,'',null,null,options,function(error,response){});
```

## Installation

```bash
$ npm install trestcjs
```

## Features

  * Typical http method allowed (GET,POST,PUT,DELETE)
  * Allow http and https request
  * Allow convert automatically request data from js to JSON,XML,FORM or Direct
  * Allow parse automatically data reponse from JSON or XML to js
  * Redirection automatic negotation
  * Allow custom log request implementation
  * Powefull configuration.

## Documentation
General Rest request:
```js
    trestcjs.OPERATION(host,port,path,pathparams,data,options,callback);
    trestcjs.http_get(host,port,path,pathparams,options,callback); //No Data. Also https_get
    trestcjs.http(method,host,port,path,pathparams,data,options,callback);//Added parameter method. Also https
```

### Operations
Valid operations are:
  * http_get : HTTP/GET
  * http_post : HTTP/POST
  * http_put : HTTP/PUT
  * http_delete : HTTP/DELETE
  * https_get : HTTPS/GET
  * https_post : HTTPS/POST
  * https_put : HTTPS/PUT
  * https_delete : HTTPS/DELETE
  * http : HTTP/XXX (In this case function has an extra parameter method to indicate the method to use)
  * https : HTTPS/XXX (In this case function has an extra parameter method to indicate the method to use)

### Function Parameters

  * host: domain/ip to request (www.example.com)
  * port: port to request (typical 80 in http and 443 in https)
  * path: path to request (/path/to/resource)
  * options: options, will be described later
  * data: Data to send with request. Can be a string or a Javascript object that can be converted by client to JSON, XML or url-form-encoded depending on options
  * pathparams: object with parameters to include to path. For example {value=1,other=2} modify path to ?value=1&value=2
  * callback: callback for response. Standard (error,response)
  
#### Example
If you want to make a PUT request to http://www.domain.com/path/to/resource?value=1&other=2 with xml data :
<node>
<node1>value</node1>
<node2>value</node2>
<node>
just:
```js
var trestcjs = require('trestcjs')
var options = {reqdecod:{type:'xml',xmlhead:'node'}}
var pathparams = {value:1,other:2}
var data = {node1:value,node2:value}
trestcjs.http_put('www.domain.com',80,/path/to/resource,options,null,pathparams,function(error,response){
    //Response here...
});
```

Other Example. If you want to make a POST with a form with data a=1 and b = 2 to  http://www.domain.com/path/to/resource:
```js
var trestcjs = require('trestcjs')
var options = {reqdecod:{type:'form'}}
var data = {a:1,b:2}
trestcjs.http_post('www.domain.com',80,/path/to/resource,options,null,pathparams,function(error,response){
    //Response here...
});
```
### OPTIONS
trestcjs has several options parameters. All of them are object (except trace that is boolean) and can be included in options or not (they are not mandatory)
* headers
* auth
* cert
* reqdecod
* resdecod
* trace
* log
#### Headers Options
trestcjs allow custom header parameter. Any parameter that you include in the object header will include in the header of request. For example you can set headers['SOAPAction'] = 'blabla' and this parameter will be received from server in headers. Remember that http headers are case INsensitive.
One aclaration, by default, trestcjs include the parameter 'accept-encoding' as 'gzip, deflate' but you can rewrite including this parameter in header or removing just setting to '' => headers['accept-encoding'] = ''
#### Auth Options
Right now the only supported authorization method is Basic Auth, you set it as:
```js
auth : {
  type : 'basic',
  username: 'your username',
  password: 'your password'
}
```
#### Cert Options
You can include cert key/secret and even cert authority:
```js
cert : {
  key: 'local/path/to/key',
  cert: 'local/path/to/cert',
  ca: 'local/path/to/ca'
}
```
More information in the official node documentation: https://nodejs.org/api/tls.html
  
#### reqdecod
This object allow configure request decoding (data and text). Fields:
```js
reqdecod : {
  type: 'xml', //Valid xml, json, form and direct
  encoding: 'utf-8' //text encoding of request
}
```
If you set reqdecod.type, system will use this as a data converter and will set automatically content-type. If you don't set this, check if you set content-type and if not just assign direct
Allowed encoding:
#### resdecod
Same as reqdecod. If type is not set, check content-type in headers of response
```js
resdecod : {
  type: 'xml', //Valid xml, json, form and direct
  encoding: 'utf-8' //text encoding of request
}
```
#### trace
If you set this field in options and set as true, the callback of response will include two extrafields : statusCode and trace. Trace is an object with all data/headers/information of request and response with:
```js
trace : {
  req: {} // Object with request data
  res: {} //Object with response data
}
```
#### log
If you want to include your own asyncronous log, you have to set this field with the "log tag" you want for the current request.
```js
log : {
  tag: "YourRulesTag" // Your custom tag to identify request
}
```
Custom log will be explained later

### Response and error
Callback will have 2 or 4 parameters:
error,data[,statusCode,trace]
when statusCode or trace only will be included if trace=true or log.tag exists.
* 2XX response
If a request receive a 2XX code, will be considered as ok request and the callback will have error=null and data="body of response already converted if type apply"
* 4xx/5xx response
If a request receive a 4XX or 5XX code will be considered as an error with error=THEERROR and data=null (if a request has body data, you can check it in trace)
Error format:
```js
{
  code //The error code
  msg //Message of this error
  (info) //Extra info of error, not mandatory
  (statusCode) //Error received from server (4XX,5XX). If trestcjs doesnt receive response (timeout or unreachable) then this field will not exists
}
```
* 3xx response
trestcjs will continue with request making automatically the redirection. If it's impossible to follow or is a continoous loop (max depth:5) then will response with error Format explained before

### LOG
Is possible to create a custom and async log procedure. If you set log.tag in a request, trestcjs will emit two events:
"requestStart" and "requestEnd" when request is sended and response is received (respectively). To subscribe to event just:
```js
trestcjs.on('requestStart',function(tag,trace){

});
```
tag is log.tag you assign to request,
trace is equal to trace in callback but only trace.req or trace.res depending on if is requestStart Event or requestEnd event

## VERSION
#### v1.0.0
First version in client with all features


