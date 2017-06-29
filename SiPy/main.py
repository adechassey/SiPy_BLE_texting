from network import Bluetooth
from network import Sigfox
import socket

# init Sigfox for RCZ1 (Europe)
sigfox = Sigfox(mode=Sigfox.SIGFOX, rcz=Sigfox.RCZ1)
# create a Sigfox socket
s = socket.socket(socket.AF_SIGFOX, socket.SOCK_RAW)

bluetooth = Bluetooth()
bluetooth.set_advertisement(name='SiPy', service_uuid=b'1234567890123456')
sigfoxBroadcastStatus = 2

def conn_cb (bt_o):
    events = bt_o.events()
    if  events & Bluetooth.CLIENT_CONNECTED:
        print("Client connected")
    elif events & Bluetooth.CLIENT_DISCONNECTED:
        print("Client disconnected")

bluetooth.callback(trigger=Bluetooth.CLIENT_CONNECTED | Bluetooth.CLIENT_DISCONNECTED, handler=conn_cb)

bluetooth.advertise(True)

srv1 = bluetooth.service(uuid=b'1234567890123456', isprimary=True)
chr1 = srv1.characteristic(uuid=b'ab34567890123456', value="SiPy service")

def char1_cb_handler(chr):
    global sigfoxBroadcastStatus
    events = chr.events()
    if  events & Bluetooth.CHAR_WRITE_EVENT:
        print("Write request with value = {}".format(chr.value()))
        # Send the message to Sigfox Backend
        return sendSigfoxMessage(chr.value())
    elif Bluetooth.CHAR_READ_EVENT:
        print("Read request with value = {}".format(sigfoxBroadcastStatus))
        return sigfoxBroadcastStatus

char1_cb = chr1.callback(trigger=Bluetooth.CHAR_WRITE_EVENT | Bluetooth.CHAR_READ_EVENT, handler=char1_cb_handler)

# srv2 = bluetooth.service(uuid=1234, isprimary=True)
#
# chr2 = srv2.characteristic(uuid=4567, value=0x1234)
# char2_read_counter = 0xF0
# def char2_cb_handler(chr):
#     global char2_read_counter
#     char2_read_counter += 1
#     if char2_read_counter > 0xF1:
#         return char2_read_counter
#
# char2_cb = chr2.callback(trigger=Bluetooth.CHAR_READ_EVENT, handler=char2_cb_handler)

def sendSigfoxMessage(payload):
    global sigfoxBroadcastStatus
    sigfoxBroadcastStatus = 0
    # make the socket blocking
    s.setblocking(True)
    # configure it as uplink only
    s.setsockopt(socket.SOL_SIGFOX, socket.SO_RX, False)
    # send some bytes
    s.send(payload)
    print("Message {} sent successfully!".format(payload))
    sigfoxBroadcastStatus = 1
