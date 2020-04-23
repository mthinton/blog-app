var input = document.getElementsByClassName("comment")[0];
var iD = document.getElementsByClassName("identifier")[0];

document.getElementsByClassName("commentButton")[0].onclick = function(){
    var request = new XMLHttpRequest()

request.open('PUT', `http://localhost:8080/commentToPost/${iD}`, true)
};