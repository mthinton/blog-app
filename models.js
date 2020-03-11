const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const authorSchema = mongoose.Schema({
  firstName: 'string',
  lastName: 'string',
  userName: {
    type: 'string',
    unique: true
  }
});

const commentSchema = mongoose.Schema({content: 'string'});

const blogpostSchema = mongoose.Schema({
  title: 'string',
  content: 'string',
  author: {type: mongoose.Schema.Types.ObjectId, ref: 'authors'},
  comments: [commentSchema]
});
// these are our schemas to represent a blog post and an author

// *virtuals* (http://mongoosejs.com/docs/guide.html#virtuals)
// allow us to define properties on our object that manipulate
// properties that are stored in the database. Here we use it
// to generate a human readable string based on the author object
// we're storing in Mongo.

blogpostSchema.pre('find', function(next) {
  this.populate('author');
  next();
});

blogpostSchema.pre('findOne', function(next) {
  this.populate('author');
  next();
});

blogpostSchema.virtual('authorName').get(function() {
 return `${this.author.firstName} ${this.author.lastName}`.trim();
});



// this is an *instance method* which will be available on all instances
// of the model. This method will be used to return an object that only
// exposes *some* of the fields we want from the underlying data
blogpostSchema.methods.serialize = function() {

  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    comments:this.comments
  };
};

// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.
const Blogpost = mongoose.model('posts', blogpostSchema);
const Author = mongoose.model('authors', authorSchema)


module.exports = {Blogpost, Author};