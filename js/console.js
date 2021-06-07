function Console(_element, console) {
	const div = _element;

	function createMessage(msg, color) {
		// Sanitize the input
		msg = msg.toString().replace(/</g, '&lt;');
		var span = document.createElement('SPAN');
		if (color != undefined) {
			span.style.color = color;
		}
		span.appendChild(document.createTextNode(msg));
		return span;
	}

	this._append = function(element) {
		div.appendChild(element);
		div.appendChild(document.createElement('BR'));
		// $(window).scrollTo('max', {duration: 500});
	};

	/**
	 * Show an Error message both on browser console and on defined DIV
	 * 
	 * @param msg:
	 *            message or object to be shown
	 */
	this.error = function(msg) {
		console.error(msg);
		this._append(createMessage(msg, "#FF0000"));
	};

	/**
	 * Show an Warn message both on browser console and on defined DIV
	 * 
	 * @param msg:
	 *            message or object to be shown
	 */
	this.warn = function(msg) {
		console.warn(msg);
		this._append(createMessage(msg, "#FFA500"));
	};

	/**
	 * Show an Info message both on browser console and on defined DIV
	 * 
	 * @param msg:
	 *            message or object to be shown
	 */
	this.info = this.log = function(msg) {
		console.info(msg);
		this._append(createMessage(msg));
	};

	/**
	 * Show an Debug message both on browser console and on defined DIV
	 * 
	 * @param msg:
	 *            message or object to be shown
	 */
	this.debug = function(msg) {
		console.log(msg);
		// this._append(createMessage(msg, "#0000FF"));
	};
}
