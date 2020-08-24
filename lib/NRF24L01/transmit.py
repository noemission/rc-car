import RPi.GPIO as GPIO
from lib_nrf24 import NRF24
import time
import spidev
import sys
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

radio.openWritingPipe(pipes[1])
radio.openReadingPipe(1, pipes[0])
#radio.printDetails()
millis = lambda: int(round(time.time() * 1000))

while(1):
    radio.stopListening()
    data = input().split(',')
    id = data[0]
    message = list(data[1])
    radio.write(message)

    if radio.isAckPayloadAvailable():
        print (id + ",1")
    else:
        print (id + ",0")

    