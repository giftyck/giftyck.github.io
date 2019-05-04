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
window.recommendationMode = newObservable("consolidated");

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	
	return array;
}

async function randomItems() {
	let randItems = [...await items];
	return shuffle(randItems).slice(0, 10);
}

function getRecommendedIds(ratings, mode) {
	return new Promise((resolve, reject) => {
		if (!ratings.size)
			return resolve([]);
		
		let queryString = `?mode=${mode}&`;
		
		for (let [key, value] of ratings)
			queryString += `${key}=${value}&`;
		
		let request = new XMLHttpRequest();
		request.open("GET", 'https://giftyck-engine.herokuapp.com/recommend' + queryString);
		request.responseType = "json";
		request.onload = () => {
			if (request.status < 400) {
				resolve(request.response);
			}
			else reject(request.statusText);
		};
		request.onerror = () => reject(request.statusText);
		request.send();
	});
}

async function getRecommendedItems(ratings, mode) {
	let all_items = await items;
	
	let recommended = (await getRecommendedIds(ratings, mode)).map(item => {
		return all_items[item._id - 1];
	});
	
	if (recommended.length < 1)
		recommended = randomItems();
	
	return recommended;
}

window.recommendedItems = newObservable(randomItems());
recommendationMode.subscribe(document, () => {
	recommendedItems.value = getRecommendedItems(ratings.value, recommendationMode.value);
});
ratings.subscribe(document, () => {
	recommendedItems.value = getRecommendedItems(ratings.value, recommendationMode.value);
});

recommendedItems.remove = function(index) {
	async function newRecommended() {
		let recommended = await recommendedItems.value;
		recommended.splice(index, 1);
		return recommended;
	}
	
	recommendedItems.value = newRecommended();
}
