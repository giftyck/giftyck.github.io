"use strict";
import telegram from '../telegram.js';

window.testContact = function(event) {
	event.preventDefault();
	telegram("hola");
}
