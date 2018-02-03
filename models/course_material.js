var mongoose = require('mongoose');


var CMSchema = new mongoose.Schema({
title: {
type: String,
unique: true,
required: true,
trim: true
},
content: {
type: String,
unique: true,
required: true,
trim: true
},
});

var CM = mongoose.model('CM', CMSchema);
module.exports = CM;

