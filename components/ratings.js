"use strict";
window.ratings = newObservable(new Map());

ratings.set = function(id, rating) {
	ratings.value.set(id, rating);
	ratings.event.dispatch();
}
