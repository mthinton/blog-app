const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const pug = require('pug');
const cors = require('cors');
var http = require('http');
var fs = require("fs");
var path = require('path');

// Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// config.js is where we control constants for entire
// app like PORT and DATABASE_URL
const {PORT, DATABASE_URL} = require('./config');
const {Blogpost} = require('./models');
const {Author} = require('./models');

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));
app.use(cors())
app.set('view engine', 'pug')

app.put('/authors/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Author
  .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
  .then(author => {
    if(author) {
      const message = `Username already taken`;
      console.error(message);
      return res.status(400).send(message);
    }
    else {
      Author
        .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
        .then(updatedAuthor => {
          res.status(200).json({
            id: updatedAuthor.id,
            name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
            userName: updatedAuthor.userName
          });
        })
        .catch(err => res.status(500).json({ message: err }));
    }
  });
})

app.post('/authors', (req, res) => {
  const expectedFields = ["firstName", "lastName", "userName"];
  expectedFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  })
  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json({
              _id: author.id,
              name: `${author.firstName} ${author.lastName}`,
              userName: author.userName
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
})

app.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.delete('/authors/:id', (req, res) => {
  Blogpost
    .remove({ author: req.params.id })
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(() => {
          console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
          res.status(204).json({ message: 'success' });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



// GET requests to /posts 
app.get('/posts', (req, res) => {
  Blogpost
    .find()
    .then(posts => {
      res.json(posts.map(post => {
        return {
          id: post._id,
          author: post.authorName,
          content: post.content,
          title: post.title
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong this time' });
    });
});

// can also request by ID
app.get('/posts/:id', (req, res) => {
  Blogpost
    // this is a convenience method Mongoose provides for searching
    // by the object _id property
    .findById(req.params.id)
    .exec()
    .then(post =>res.json(post.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.get('/test/:id', function (req, res) {
  let arrayOfComments = [];
  Blogpost
  // this is a convenience method Mongoose provides for searching
  // by the object _id property
  .findById(req.params.id)
  .exec()
  .then(post => res.render('index', { title: post.title, author: "Written By: " + post.author.firstName + " " + post.author.lastName, content: post.content, comments: post.comments}))
  //.then(post => res.render('index', { title: post, message: 'Hello there!' }))
  //.then(post =>res.json(post.serialize()))
  
  .catch(err => {
    console.error(err);
      res.status(500).json({message: 'Internal server error'})
  });
})

app.post('/posts', (req, res) => {

  const requiredFields = ['author_id', 'content', 'title'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Author
  .findById(req.body.author_id)
  .then(author => {
    if(author) {
      Blogpost
        .create({
          title: req.body.title,
          content: req.body.content,
          author: req.body.author_id
        })
        .then(blogPost => res.status(201).json({
          id: blogPost.id,
          author: `${author.firstName} ${author.lastName}`,
          content: blogPost.content,
          title: blogPost.title,
          comments: blogPost.comments
        }))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
    }
    else{
      const message = `Author not found!`;
      console.err(message);
      return res.status(400).send(message);
    }
  })
   .catch(err => {
    console.error(err);
    res.status(500).json({error: 'something went horribly awry'})
  })


//   Blogpost
//     .create({
//       title: req.body.title,
//       content: req.body.content,
//       author: author._id})
//     .then(post => res.status(201).json(post.serialize()))
//     .catch(err => {
//       console.error(err);
//       res.status(500).json({message: 'Internal server error'});
//     });
 });


app.put('/posts/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['author', 'content', 'title', 'comments'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Blogpost
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete('/posts/:id', (req, res) => {
  Blogpost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
