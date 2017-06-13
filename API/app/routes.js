// create a new express router
const express = require('express'),
    router = express.Router(),
    mainController = require('./controllers/main.controller'),
    messagesController = require('./controllers/messages.controller'),
    contactsController = require('./controllers/contacts.controller');

// export router
module.exports = router;

// define routes
// main routes
//router.get('/', mainController.showHome);
router.get('/', messagesController.showMessages);

/************************
 MESSAGE
 ************************/
// messages routes
router.get('/messages', messagesController.showMessages);

// seed messages
router.get('/messages/seed', messagesController.seedMessages);

// create message
router.get('/messages/create', messagesController.showCreate);
router.post('/messages/create', messagesController.processCreate);
router.post('/messages/createSigfox', messagesController.processCreateSigfox);
// delete message
router.get('/messages/delete/:slug', messagesController.deleteMessage);

// show a single message
router.get('/messages/:slug', messagesController.showSingle);

/************************
 C0NTACT
 ************************/
// contact routes
router.get('/contacts', contactsController.showContacts);
router.get('/contactsAndroid', contactsController.showContactsAndroid);

// seed contacts
router.get('/contacts/seed', contactsController.seedContacts);

// create contact
router.get('/contacts/create', contactsController.showCreate);
router.post('/contacts/create', contactsController.processCreate);

// edit contacts
router.get('/contacts/edit/:slug', contactsController.showEdit);
router.post('/contacts/:slug', contactsController.processEdit);

// delete contact
router.get('/contacts/delete/:slug', contactsController.deleteContact);

// show a single contact
router.get('/contacts/:slug', contactsController.showSingle);
