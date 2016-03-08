var ResponseHandler = require('./ResponseHandler');
var Request = require('./Request');

var https = require('https');
var querystring = require('querystring');

// Singleton pattern

var Client = (function() {
	var instance;
	
	function createInstance(userName, password) {
		var object = new Object();
		
		// Default values for authentification
		
		object.userName = userName;
		object.password = password;
		object.protocol = "https";
		object.method = "POST";
		object.host = "api.evercontact.com";
		object.path = "/pulse-api/tag";
		object.timeout = 15000;
		
		object.execute = function(request, callback) {
			var responseHandler = new ResponseHandler();
			var data = request.data;
			
			data.ApiUser = this.userName; // we add the POST field ApiUser
			
			var postData = querystring.stringify(data);
			
			var url = this.protocole + "://" + this.endPoint;
			
			// An object of options to indicate where to post to
			
			var port = 80;
			if(this.protocol === "https")
				port = 443;
			
			var postOptions = {
				host: this.host,
				port: port,
				path: this.path,
				method: this.method,
				headers: {
				  'Content-Type': 'application/x-www-form-urlencoded',
				  'Content-Length': Buffer.byteLength(postData),
				  'Authorization' : 'Basic ' + new Buffer(this.userName + ':' + this.password).toString('base64')
				}
			};
			

			// Set up the request
			
			var postReq = https.request(postOptions, function(res) {
			  res.setEncoding('utf8');
			  res.on('data', function (chunk) {
				try {
					var result = JSON.parse(chunk);
					  
					if(result.success) {
					  responseHandler.status = ResponseHandler.ResponseStatus.SUCCEED;
					  responseHandler.createContact(result.signature);
					}
					else {
					  responseHandler.status = ResponseHandler.ResponseStatus.FAILED;
					  responseHandler.errors = result.errorMessages;
					}

					callback(responseHandler);
				} catch(e) {
					responseHandler.status = ResponseHandler.ResponseStatus.FAILED;
				}
			  });
			});
  
			postReq.setTimeout(this.timeout, function() {
				responseHandler.status = ResponseHandler.ResponseStatus.TIME_OUT;
				postReq.abort()
			});
			
			postReq.on('error', function(err) {
				console.log(err);
				responseHandler.status = ResponseHandler.ResponseStatus.FAILED;
				callback(responseHandler)
			});

			// Post the data
			postReq.write(postData);
			postReq.end();
			
		};
		
		return object;
	}
	
	return {
		getDefault : function(userName, password) {
			if(!instance) {
				instance = createInstance(userName, password);
			} else {
				instance.userName = userName;
				instance.password = password;
			}
			
			return instance;
		}
	};
	
})();

module.exports = Client;