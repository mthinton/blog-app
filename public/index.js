let body = document.getElementsByTagName('body')[0];
const app = document.getElementById('root');
var postId;

const logo = document.createElement('img')
logo.src = 'Mountains.jpg'

const container = document.createElement('div')
container.setAttribute('class', 'container')

app.appendChild(logo)
app.appendChild(container)

if(body.id === "allPosts"){

var request = new XMLHttpRequest()

request.open('GET', 'http://localhost:8080/posts', true)

request.onload = function(){
    var data = JSON.parse(this.response)

    if(request.status >= 200 && request.status < 400) {

    data.forEach(post => {
        postId = post.id
        const card = document.createElement('div')
        card.setAttribute('class', 'card')

        const h1 = document.createElement('h1')
        h1.textContent = post.title

        const p = document.createElement('p')
        post.description = post.content.substring(0, 300)
        p.textContent = `${post.description}...`

        const button = document.createElement('button')
        button.type="button"
        button.textContent = "Click here to comment!"
        button.setAttribute('onclick', `location.href="http://localhost:8080/posts/${postId}"` )



        container.appendChild(card)

        card.appendChild(h1)
        card.appendChild(p)
        card.append(button)


    })
} else {
    const errorMessage = document.createElement('marquee')
    errorMessage.textContent = `Gah, it's not working!`
    app.appendChild(errorMessage)
}
}
request.send()
}
// if(body.id === "onePost"){

// var request = new XMLHttpRequest()

// request.open('GET', `http://localhost:8080/posts/${postId}`, true)

// request.onload = function(){
//     var data = JSON.parse(this.response);
//     console.log(data);

// //     if(request.status >= 200 && request.status < 400) {

// //     data.forEach(post => {
// //         postId = post.id
// //         const card = document.createElement('div')
// //         card.setAttribute('class', 'card')

// //         const h1 = document.createElement('h1')
// //         h1.textContent = post.title

// //         const p = document.createElement('p')
// //         post.description = post.content.substring(0, 300)
// //         p.textContent = `${post.description}...`

// //         const h2 = document.createElement('h2')
// //         post.textContent = post.comments


// //         const button = document.createElement('button')
// //         button.type="button"
// //         button.textContent = "Click here to comment!"
// //         button.setAttribute('onclick', `location.href="http://localhost:8080/posts/${post.id}"` )


// //         container.appendChild(card)

// //         card.appendChild(h1)
// //         card.appendChild(p)
// //         card.append(button)


// //    })
// // } else {
// //     const errorMessage = document.createElement('marquee')
// //     errorMessage.textContent = `Gah, it's not working!`
// //     app.appendChild(errorMessage)
// // }
//  }
//  request.send()
// }