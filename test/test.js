
var chai = require('chai');
var should = require('chai').should();

const trestc = require('../lib/trestc.js');
var testSever = require('./test_server.js');

var port = 60000;
describe('Http Sever start', function() {
	it('should return -1 when the value is not present', function(done) {
  		testSever.createServerTest(port,function(err){
  			done();
  		});
	});
});

describe('HTTP', function() {
	describe('Base errors check', function() {

		// Timeout Error
		it('Should response with timeout error', function(done) {
			var options = {timeout:1000};
			testSever.selectTest('timeout');
			trestc.http_get('127.0.0.1',port,'',{},options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(3)
				done();
			});
		});

		// Check response with an error when 
		it('Should response with a communication error', function(done) {
			var options = {timeout:360000};
			trestc.http_get('127.0.0.1',55000,'',{},options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(2)
				done();
			});
		});

		// Check response with an error when 
		it('Should response with a http code unknown code', function(done) {
			var options = {timeout:360000};
			trestc.http('MELOINVENTO','127.0.0.1',port,'',{},null,options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(5)
				done();
			});
		});		
	});

	describe('Get/post/put/delete operations with correct information transmision/reception and status 200', function() {
		// check a standar get request
		it('Should make a get request with url parameters and receive and process a json', function(done) {
			var options = {timeout:360000,resdecod:{type:'json'}};
			testSever.selectTest('get');
			var resultExpected = JSON.stringify({main:{node1:'value',complex:{n1:'v1',n2:'v2'}}})
			trestc.http_get('127.0.0.1',port,'/path/get',{p1:1,p2:2},options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				resJson = JSON.stringify(res);
				resJson.should.equal(resultExpected);
				done();
			});
		});

		// check a standard post request with parameters as a form and receive a post
		it('Should make a post request with form parameters and receive and process a json', function(done) {
			var options = {timeout:360000,resdecod:{type:'json'},reqdecod:{type:'form'}};
			testSever.selectTest('post');
			var resultExpected = JSON.stringify({main:{node1:'value',complex:{n1:'v1post',n2:'v2post'}}})
			var data = {
				name:'foo',password:'bar'
			};
			trestc.http_post('127.0.0.1',port,'/path/post',{p1:1,p2:3},data,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				resJson = JSON.stringify(res);
				resJson.should.equal(resultExpected);
				done();
			});
		});

		// check a standard put request with parameters as a form and receive a post
		it('Should make a put request with xml parameters and receive and process a xml', function(done) {
			var options = {timeout:360000,resdecod:{type:'xml'},reqdecod:{type:'xml'}};
			testSever.selectTest('put');
			var resultExpected = JSON.stringify({ trestcjs: { name: 'foo', password: 'bar', complex: { data: ["1","2","3"] } } })
			var data = {
				name:'foo',
				password:'bar',
				complex : {
					data : [1,2,3]
				}
			};
			trestc.http_put('127.0.0.1',port,'/path/put',{p1:1,p2:4},data,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				resJson = JSON.stringify(res);
				resJson.should.equal(resultExpected);
				done();
			});
		});

		// check a standard put request with parameters as a form and receive a post
		it('Should make a delete request with xml parameters and receive and process a direct', function(done) {
			var options = {timeout:360000,resdecod:{type:'direct'},reqdecod:{type:'json'}};
			testSever.selectTest('delete');
			var resultExpected = "esto es una respuesta";
			var data = {
				name:'foo',
				password:'bar',
				complex_json : {
					data : [1,2,3]
				}
			};
			trestc.http_delete('127.0.0.1',port,'/path/delete',{p1:1,p2:5},data,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				res.toString().should.equal(resultExpected);
				done();
			});
		});

		// check a standard post request with parameters as a form and receive a post
		it('Should make a post request with direct data and add custom header parameters', function(done) {
			var options = {timeout:360000,resdecod:{type:'direct'},reqdecod:{type:'direct'},headers:{SOAPAction:'kakadevaka'}};
			testSever.selectTest('directDataAndCustomParameters');
			var resultExpected = JSON.stringify({main:{node1:'value',complex:{n1:'v1post',n2:'v2post'}}})
			var data = "DATODIRECTO";
			trestc.http_post('127.0.0.1',port,'/path/post/2',{p1:2,p2:1},data,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				res.toString().should.equal(data);
				done();
			});
		});

		// make a delete without paarameters nor data
		it('Should make a delete request without params and data', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('cleandelete');
			trestc.http_delete('127.0.0.1',port,'/path/delete/3',null,null,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

	});
	  
	describe('Redirect 301', function() {
		// make a delete without paarameters nor data
		it('Should make a redirect', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('redirect');
			trestc.http_put('127.0.0.1',port,'/path/redirect/me',null,null,options,function(err,res){
				should.not.exist(err);
				should.exist(res);
				done();
			});
		});

		// make a delete without paarameters nor data
		it('Should make a inifinite redirect and give an error', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('infiniteredirect');
			trestc.http_delete('127.0.0.1',port,'/path/redirect/me/forever',null,null,options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(4)
				done();
			});
		});

		// make a delete without paarameters nor data
		it('Should redive a redirect wrong without location and return an error', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('infinitewrong');
			trestc.http_post('127.0.0.1',port,'/path/redirect/me',null,null,options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(12)
				done();
			});
		});		
	});

	describe('Other Http reception', function() {
		// make a delete without paarameters nor data
		it('Received 404', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('err404');
			trestc.http_get('127.0.0.1',port,'/path/no/exit',null,options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(10)
				err.statusCode.should.equal(404);
				done();
			});
		});

		// make a delete without paarameters nor data
		it('Received 503', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'}};;
			testSever.selectTest('err503');
			trestc.http_get('127.0.0.1',port,'/path/no/exit',null,options,function(err,res){
				should.exist(err);
				err.should.be.a('object');
				err.error.code.should.equal(10)
				err.statusCode.should.equal(503);
				done();
			});
		});	
	});

	describe('Moreinfo data', function() {
		// make a delete without paarameters nor data
		it('Request info redeived', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'},resdecod:{type:'json'}};
			testSever.selectTest('moreinfo');
			trestc.http_get('127.0.0.1',port,'/path/allinfo',null,options,function(err,res,resInfo){
				should.not.exist(err);
				should.exist(res);
				should.exist(resInfo);
				resInfo.statusCode.should.equal(200)
				resInfo.headers.inventado.should.equal('me lo invento')
				done();
			});
		});
	});

	describe('Log features', function() {
		// make a delete without paarameters nor data
		it('test', function(done) {
			var options = {timeout:360000,headers:{SOAPAction:'kakadevaka'},reqdecod:{type:'json'},resdecod:{type:'json'}};
			testSever.selectTest('log');
			var data = 'B';
			trestc.changeByDefaultConfiguration(true);
			trestc.subscribeLogHandler(function(a,b,c,d){
				/*console.log('****');
				console.log(a);
				console.log('****');
				console.log(b);
				console.log('****');
				console.log(c);
				console.log('****');
				console.log(d);
				console.log('****');*/
			});
			trestc.http_post('127.0.0.1',port,'/path/allinfo',null,data,options,function(err,res,resInfo){
				//console.log(err,res,resInfo);
				done();
				/*should.not.exist(err);
				should.exist(res);
				should.exist(resInfo);
				resInfo.statusCode.should.equal(200)
				resInfo.headers.inventado.should.equal('me lo invento')
				done();*/
			});
		});
	});
});