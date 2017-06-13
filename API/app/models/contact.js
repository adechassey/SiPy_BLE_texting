const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// create a schema
const contactSchema = new Schema({
    contactId: Number,
    firstname: String,
    lastname: String,
    phone: String,
    slug: {
        type: String,
        unique: true
    }
});

// middleware -----
// make sure that the slug is created from the name
contactSchema.pre('save', function (next) {
    this.slug = slugify(this.contactId);
    next();
});

// create the model
const contactModel = mongoose.model('Contact', contactSchema);

// export the model
module.exports = contactModel;

// function to slugify a name
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}