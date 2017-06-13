const Contact = require('../models/contact');

module.exports = {
    showContacts: showContacts,
    showSingle: showSingle,
    seedContacts: seedContacts,
    showCreate: showCreate,
    processCreate: processCreate,
    showEdit: showEdit,
    processEdit: processEdit,
    deleteContact: deleteContact,

    // Custom
    getContactByMessageId: getContactByMessageId,
    showContactsAndroid: showContactsAndroid
};

/**
 * Show all contacts
 */
function showContacts(req, res) {
    // get all contacts
    Contact.find({}, function (err, contacts) {
        if (err) {
            res.status(404);
            res.send('Contacts not found!');
        }

        // return a view with data
        res.render('pages/contacts/show', {
            contacts: contacts,
            success: req.flash('success')
        });
    });
}

function showContactsAndroid(req, res) {
    // get all contacts
    Contact.find({}, function (err, contacts) {
        if (err) {
            res.status(404);
            res.send('Contacts not found!');
        }

        // return JSON data
        res.send(JSON.stringify(contacts));
    });
}

/**
 * Show a single contact
 */
function showSingle(req, res) {
    // get a single contact
    Contact.findOne({slug: req.params.slug}, function (err, contact) {
        if (err || contact == null) {
            res.status(404);
            res.send('Contact not found!');
        }

        res.render('pages/contacts/single', {
            contact: contact,
            success: req.flash('success')
        });
    });
}

/**
 * Seed the database
 */
function seedContacts(req, res) {
    // create some contacts
    const contacts = [
        {contactId: '0', firstname: 'Antoine', lastname: 'de Chassey', phone: '+???'},
        {contactId: '1', firstname: 'Bill', lastname: 'Gates', phone: '+???'},
        {contactId: '2', firstname: 'Steve', lastname: 'Jobs', phone: '+???'}
    ];

    // use the Contact model to insert/save
    Contact.remove({}, function () {
        for (contact of contacts) {
            var newContact = new Contact(contact);
            newContact.save();
        }
        if (res.statusCode == 200)
            console.log('Database seeded!');
        else
            console.log('Error occurred!');

        res.redirect('/contacts');
    });


}

/**
 * Show the create form
 */
function showCreate(req, res) {
    res.render('pages/contacts/create', {
        errors: req.flash('errors')
    });
}

/**
 * Process the creation form
 */
function processCreate(req, res) {
    // validate information
    req.checkBody('contactId', 'Contact id is required.').notEmpty();
    req.checkBody('firstname', 'First Name is required.').notEmpty();
    req.checkBody('lastname', 'Last Name is required.').notEmpty();
    req.checkBody('phone', 'Phone is required.').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors.map(function (err) {
            return err.msg
        }));
        return res.redirect('/contacts/create');
    }

    // create a new contact
    const newContact = new Contact({
        contactId: req.body.contactId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: req.body.phone
    });

    Contact.findOne({contactId: newContact.contactId}, function (err, contact) {
        if (contact) {
            req.flash('errors', 'Sorry, a contact already exists with this contactId.');
            return res.redirect('/contacts/create');
        } else {
            // save contact
            newContact.save(function (err) {
                if (err)
                    throw err;

                // set a successful flash contact
                req.flash('success', 'Successfully created contact!\nMake sure the phone number is valid and activated with your Twilio account!');

                // redirect to the newly created contact
                return res.redirect('/contacts/' + newContact.slug);
            });
        }
    });
}

/**
 * Show the edit form
 */
function showEdit(req, res) {
    Contact.findOne({slug: req.params.slug}, function (err, contact) {
        res.render('pages/contacts/edit', {
            contact: contact,
            errors: req.flash('errors')
        });
    });
}

/**
 * Process the edit form
 */
function processEdit(req, res) {
    // validate information
    req.checkBody('contactId', 'Contact id is required.').notEmpty();
    req.checkBody('firstname', 'First Name is required.').notEmpty();
    req.checkBody('lastname', 'Last Name is required.').notEmpty();
    req.checkBody('phone', 'Phone is required.').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors.map(function (err) {
            return err.msg
        }));
        return res.redirect('/contacts/edit/' + req.params.slug);
    }

    // finding a current contact
    Contact.findOne({slug: req.params.slug}, function (err, contact) {
        // updating that contact
        contact.contactId = req.body.contactId;
        contact.firstname = req.body.firstname;
        contact.lastname = req.body.lastname;
        contact.phone = req.body.phone;

        contact.save(function (err) {
            if (err)
                throw err;

            // success flash contact
            // redirect back to the /contacts
            req.flash('success', 'Successfully updated contact.');
            res.redirect('/contacts');
        });
    });

}

/**
 * Delete a contact
 */
function deleteContact(req, res) {
    Contact.remove({slug: req.params.slug}, function (err) {
        // set flash data
        // redirect back to the contacts page
        req.flash('success', 'Contact deleted!');
        res.redirect('/contacts');
    });
}

/**
 * Search a contact with the message contactId
 */
function getContactByMessageId(contactId, callback) {
    Contact.findOne({contactId: contactId}, callback);
}