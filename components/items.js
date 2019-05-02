"use strict";
function importItems() {
	return new Promise((resolve, reject) => {
		let request = new XMLHttpRequest();
		request.open("GET", 'static/giftyck_catalog.json');
		request.responseType = "json";
		request.onload = () => {
			if (request.status < 400) resolve(request.response);
			else reject(request.statusText);
		};
		request.onerror = () => reject(request.statusText);
		request.send();
	});
}

window.items = importItems();
window.recommendationMode = newObservable();

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	
	return array;
}

async function randomItems() {
	let randItems = [...await items];
	return shuffle(randItems).slice(0, 8);
}

async function getRecommendedItems(ratings, mode) {
	console.log(ratings);
	return randomItems();
}

window.recommendedItems = newObservable(randomItems());
recommendationMode.subscribe(document, () => {
	recommendedItems.value = getRecommendedItems(ratings.value, recommendationMode.value);
});
ratings.subscribe(document, () => {
	recommendedItems.value = getRecommendedItems(ratings.value, recommendationMode.value);
});
