import RPi.GPIO as GPIO
from lib_nrf24 import NRF24
import time
import spidev
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)

pipes = [[0xb4, 0xb4, 0xb4, 0xb4, 0xb4], [0xd2, 0xd2, 0xd2, 0xd2, 0xd2]]

radio = NRF24(GPIO, spidev.SpiDev())
radio.begin(0, 17)
radio.setPayloadSize(32)
radio.setChannel(0x70)

radio.setDataRate(NRF24.BR_1MBPS)
radio.setPALevel(NRF24.PA_MAX)
radio.setAutoAck(True)
radio.enableDynamicPayloads()
radio.enableAckPayload()

radio.openReadingPipe(0, pipes[1])
radio.openWritingPipe(pipes[0])

#radio.printDetails()

radio.startListening()

while(1):
    while not radio.available(0):
        time.sleep(1 / 100)
    receivedMessage = []
    radio.read(receivedMessage, radio.getDynamicPayloadSize())

    string = ""
    for n in receivedMessage:
        # Decode into standard unicode set
        if (n >= 32 and n <= 126):
            string += chr(n)
    print(string)
    radio.writeAckPayload(0, [1], 1)
