const Message = require('../models/message'),
    contactsController = require('./contacts.controller'),
    Twilio = require('../models/twilio');

module.exports = {
    showMessages: showMessages,
    showSingle: showSingle,
    seedMessages: seedMessages,
    showCreate: showCreate,
    processCreate: processCreate,
    deleteMessage: deleteMessage,

    // Custom
    processCreateSigfox: processCreateSigfox
};

/**
 * Show all messages
 */
function showMessages(req, res) {
    // get all messages
    Message.find({}, function (err, messages) {
        if (err) {
            res.status(404);
            res.send('Messages not found!');
        }

        // return a view with data
        res.render('pages/messages/show', {
            messages: messages,
            success: req.flash('success')
        });
    });
}

/**
 * Show a single message
 */
function showSingle(req, res) {
    // get a single message
    Message.findOne({slug: req.params.slug}, function (err, message) {
        if (err || message == null) {
            res.status(404);
            res.send('Message not found!');
        }

        res.render('pages/messages/single', {
            message: message,
            success: req.flash('success'),
            error: req.flash('error')
        });
    });
}

/**
 * Seed the database
 */
function seedMessages(req, res) {
    // create some messages
    const messages = [
        {device: 'AD931E', time: '1496218985020', contactId: '0', content: 'Are you ok?'},
        {device: 'AD931E', time: '1496156315783', contactId: '1', content: 'Help me!'}
    ];

    // use the Message model to insert/save
    Message.remove({}, function () {
        for (message of messages) {
            var newMessage = new Message(message);
            newMessage.save();
        }
        if (res.statusCode == 200)
            console.log('Database seeded!');
        else
            console.log('Error occurred!');
        res.redirect('/messages');
    });



}

/**
 * Show the create form
 */
function showCreate(req, res) {
    res.render('pages/messages/create', {
        errors: req.flash('errors')
    });
}

/**
 * Process the creation form
 */
function processCreate(req, res) {
    // validate information
    req.checkBody('device', 'Device is required.').notEmpty();
    req.checkBody('time', 'Time is required.').notEmpty();
    req.checkBody('data', 'Data is required.').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if (errors) {
        req.flash('errors', errors.map(function (err) {
            return err.msg
        }));
        return res.redirect('/messages/create');
    }

    console.log('Adding in DB: ' + JSON.stringify(req.body));
    // create a new message
    const message = new Message({
        device: req.body.device,
        time: req.body.time * 1000, // Sigfox Backend returns Epoch Time in seconds, we have to * 1000 to convert to millis
        contactId: parseInt(req.body.data.slice(0, 2), 16), // only keep the fist two bytes
        content: decodeURIComponent(escape(hexToASCII(req.body.data.slice(2)))) // decode the HEX message (11 bytes)
    });

    // save message
    message.save(function (err) {
        if (err)
            throw err;

        // set a successful flash message
        req.flash('success', 'Successfully saved message in DB!');

        contactsController.getContactByMessageId(message.contactId, function (err, contact) {
            if (contact)
                Twilio.sendTwilio(message, contact.phone, function(err, result) {
                    if (result === undefined)
                        req.flash('error', 'But could not send message with Twilio, please verify the phone number is correct and verified on <a href="https://www.twilio.com/" target="_blank">Twilio</a>.');
                    else
                        req.flash('success', 'Successfully sent message with Twilio!'); //console.log("Twilio response: " + result.sid);
                    // redirect to the newly created message
                    res.redirect('/messages/' + message.slug);
                });
            else {
                console.error('Could not send message because contact was not found with ContactId: ' + message.contactId);
                // set an error flash message
                req.flash('error', 'Could not send message because contact was not found with ContactId: ' + message.contactId);
                // redirect to the newly created message
                res.redirect('/messages/' + message.slug);
            }
        });
    });
}

/**
 * Process the creation from Sigfox Backend
 */
function processCreateSigfox(req, res) {
    // validate information
    req.checkBody('device', 'Device is required.').notEmpty();
    req.checkBody('time', 'Time is required.').notEmpty();
    req.checkBody('data', 'Data is required.').notEmpty();

    // if there are errors, redirect and save errors to flash
    const errors = req.validationErrors();
    if (errors) {
        return res.send('Data format not respected');
    }

    console.log('Adding in DB: ' + JSON.stringify(req.body));
    // create a new message
    const message = new Message({
        device: req.body.device,
        time: req.body.time * 1000, // Sigfox Backend returns Epoch Time in seconds, we have to * 1000 to convert to millis
        contactId: parseInt(req.body.data.slice(0, 2), 16), // only keep the fist two bytes
        content: decodeURIComponent(escape(hexToASCII(req.body.data.slice(2)))) // decode the HEX message (11 bytes)
    });

    // save message
    message.save(function (err) {
        if (err)
            throw err;

        contactsController.getContactByMessageId(message.contactId, function (err, contact) {
            if (contact)
                Twilio.sendTwilio(message, contact.phone, function(err, result) {
                    if (result === undefined){
                        console.log('But could not send message with Twilio, please verify the phone number is correct and verified on <a href="https://www.twilio.com/" target="_blank">Twilio</a>.');
                        res.sendStatus(401);
                    } else {
                        console.log('Successfully sent message with Twilio!');
                        res.sendStatus(201);
                    }
                });
            else {
                console.error('Could not send message because contact was not found with ContactId: ' + message.contactId);
                // redirect to the newly created message
                res.sendStatus(404);
            }
        });
    });
}

/**
 * Delete a message
 */
function deleteMessage(req, res) {
    Message.remove({slug: req.params.slug}, function (err) {
        // set flash data
        // redirect back to the messages page
        req.flash('success', 'Message deleted!');
        res.redirect('/messages');
    });
}

// Utils
function hexToASCII(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}