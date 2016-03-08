var Type =
{
	PHONE : "PHONE",
	ADDRESS : "ADDRESS",
	EMAIL : "EMAIL",
	SOCIAL_NETWORK : "SOCIAL_NETWORK"
};

var Kind =
{
	WORK : "WORK",
	HOME : "HOME",
	MOBILE : "MOBILE",
	WORK_FAX : "WORK_FAX",
	FACEBOOK : "FACEBOOK",
	SKYPE : "SKYPE",
	TWITTER : "TWITTER",
	LINKED_IN : "LINKED_IN"
};

function Value(string, streetAddress, extendedAddress, city, state, postalCode, country) {
	this.string = string;
	
	this.streetAddress = streetAddress || null;
	this.extendedAddress = extendedAddress || null;
	this.city = city || null;
	this.state = state || null;
	this.postalCode = postalCode || null;
	this.country = country || null;
	
}

function ContactField(type, kind, value) {
	this.type = type;
	this.kind = kind;
	this.value = value;
}

module.exports = ContactField;
module.exports.Type = Type;
module.exports.Kind = Kind;
module.exports.Value = Value;