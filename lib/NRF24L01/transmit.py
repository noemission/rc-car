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
radio.setChannel(0x61)

radio.setDataRate(NRF24.BR_250KBPS)
radio.setPALevel(NRF24.PA_MAX)
radio.setAutoAck(True)
radio.enableDynamicPayloads()
radio.enableAckPayload()

radio.openWritingPipe(pipes[1])
#radio.printDetails()

while(1):
    data = input()
    message = list(data)
    radio.write(message)
    #print("We sent the message of {}".format(message))
    #time.sleep(1)
