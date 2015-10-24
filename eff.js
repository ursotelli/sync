(function(window, document) {

	var textarea = document.getElementsByTagName('textarea')[0],
	    characters = document.getElementById('characters'),
	    bytes = document.getElementById('bytes'),
	    payloadSize = document.getElementsByTagName('input')[0],
	    messageNb = document.getElementById('messageNb'),
	    removeFormatButton = document.getElementsByTagName('button')[0],
	    parseJsonButton = document.getElementsByTagName('button')[1],
	    regexNumberGroup = /(?=(?:\d{3})+$)(?!\b)/g,
	    // https://mathiasbynens.be/notes/localstorage-pattern
	    storage = (function() {
	    	console.log(payloadSize);
	    	var uid = new Date,
	    	    storage,
	    	    result;
	    	try {
	    		(storage = window.localStorage).setItem(uid, uid);
	    		result = storage.getItem(uid) == uid;
	    		storage.removeItem(uid);
	    		return result && storage;
	    	} catch(e) {}
	    }());


	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	function formatNumber(number, unit) {
		return String(number).replace(regexNumberGroup, ',') + ' ' + unit + (number == 1 ? '' : 's');
	}

	function update() {
		var value = textarea.value.replace(/\r\n/g, '\n'),
		    // encodedValue = encode(value),
		    byteCount = utf8.encode(value).length, // https://mths.be/utf8js
		    pSize = Number(payloadSize.value)*Math.pow(10, 6);
		    characterCount = ucs2decode(value).length;
		    msgNb = Math.floor(pSize/byteCount);
		characters.innerHTML = formatNumber(characterCount, 'character');
		bytes.innerHTML = formatNumber(byteCount, 'byte');
		messageNb.innerHTML = formatNumber(msgNb, 'reservation');
		storage && (storage.byteCountText = value) && (storage.payloadSizeText = pSize/Math.pow(10^6));
	};

	function removeFormatting() {
		textarea.value = JSON.stringify(JSON.parse(textarea.value));
		update();
	};

	function addFormatting() {
		var ugly = textarea.value;
    	var obj = JSON.parse(ugly);
		var pretty = JSON.stringify(obj, undefined, 4);
		textarea.value = pretty;
		update();
	}

	// https://mathiasbynens.be/notes/oninput
	textarea.onkeyup = update;
	textarea.oninput = function() {
		textarea.onkeyup = null;
		update();
	};
	payloadSize.onkeyup = update;
	payloadSize.oninput = function() {
		payloadSize.onkeyup = null;
		update();
	}

	removeFormatButton.onclick = removeFormatting;
	parseJsonButton.onclick = addFormatting;

	if (storage) {
		storage.byteCountText && (textarea.value = storage.byteCountText) ;
		update();
	}

	window.onhashchange = function() {
		textarea.value = decodeURIComponent(location.hash.slice(1));
		update();
	};

	if (location.hash) {
		window.onhashchange();
	}

}(this, document));


