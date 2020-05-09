var input = document.getElementsByClassName("comment")[0];
var iD = document.getElementsByClassName("identifier")[0].innerHTML;
console.log(iD);
 document.getElementsByClassName("commentButton")[0].onclick = function(){
    let commentInput = document.getElementById("commentInput");
    let inputData = commentInput.value;
    
     var xhr = new XMLHttpRequest()

    xhr.open('PUT', `/addComment/${iD}`, true)

    const params = {id:iD, comments: [{"content": inputData}]}

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify(params));
};