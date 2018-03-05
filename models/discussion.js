var mongoose = require('mongoose');


var DiscussionSchema = new mongoose.Schema({

group: {
type: String,
unique: true,
required: false,
trim: true
},
question: {
type: String,
unique: true,
required: false,
trim: true
},
content: {
type: String,
unique: true,
required: false,
trim: true
},
});

var Discussion = mongoose.model('Discussion', DiscussionSchema);
module.exports = Discussion;

