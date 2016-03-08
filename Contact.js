var ContactField = require('./ContactField');

function Contact(vCard) {
	this.fields = [];
	
	this.firstName = "";
	this.lastName = "";
	this.fullName = "";
	this.organization = "";
	this.jobPosition = "";
	
	this.initFromVCard(vCard);
}

Contact.prototype.initFromVCard = function(vCard) {
	vCard = vCard.replace(/\r\n/g, "\r\n\r\n"); // so that no results are omitted !
	
	// Add to RegExp prototype : get all matches with a regex
	RegExp.prototype.execAll = function(string) {
		var matches = [];
		var match = null;
		while ( (match = this.exec(string)) != null ) {
			var matchArray = [];
			for (var i in match) {
				if (parseInt(i) == i) {
					matchArray.push(match[i]);
				}
			}
			matches.push(matchArray);
		}
		return matches;
	}
	
	// Names
	var matches = vCard.match(/\r\nFN:(.*)\r\n/);
	if(matches && matches.length === 2) {
		this.fullName = matches[1].replace(/\\/g, ""); // strip slashes
	}
	
	matches = vCard.match(/\r\nN:(.*)\r\n/);
	if(matches && matches.length === 2) {
		// Sets the firstname and the lastname from the N field

		var information = matches[1].split(";");
		
		if(information && information.length >= 2) {
			this.firstName = information[1].replace(/\\/g, ""); // strip slashes
			this.lastName = information[0].replace(/\\/g, "");
		}
	}
	
	// Job
	
	matches = vCard.match(/\r\nORG:(.*)\r\n/);
	if(matches && matches.length === 2) {
		this.organization = matches[1].replace(/\\/g, ""); // strip slashes
	}
	
	
	matches = vCard.match(/\r\nROLE:(.*)\r\n/);
	if(matches && matches.length === 2) {
		this.jobPosition = matches[1].replace(/\\/g, ""); // strip slashes
	}
	
	// Phone
	
	matches = /\r\nTEL(;TYPE=(.*))?:(.*)\r\n/g.execAll(vCard);
	
	for(var i = 0; i < matches.length; i++) {
		var match = matches[i];
		var kind = ContactField.Kind.WORK;
		
		if(match && match.length === 4) {
			switch(match[2]) {
				case 'CELL':
					kind = ContactField.Kind.MOBILE;
					break;
				case 'FAX':
					kind = ContactField.Kind.WORK_FAX;
					break;
			}
			
			this.fields.push(new ContactField(ContactField.Type.PHONE, kind, new ContactField.Value(match[3].replace(/\\/g, ""))));
		}
			
	}
	
	// Email
	
	matches = vCard.match(/\r\nEMAIL:(.*)\r\n/);
	if(matches && matches.length === 2) {
		this.fields.push(new ContactField(ContactField.Type.EMAIL, ContactField.Kind.WORK, new ContactField.Value(matches[1].replace(/\\/g, ""))));
	}
	
	// Address
	
	matches = vCard.match(/\r\nADR(;(TYPE=|.*)(.*))?:(.*);(.*);(.*);(.*);(.*);(.*);(.*)\r\n/);
	if(matches && matches.length === 11) {
		var kind;
		
		switch(matches[3]) { // if TYPE=HOME option, defines ContactField.Kind accordingly
			case "HOME":
				kind = ContactField.Kind.HOME;
				break;
			case "WORK":
				kind = ContactField.Kind.WORK;
				break;
			default:
				kind = ContactField.Kind.WORK;
				break;
		}
	
		var extendedAddress = matches[5];
		var streetAddress = matches[6];
		var city = matches[7]; // locality
		var state = matches[8]; // state or province
		var postalCode = matches[9];
		var country = matches[10];
				
		// We parameter the address display 
				
		if(country.indexOf("specified") !== -1) // country equals "Not specified" (charset issue)
			country = "";
					
		address = streetAddress;
				
		if(extendedAddress)
			address += ", " + extendedAddress;
		if(postalCode)
			address += ", " + postalCode;
		if(city)
			address += " " + city;
		if(state)
			address += ", " + state;
		if(country)
			address += ", " + country;
				
		address = address.replace(/\\/g, ""); // stri slashes
		address = address.replace(/,$/, ""); // end comma
		address = address.replace(/^,/, ""); // beginning comma
				
		value = new ContactField.Value(address, streetAddress, extendedAddress, postalCode, city, state, country);
		
		this.fields.push(new ContactField(ContactField.Type.ADDRESS, kind, value));
	
	}
	
	
	// Social networks
	
	var tableau = [];
	tableau[3] = 3;
	
	var socialNetworksAlreadyAdded = {}; // To avoid repetitions with X-URL and X-ID
	socialNetworksAlreadyAdded[ContactField.Kind.TWITTER] = false;
	socialNetworksAlreadyAdded[ContactField.Kind.LINKED_IN] = false;
	socialNetworksAlreadyAdded[ContactField.Kind.FACEBOOK] = false;
	socialNetworksAlreadyAdded[ContactField.Kind.SKYPE] = false;
	
	var parameters = ["URL-", "ID:"];
	for(var i = 0; i < parameters.length; i++) { // We parse X-URL then X-ID
		field = parameters[i];
		
		matches = new RegExp("\r\nX-" + field + "([^:]*):(.*)\r\n", "g").execAll(vCard);
	
		for(var j = 0; j < matches.length; j++) {
			var match = matches[j];
			
			if(match && match.length === 3) {
				match[1] = match[1].toUpperCase();
				var kind = -1; // -1 if the social network is unknown
				
				switch(match[1]) {
					case "TWITTER":
						kind = ContactField.Kind.TWITTER;
						break;
					case "LINKEDIN":
						kind = ContactField.Kind.LINKED_IN;
						break;
					case "SKYPE":
						kind = ContactField.Kind.SKYPE;
						break;
					case "FACEBOOK":
						kind = ContactField.Kind.FACEBOOK;
						break;
				}
				
				if(kind !== - 1 && !socialNetworksAlreadyAdded[kind]) { // If the social network has been recognized and not added yet
					this.fields.push(new ContactField(ContactField.Type.SOCIAL_NETWORK, kind, new ContactField.Value(match[2].replace(/\\/g, ""))));
                    socialNetworksAlreadyAdded[kind] = true;
                }
			}
		}
	}
	
}

Contact.prototype.debugInfo = function() {
	var result = "";
		
	result += "******************\n";
	result += "* Contact object *\n";
	result += "******************\n";
	result += "Firstname: " + this.firstName + "\n";
	result += "Lastname: " + this.lastName + "\n";
	result += "Full name: " + this.fullName + "\n";
	result += "Organization: " + this.organization + "\n";
	result += "Job position: " + this.jobPosition + "\n";
		
	for(var i = 0; i < this.fields.length; i++) {
		var field = this.fields[i];
		result += "Field: " + field.type + " " + field.kind + " " + field.value.string + "\n";
		if(field.type == ContactField.Type.ADDRESS) {
			result += "Street address: " + field.value.streetAddress + ", extended address: " + field.value.extendedAddress + ", postalCode: " + field.value.postalCode + ", city: " + field.value.city + ", state: " + field.value.state + ", country: " + field.value.country + "\n";
		}
	}

	result += "******************" + "\n";
	
	return result;
}

module.exports = Contact;