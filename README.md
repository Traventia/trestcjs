# trestcjs

Fast, simple, powerfull rest client for [node](http://nodejs.org).

```js
var trestcjs = require('trestcjs')
var options = {resdecod:{type:'json'}}
trestcjs.http_get('www.domain.com',80,'',options,null,null,function(error,response){});
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
    trestcjs.OPERATION(host,port,path,options,data,pathparams,callback);
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
If you want to make a POST request to http://www.domain.com/path/to/resource?value=1&other=2 with xml data :
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
trestcjs.http_post('www.domain.com',80,/path/to/resource,options,null,pathparams,function(error,response){
    //Response here...
});
```

  


