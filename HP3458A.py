#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import time
import pyvisa

# send a command and read the response
def query(cmd):
	dev.write(cmd)
	return dev.read('\n')

# read internal memory between start and end address
def mread(start, end):
	dev.write("TRIG HOLD")
	dev.write("QFORMAT NUM")
	# Addresses must be even
	assert start & 1 == 0
	assert end & 1 == 0
	l = bytearray()
	for adr in range(start, end, 2):
		res = query("MREAD %d" % adr)
		value = int(res)
		if value < 0:
			value = 65536 + value
		value >>= 8 # data is only in the upper byte
		l.append(value)
	return l

# read complete NVRAM and write it to a file
def nvram_read(fname):
	nvram_base = 0x60000
	nvram_size = 0x800
	l = mread(nvram_base, nvram_base + nvram_size * 2)
	open(fname, "wb").write(l)

while True:
	rm = pyvisa.ResourceManager()
	dev = rm.open_resource('TCPIP::192.168.1.192::gpib0,22::INSTR')
	dev.write("QFORMAT ALPHA")
	if False:
		print(query("ID?"))
		print(query("REV?"))
		print(query("OPT?"))
		print(query("DSP?"))
		print(query("CAT"))
	print(query("TEMP?"))
	if False:
		for i in range(10):
			print(query("DEFKEY? %d" % i))
	if False:
		print(query("CALSTR?"))
		print(query("CALNUM?"))
		for i in [2941,2437]:
			print(query("CAL? %d" % i))
	if False:
		for i in range(1,254):
			for l in [0,1,3,5]:
				print(query("CAL? %d,%d" % (i,l)))

#	print(query("TARM SGL,1"))
#	nvram_read("hp3458.calram.bin")
	time.sleep(60)
