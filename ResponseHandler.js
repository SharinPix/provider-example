var Contact = require('./Contact');
var ContactField = require('./ContactField');

var ResponseStatus = {
	FAILED : 0,
	SUCCEED : 1,
	TIME_OUT : 2
};

function ResponseHandler() {
	this.status = ResponseStatus.FAILED;
	this.errors = [];
	this.detectedContact = null;
	this.detectedContactAsVCard = "";
}

ResponseHandler.prototype.createContact = function(vCard) {
	this.detectedContactAsVCard = vCard;
	this.detectedContact = new Contact(vCard);
}

ResponseHandler.prototype.hasDetectedContact = function() {
	return !(this.detectedContact === null);
}


module.exports = ResponseHandler;
module.exports.ResponseStatus = ResponseStatus;