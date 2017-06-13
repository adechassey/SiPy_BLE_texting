const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// create a schema
const messageSchema = new Schema({
    device: String,
    time: Date,
    contactId: Number,
    content: String,
    slug: {
        type: String,
        unique: true
    }
});

// middleware -----
// make sure that the slug is created from the name
messageSchema.pre('save', function (next) {
    this.slug = slugify(this._id);
    next();
});

// create the model
const messageModel = mongoose.model('Message', messageSchema);

// export the model
module.exports = messageModel;

// function to slugify a name
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}