"use strict";
var gapiPromise;

const CLIENT_SECRET = "5b7c2215a61b7b0014b6fc01"

function pause(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Implementación buena para barajar el array de opciones
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	
	return array;
}

// Los atributos de vote ya se concretarán pero básicamente serán el id interno y el rating (1 si le gusta o 0 si no le gusta).
// No llaméis a esta promesa si ha dicho que no quiere dar su opinión sobre esa opción, evidentemente.
function sendVote(vote) {

	// Vote is an object with to attributes
	// rating - Integer in the set {1,0}
        // id - Id of product


	return new Promise((resolve, reject) => {
	    // TODO: Check that the user is lloged in with google

	    if (!gapi.auth2.getAuthInstance().isSignedIn.get()){
			reject(1)
		}
	    
		var vote_data = {
			"userToken": retriveUserGToken(),
			"productId": vote.id,
			"rating": vote.rating
		}

		$.ajax({
			type: "POST",
			url: BASE_URL + "/vote" + "?key-id=" + CLIENT_SECRET,
			processData: false,
			contentType: false,
			data: JSON.stringify(vote_data),
			complete: function(xhr, textStatus) {
				if (xhr.status < 400){
					resolve()
				} else {
					reject()
				}
			}
		})
	});
}

function sendUnsafeVote(vote) {
    return new Promise((resolve,reject) => {
        var vote_data = {
            "userId" : vote.userId,
            "productId" : vote.id,
            "rating" : vote.rating
        }
        $.ajax({
            type:"POST",
            url : BASE_URL + "/unsafe-vote"+"?key-id=" + CLIENT_SECRET,
            contentType: false,
            data: JSON.stringify(vote_data),
            complete: function(xhr, textStatus) {
                if (xhr.status < 400){
                    resolve()
                } else {
                    reject()
                }
            }
        })
    });

}

function checkUserData(){
	$.ajax({
		type: "GET",
		url: BASE_URL_GIFTYCK + "/customer-registered" + "?token=" + retriveUserGToken(),
		processData: false,
		contentType: 'application/json',
		success: function(data){
			console.log(data)
			if (data.completed !== true){
				showModalInfo();
				console.log("User not registered")
			}else {
				console.log("User registered")
			}
		}
	})
}

function showModalInfo(){
	$('#dataModal').modal('show')
}
