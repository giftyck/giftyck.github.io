var id_token; // Token provided by Google
var api_token; // Token de bayes
var products;
var show = 5; // Number of product to show
var catalog = './static/giftyck_catalog.json';

var notificationDelay = 500;

const BASE_URL = "https://bayes-recommender.herokuapp.com";
const BASE_URL_GIFTYCK = "https://giftyck-server.herokuapp.com";

var user_email;
var tmp_user_id;

function onSignIn(googleUser) {
    id_token = googleUser.getAuthResponse().id_token;
    var profile = googleUser.getBasicProfile()

    // Upload the user token to the server
    $.ajax({
        type: "GET",
        url: BASE_URL + "/key" + "?google-token=" + id_token,
        processData: false,
        contentType: false,
        success: function (data) {
            api_token = data.secret;
            storeUserIdentities(id_token, data.secret);
            user_email = profile.getEmail();

            $('#helloText').text("Hola " + profile.getName())
            $('#userEmail').val(user_email)
            $('#user_form').attr('action', BASE_URL_GIFTYCK + '/register-user?token=' + id_token)
            $('#signOut').show()
            $('#helloText').show()
            $('#googleButton').hide()

            checkUserData()

        },
        error: function (data) {
            console.log("Error calling API")
            console.log(data);
        }
    }).done(function () {

        // Once the token is in the server retrive an
        // api token
    }).fail(function () {

        // If we fail to upload the user the best we can do is to
        // logout it and show an error.
        $.notify({
            // options
            message: 'Error login the user'
        }, {
            // settings
            type: 'danger',
        })
        signOut()
    })
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        $('#signOut').hide()
        $('#googleButton').show()
        $('#helloText').hide()
        $('#dataModal').modal('hide')
    });
    if (typeof(Storage) !== "undefined") {
        //Session storage is available
        sessionStorage.gToken = "";
        sessionStorage.secret = "";
    }
}


function loadObjects() {
    $.ajax({
        dataType: "json",
        url: catalog,
        mimeType: "application/json",
        success: function (response) {
            products = shuffle(response);
            showProducts(show);
        },
        error: function (request, status, error) {
            $.notify({
                message: 'Error al cargar los productos. Compruebe su conexión a internet.'
            }, {
                type: 'danger'
            });
        }
    });
}

function showProducts(n) {
    var table = document.getElementById("products_panel");
    var show = 0;
    $.each(products, function (i) {
        table.insertAdjacentHTML('beforeend', `
              <div class="row mt-5" id="${this.id}">
              <div class="col-md-3"></div>
              <div class="col-md-2 text-center">
                <img src='${this.img_path}' height="150" width="150" alt='${this.name}'>
            </div>
              <div class=" col-md-4 show-grid text-center" rowspan="3">
                <div class="row"><h4>${this.name}</h4></div>
                <div class="row">${this.description}</div>
                <div class="row show-grid">
                    <div class="col-4" ><button onclick="valorar(${this.id},1)" class="btn btn-success">Like</button></div>
                    <div class="col-4" ><button onclick="valorar(${this.id})" class="btn btn-default">Dont Know</button> </div>
                    <div class="col-4"><button onclick="valorar(${this.id},0)" class="btn btn-danger">Dislike</button> </div>
                </div>
            </div>
              <div class="col-md-3"></div>
                        
        </div>`);
        show++;
        products.splice(i, 1)
        if (show == n)
            return false;
    });
}


function valorar(product, rating = -1) {
    if (rating != -1) {
        var vote = new Object();
        vote.rating = rating;
        vote.id = product;
        console.log(window.location.pathname.split("/").pop());
        if (window.location.pathname.split("/").pop()=='encuesta') {
            vote.userId = tmp_user_id;
            sendUnsafeVote(vote).then(function (result) {
                    // elimina el elemento y muestra uno nuevo al final de la lista
                    document.getElementById(product).remove();
                    showProducts(1);
                }
            ).catch(function (error) {
                $.notify({
                    // options
                    message: 'Se ha producido un error al procesar su voto.'
                }, {
                    // settings
                    type: 'danger',
                    delay: notificationDelay,
                });
                console.error('Caught!', error);
            });


        }
        else {
            sendVote(vote)
                .then(function (result) {
                        console.log(vote.id + " valorado correctamente.")
                        // elimina el elemento y muestra uno nuevo al final de la lista
                        document.getElementById(product).remove();
                        showProducts(1);
                    }
                ).catch(function (error) {
                if (error === 1) {
                    gapi.auth2.getAuthInstance().signIn();
                } else {
                    $.notify({
                        // options
                        message: 'Se ha producido un error al procesar su voto.'
                    }, {
                        // settings
                        type: 'danger',
                        delay: notificationDelay,
                    });
                    console.error('Caught!', error);
                }
            });
        }
    }
    else {
        // elimina el elemento y muestra uno nuevo al final de la lista
        document.getElementById(product).remove();
        showProducts(1);
    }
}

// Manage user

function storeUserIdentities(gToken, secret) {
    if (typeof(Storage) !== "undefined") {
        //Session storage is available
        sessionStorage.gToken = gToken;
        sessionStorage.secret = secret;
    } else {
        console.log("No localstorage available");
    }
}

function retriveUserGToken() {
    if (typeof(Storage) !== "undefined") {
        return sessionStorage.gToken;
    }
    else {
        return undefined;
    }
}

function retriveUserSecret() {
    if (typeof(Storage) !== "undefined") {
        return sessionStorage.secret;
    }
    else {
        return undefined;
    }
}

$(document).ready(function () {
    loadObjects();
    $("#user_form").submit(function (e) {
        e.preventDefault();

        var form = $(this);
        var url = form.attr('action');

        var data = {
            email: $('#userEmail')[0].value,
            gender: $('#gender')[0].value,
            comuna: $('#comuna')[0].value,
            age: $('#edad')[0].value
        }

        $.ajax({
            type: "POST",
            url: url,
            //data: form.serialize(), // serializes the form's elements.
            data: data,
            success: function (data) {
                console.log(data)
                $('#dataModal').modal('toggle')
            },
            error: function (data) {
                console.log(data)
                console.log("Error")
            }
        });

        // avoid to execute the actual submit of the form.
    });

    // modal nueva encuenta
    $('#user_tmp_form').submit(function (e) {
        e.preventDefault();

        //generamos un id usuario aleatorio
        tmp_user_id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        var url =BASE_URL_GIFTYCK + '/register-user-unsafe?token=' + tmp_user_id;
        var data = {
            email: $('#email')[0].value,
            gender: $('#gender')[0].value,
            comuna: $('#comuna')[0].value,
            age: $('#edad')[0].value
        };


        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: function (data) {
                $('#dataModal').modal('toggle');
                // recargamos la lista de productos
                loadObjects();
            },
            error: function (data) {
                console.log("Error " + data)
            }
        });
    });

    $('#signOut').hide();
    $('#helloText').hide()


    $.ajax({
        type: "GET",
        url: "./static/data/comunas.json",
        mimeType: "application/json",
        success: function (data) {
            data = data.comunas
            for (var i = 0; i < data.length; i++) {
                $('#comuna').append($('<option>', {value: data[i], text: data[i]}));
            }
        },
        error: function (data) {
            console.log(data)
            console.log("Error")
        }
    });

});
