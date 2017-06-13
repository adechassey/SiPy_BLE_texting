require('dotenv').config();
const accountSid = process.env.accountSid,
    authToken = process.env.authToken,
    numberFrom = process.env.numberFrom,
    twilioClient = require('twilio')(accountSid, authToken);

// export the function to send message
module.exports = {
    sendTwilio: function (newMessage, numberTo, callback) {
        twilioClient.messages.create({
            body: newMessage.content,
            to: numberTo,    // Text this number
            from: numberFrom // From a valid Twilio number
        }, callback);
    }/*,
    activateNewNumber: function (contactId, newPhoneNumber, callback) {
        twilioClient.outgoingCallerIds.create({
            friendlyName: contactId.toString(),
            phoneNumber: newPhoneNumber
        }, callback);
    }*/
};