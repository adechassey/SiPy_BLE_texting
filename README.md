# [Sigfox](http://www.sigfox.com/) texting with [SiPy](https://www.pycom.io/product/sipy/)

You wish you could send some short SMS with __no SIM card__ and from almost anywhere? Well you can with Sigfox and BLE!

This repository includes:
- the firmware to upload on the SiPy
- an Android application to communicate to the SiPy with Bluetooth _BLE_
- the API registering requests from the Sigfox Backend and forwarding them by SMS with Twilio

<p align="center">
    <img src="img/presentation.png?raw=true">
</p>

## Hardware Requirements

- a [SiPy](https://www.pycom.io/product/sipy/) board
- an Android phone with Bluetooth (BLE supported)

## Installation
Clone the repo: `git clone https://github.com/AntoinedeChassey/https://github.com/AntoinedeChassey/SiPy_BLE_texting.git`

### SiPy
1. [Activate](https://backend.sigfox.com/activate/pycom) your SiPy on the Sigfox Backend _(you can follow __[this](https://docs.pycom.io/pycom_esp32/pycom_esp32/tutorial/includes/sigfox-start.html)__ tutorial)_
2. Flash the SiPy with the firmware located in this folder: _SiPy_BLE_texting/__SiPy___ (you can use the Pymakr Plugin, I __strongly recommend__ to read __[this](https://docs.pycom.io/pycom_esp32/pycom_esp32/getstarted.html#)__ guide

### Twilio
1. Sign up for free __[here](https://www.twilio.com/try-twilio)__
2. Add new numbers in the "Verified Caller IDs" (phone numbers of the contacts you wish to send messages)

<p align="center">
    <img width="70%" height="70%" src="img/newNumber.png">
</p>

3. Take note of your generated Twilio __Phone Number__, __ACCOUNT SID__ and __Auth TOKEN__

<p align="center">
    <img width="50%" height="50%" src="img/twilio.png">
</p>

### EvenNode
1. Sign up for free __[here](https://www.evennode.com/new-account)__
2. Log in EvenNode and create a Node.js free plan
3. Make sure to set the MongoDB password
4. Now go into the cloned API directory: `cd SiPy_BLE_texting/API`
5. Copy the .env.example to your own file: `cp .env.example .env`
6. Set all the variables in `.env` with your own information

<p align="center">
    <img src="img/mongo.png">
</p>

<p align="center">
    <img src="img/env.png">
</p>

7. Follow the Git deployment guide: <https://www.evennode.com/docs/git-deployment>

### Sigfox Backend Callback
1. Log in __[here](https://backend.sigfox.com/auth/login)__
2. Go to <https://backend.sigfox.com/devicetype/list>, click left on your device row and select "Edit"
3. Now go to the "CALLBACKS" section on the left, select "new" on the top right, select "Custom Callback"
    * Url pattern: `http://<EvenNode_URL>/messages/createSigfox`
    * Use HTTP Method: `POST`
    * Body: `{
             "device" : "{device}",
             "time" : "{time}",
             "data" : "{data}"
             }`

<p align="center">
    <img src="img/backend.png">
</p>

4. Select "OK" to validate
    
### Android
1. Download the apk file from <https://github.com/AntoinedeChassey/SiPy_BLE_texting/blob/master/Android/BLE_to_SiPy.apk> (or find it in _SiPy_BLE_texting/Android/BLE_to_SiPy.apk_)
2. Click on it and select "install" (you might have to authorize unsigned apps to be installed on your device)
3. Connect to your SiPy after authorizing Bluetooth

<p align="center">
    <img width="50%" height="50%" src="img/device.png">
</p>

4. Press the `+` button to select a contact
5. At first boot, you need to update the local SQLite database with the contacts you created online (on the EvenNode Node.js app), you will be prompted to do so
6. Enter the name of your Node.js app (the part after `http://` and before `.evennode.com`)

<p align="center">
    <img width="50%" height="50%" src="img/contact.png">
</p>

7. Validate, you should now see the same contacts you created online!
8. Pick one, enter some text and send!

<p align="center">
    <img width="50%" height="50%" src="img/message.png">
</p>

9. Wait 5 seconds and go back to your Node.js app, in the "Messages" section
10. You should now see the message you just sent with BLE
11. If your contact recipient has a valid phone number activated on Twilio, he should have received the text message by SMS


__Have fun!__ _Sorry this project is a bit complicated due to all the different technologies used_.

Above all, it is to show what you could do with __SIGFOX__ and __BLE__, thanks to __SiPy__!

> *Antoine de Chassey*