var Request = require('./Request');

// Constants for accuracy mode
var Accuracy = {
	LOW : 0,
	NORMAL : 1,
	HIGH : 2
};

// Constants for addressing mode
var Addressing = {
	EXPLICIT_FROM : 0,
	EXPLICIT_TO : 1,
	OTHER : 2
};


function RequestHelper() {
	// Default values
	
	this.subject = "";
	this.headerFrom = "";
	this.headerTo = "";
	this.headerCC = [];
	this.date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	this.content = "";
	this.analysisStrategy = "WTN_EVERYWHERE";
	this.addressingMode = "OTHER";
	this.attachedFiles = [];
}

RequestHelper.prototype.build = function() {
	var postData = {
		'Date' : this.date,
		'Subject' : this.subject,
		'HeaderFrom' : this.headerFrom,
		'HeaderTo' : this.headerTo,
		'HeaderCC' : this.headerCC,
		'AddressingMode' : this.addressingMode,
		'AttachedFiles' : this.attachedFiles,
		'Content' : this.content,
		'AnalysisStrategy' : this.analysisStrategy
	};
	
	return new Request(postData);
};

RequestHelper.prototype.withAccuracy = function(accuracy) {
	switch(accuracy) {
		case Accuracy.LOW:
			this.analysisStrategy = "KWAGA_GADGET";
			break;
		case Accuracy.NORMAL:
			this.analysisStrategy = "WTN_EVERYWHERE";
			break;
		case Accuracy.HIGH:
			this.analysisStrategy = "KWAGA_CORE";
			break;
	}
        
    return this;
};
	
RequestHelper.prototype.withDate = function(date) {
	this.date = date;
	return this;
};
	
RequestHelper.prototype.withSubject = function(subject) {
	this.subject = subject;
    return this;
};
	
RequestHelper.prototype.withContent = function(content) {
	this.content = content;
    return this;
};
	
RequestHelper.prototype.withHeaderFrom = function(headerFrom) {
	this.headerFrom = headerFrom;
    return this;
};

RequestHelper.prototype.withHeaderTo = function(headerTo) {
	this.headerTo = headerTo;
    return this;
};
	
RequestHelper.prototype.withHeaderCC = function(headerCC) {
	this.headerCC.push(headerCC);
    return this;
}


RequestHelper.prototype.withAddressingMode = function(mode) {
	switch(mode) {
		case Addressing.EXPLICIT_FROM:
			this.addressingMode = "EXPLICIT_FROM";
			break;
		case Addressing.EXPLICIT_TO:
			this.addressingMode = "EXPLICIT_TO";
			break;
		default:
			this.addressingMode = "OTHER";
			break;
	}
        
    return this;
}
	
RequestHelper.prototype.withAttachedFile = function(fileName) {
	this.attachedFiles.push(fileName);
    return this;
}

module.exports = RequestHelper;
module.exports.Accuracy = Accuracy;
module.exports.Addressing = Addressing;
