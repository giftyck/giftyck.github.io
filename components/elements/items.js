"use strict";
async function recommendedElement() {
	let container = htmlToElement(`<div id="product-board" class="row"></div>`);
	let items = await recommendedItems.value;
	
	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		
		container.appendChild(htmlToElement(`<div class="col s12 m3 ${i != 0 && "hide-on-small-only" || ''}">
           <div class="card hoverable">
               <div class="card-image">
                   <img src="static/img/${item.img}.jpg">
               </div>
               <div class="card-content">
                   <span class="card-title">${item.name}</span>
                   <p>${item.description}</p>
               </div>
               <div class="card-action center-align">
                   <a onclick="ratings.set(${item.id}, 0)" class="btn-large red waves-effect">No</a>
                   <a onclick="recommendedItems.remove(${i})" class="btn-large blue waves-effect">??</a>
                   <a onclick="ratings.set(${item.id}, 1)" class="btn-large waves-effect">Si</a>

               </div>
           </div>
      </div>`));
	}
	
	return container;
}

async function updateRecommended() {
	replaceElement(document.getElementById("product-board"), await recommendedElement());
}

updateRecommended();
recommendedItems.subscribe(document, updateRecommended);
