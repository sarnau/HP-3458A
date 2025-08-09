#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import binascii
import struct
import sys
import math

dd = '.' * 2048

def printDump():
	global dd
	BLOCKSIZE = 32
	adr = 0
	for l in [dd[i:i+BLOCKSIZE] for i in range(0, len(dd), BLOCKSIZE)]:
		print('%#06x : %s' % (adr,l))
		adr += BLOCKSIZE

def eng_format(x, precision=7):
    if x == 0:
        return f"{0:.{precision}f}E+00"
    
    exp = int(math.floor(math.log10(abs(x)) / 3) * 3)  # multiple of 3
    mantissa = x / (10 ** exp)
    return f"{mantissa:.{precision}f}E{exp:+03d}"

def getString(data,offset):
	s = ''
	while data[offset] != 0:
		s += chr(data[offset])
		offset += 1
	return s

def getByte(data,offset):
	global dd
	dd = dd[:offset] + 'B' + dd[offset+1:]
	return data[offset]

def getWord(data,offset,ch='W'):
	global dd
	dd = dd[:offset] + ch + ch.lower() + dd[offset+2:]
	return struct.unpack('>H', data[offset:offset+2])[0]

def getLong(data,offset):
	global dd
	dd = dd[:offset] + 'Llll' + dd[offset+4:]
	val = struct.unpack('>L', data[offset:offset+4])[0]
	#print("%#06x : %#10x / %d" % (offset,val,val))
	return val

def getDouble(data,offset):
	global dd
	dd = dd[:offset] + 'Dddddddd' + dd[offset+8:]
	return struct.unpack('>d', data[offset:offset+8])[0]

def verifyChecksum(data, startadr, endadr):
	chk = 0x0000
	for adr in range(startadr,endadr):
		chk += data[adr]

	for adr in range(startadr,endadr):
		b = 0x718 + (adr >> 3)
		bit = adr & 7
		chk += (getByte(data, b) & (1 << bit)) != 0
	return (chk & 0xFFFF)

data = open('hp3458.calram.bin','rb').read()
initial_data = open('hp3458a.calram.initial.bin','rb').read()
#print(binascii.hexlify(data).decode('ascii'))

# which start addresses have valid data?
if False:
	lastAdr = None
	for adr in range(0x626):
		b = 0x718 + (adr >> 3)
		bit = adr & 7
		flag = (data[b] & (1 << bit)) != 0
		if flag:
			if lastAdr != None:
				size = adr-lastAdr
				ch = '?'
				val = -99999
				if size == 1:
					ch = 'B'
					val = '%d' % getByte(data,lastAdr)
				elif size == 2:
					ch = 'W'
					val = '%d' % getWord(data,lastAdr)
				elif size == 4:
					ch = 'L'
					val = '%d' % getLong(data,lastAdr)
				elif size == 8:
					ch = 'D'
					val = eng_format(getDouble(data,lastAdr))
				elif size == 80:
					ch = 'S'
					val = getString(data,lastAdr)
				print('%#06x.%c %16s' % (lastAdr,ch,val))
			lastAdr = adr
	sys.exit(0)

dd = '.' * 2048

print('SECURE')
print('======')
print('=> CHECKSUM %#06x == %#06x' % (getWord(data,0x624,'X'),verifyChecksum(data,0x5ca,0x624)))

baseadr = 0x5ca
print('CALSTR? "%s"' % getString(data,baseadr))
dd = dd[:baseadr] + 'S' + ('s' * 79) + dd[baseadr+80:]
baseadr += 80 # => 0x61a
formatStr = '>llb'
sdata = struct.unpack(formatStr, data[baseadr:baseadr+struct.calcsize(formatStr)])
print('CALNUM? %d' % (getLong(data,0x615)))
print('CALNUM? %d' % (getLong(data,0x61a)))
print('SECURE %d,%d' % (getLong(data,0x61e),getByte(data,0x622)))

print()
print('OVERLOADS and DEFEATS')
print('=====================')
print('CAL? 2941 => %d, %s %s %d' % (getLong(data,0x626),'DESTRUCTIVE OVERLOADS','valid', 2941))
print('CAL? 2437 => %d, %s %s %d' % (getLong(data,0x62a),'DEFEATS','valid', 2437))

print()
print('SCAL')
print('====')
print('=> CHECKSUM %#06x == %#06x' % (getWord(data,0x5c8,'X'),verifyChecksum(data,0x5a0,0x5c8)))

print()
print('ACAL')
print('====')
print('=> CHECKSUM %#06x == %#06x' % (getWord(data,0x59c,'X'),verifyChecksum(data,0x1c0,0x59c) + verifyChecksum(data,0x040,0x060)))


print()
print('CAL')
print('===')

print('=> CHECKSUM %#06x == %#06x' % (getWord(data,0x1bc,'X'),verifyChecksum(data,0x60,0x1bc) + verifyChecksum(data,0x000,0x040)))

#sys.exit(0)
print()
print('Calibration data:')
print('%s, %s %s %d' % (eng_format(getDouble(data,0x000)),'40K reference','valid cal value',1))
print('%s, %s %s %d' % (eng_format(getDouble(data,0x008)),'7V reference','valid cal value',2))

def printCal_tmul(offa,offb,s,idx):
	print('%s, %s %s %d' % (eng_format(getDouble(data,offa) * getDouble(data,offb)),s,'valid cal value',idx))
def printCal_mul(offset,val,s,idx):
	print('%s, %s %s %d' % (eng_format(getDouble(data,offset) * val),s,'valid cal value',idx))
def printCal_rel(offset,s,idx):
	print('%s, %s %s %d' % (eng_format(getDouble(data,offset)/getDouble(initial_data,offset)),s,'valid cal value',idx))
def printCal_imul(offa,offb,s,idx):
	print('%s, %s %s %d' % (eng_format(getDouble(data,offa)*getDouble(initial_data,offb)),s,'valid cal value',idx))
def printCal_div(offset,val,s,idx):
	print('%s, %s %s %d' % (eng_format(val / getDouble(data,offset)),s,'valid cal value',idx))
def printCal_long(offset,s,idx):
	print('%d, %s %s %d' % (getLong(data,offset),s,'valid cal value',idx))
def printCal_byte(offset,s,idx):
	print('%d, %s %s %d' % (getByte(data,offset),s,'valid cal value',idx))
def printCal_word(offset,s,idx):
	print('%d, %s %s %d' % (getWord(data,offset),s,'valid cal value',idx))

printCal_tmul(0x010,0x200,'dcv zero front 100mV',3)
printCal_tmul(0x018,0x200,'dcv zero rear 100mV',4)
printCal_tmul(0x020,0x208,'dcv zero front 1V',5)
printCal_tmul(0x028,0x208,'dcv zero rear 1V',6)
printCal_tmul(0x030,0x210,'dcv zero front 10V',7)
printCal_tmul(0x038,0x210,'dcv zero rear 10V',8)
printCal_tmul(0x040,0x218,'dcv zero front 100V',9)
printCal_tmul(0x048,0x218,'dcv zero rear 100V',10)
printCal_tmul(0x050,0x220,'dcv zero front 1V',11)
printCal_tmul(0x058,0x220,'dcv zero rear 1V',12)

printCal_tmul(0x060,0x228,'ohm zero front 10',13)
printCal_tmul(0x068,0x230,'ohm zero front 100',14)
printCal_tmul(0x070,0x238,'ohm zero front 1K',15)
printCal_tmul(0x078,0x240,'ohm zero front 10K',16)
printCal_tmul(0x080,0x248,'ohm zero front 100K',17)
printCal_tmul(0x088,0x250,'ohm zero front 1M',18)
printCal_tmul(0x090,0x258,'ohm zero front 10M',19)
printCal_tmul(0x098,0x260,'ohm zero front 100M',20)
printCal_tmul(0x0A0,0x268,'ohm zero front 1G',21)

printCal_tmul(0x0a8,0x228,'ohm zero rear 10',22)
printCal_tmul(0x0b0,0x230,'ohm zero rear 100',23)
printCal_tmul(0x0b8,0x238,'ohm zero rear 1K',24)
printCal_tmul(0x0c0,0x240,'ohm zero rear 10K',25)
printCal_tmul(0x0c8,0x248,'ohm zero rear 100K',26)
printCal_tmul(0x0d0,0x250,'ohm zero rear 1M',27)
printCal_tmul(0x0d8,0x258,'ohm zero rear 10M',28)
printCal_tmul(0x0e0,0x260,'ohm zero rear 100M',29)
printCal_tmul(0x0e8,0x268,'ohm zero rear 1G',30)

printCal_tmul(0x0f0,0x228,'ohmf zero front 10',31)
printCal_tmul(0x0f8,0x230,'ohmf zero front 100',32)
printCal_tmul(0x100,0x238,'ohmf zero front 1K',33)
printCal_tmul(0x108,0x240,'ohmf zero front 10K',34)
printCal_tmul(0x110,0x248,'ohmf zero front 100K',35)
printCal_tmul(0x118,0x250,'ohmf zero front 1M',36)
printCal_tmul(0x120,0x258,'ohmf zero front 10M',37)
printCal_tmul(0x128,0x260,'ohmf zero front 100M',38)
printCal_tmul(0x130,0x268,'ohmf zero front 1G',39)

printCal_tmul(0x138,0x228,'ohmf zero rear 10',40)
printCal_tmul(0x140,0x230,'ohmf zero rear 100',41)
printCal_tmul(0x148,0x238,'ohmf zero rear 1K',42)
printCal_tmul(0x150,0x240,'ohmf zero rear 10K',43)
printCal_tmul(0x158,0x248,'ohmf zero rear 100K',44)
printCal_tmul(0x160,0x250,'ohmf zero rear 1M',45)
printCal_tmul(0x168,0x258,'ohmf zero rear 10M',46)
printCal_tmul(0x170,0x260,'ohmf zero rear 100M',47)
printCal_tmul(0x178,0x268,'ohmf zero rear 1G',48)

printCal_long(0x180, 'autorange offset ohm 10', 49)
printCal_long(0x184, 'autorange offset ohm 100', 50)
printCal_long(0x188, 'autorange offset ohm 1K', 51)
printCal_long(0x18c, 'autorange offset ohm 10K', 52)
printCal_long(0x190, 'autorange offset ohm 100K', 53)
printCal_long(0x194, 'autorange offset ohm 1M', 54)
printCal_long(0x198, 'autorange offset ohm 10M', 55)
printCal_long(0x19c, 'autorange offset ohm 100M', 56)
printCal_long(0x1a0, 'autorange offset ohm 1G', 57)

printCal_mul(0x1a4,1.0,'cal 0 temperature',58)
printCal_mul(0x1ac,1.0,'cal 10 temperature',59)
printCal_mul(0x1b4,1.0,'cal 10k temperature',60)

printCal_byte(0x1be, 'vos dac', 61)

printCal_tmul(0x1c0,0x2b8,'dci zero rear 100nA', 62)
printCal_tmul(0x1c8,0x2c0,'dci zero rear 1uA', 63)
printCal_tmul(0x1d0,0x2c8,'dci zero rear 10uA', 64)
printCal_tmul(0x1d8,0x2d0,'dci zero rear 100uA', 65)
printCal_tmul(0x1e0,0x2d8,'dci zero rear 1mA', 66)
printCal_tmul(0x1e8,0x2e0,'dci zero rear 10mA', 67)
printCal_tmul(0x1f0,0x2e8,'dci zero rear 100mA', 68)
printCal_tmul(0x1f8,0x2f0,'dci zero rear 1A', 69)

printCal_rel(0x200,'dcv gain 100mV', 70)
printCal_rel(0x208,'dcv gain 1V', 71)
printCal_rel(0x210,'dcv gain 10V', 72)
printCal_rel(0x218,'dcv gain 100V', 73)
printCal_rel(0x220,'dcv gain 1KV', 74)

printCal_rel(0x228,'ohm gain 10', 75)
printCal_rel(0x230,'ohm gain 100', 76)
printCal_rel(0x238,'ohm gain 1K', 77)
printCal_rel(0x240,'ohm gain 10K', 78)
printCal_rel(0x248,'ohm gain 100K', 79)
printCal_rel(0x250,'ohm gain 1M', 80)
printCal_rel(0x258,'ohm gain 10M', 81)
printCal_rel(0x260,'ohm gain 100M', 82)
printCal_rel(0x268,'ohm gain 1G', 83)

printCal_rel(0x270,'ohm ocomp gain 10', 84)
printCal_rel(0x278,'ohm ocomp gain 100', 85)
printCal_rel(0x280,'ohm ocomp gain 1K', 86)
printCal_rel(0x288,'ohm ocomp gain 10K', 87)
printCal_rel(0x290,'ohm ocomp gain 100K', 88)
printCal_rel(0x298,'ohm ocomp gain 1M', 89)
printCal_rel(0x2a0,'ohm ocomp gain 10M', 90)
printCal_rel(0x2a8,'ohm ocomp gain 100M', 91)
printCal_rel(0x2b0,'ohm ocomp gain 1G', 92)

printCal_rel(0x2b8,'dci gain 100nA', 93)
printCal_rel(0x2c0,'dci gain 1uA', 94)
printCal_rel(0x2c8,'dci gain 10uA', 95)
printCal_rel(0x2d0,'dci gain 100uA', 96)
printCal_rel(0x2d8,'dci gain 1mA', 97)
printCal_rel(0x2e0,'dci gain 10mA', 98)
printCal_rel(0x2e8,'dci gain 100mA', 99)
printCal_rel(0x2f0,'dci gain 1A', 100)

printCal_byte(0x2f8, 'precharge dac', 101)
printCal_byte(0x2f9, 'mc dac', 102)
printCal_mul(0x2fa,1.0,'high speed gain', 103)
printCal_mul(0x302,1.0,'il', 104)
printCal_mul(0x30a,1.0,'il2', 105)

printCal_mul(0x312,1.0,'rin', 106)
printCal_mul(0x31a,1.0,'low aperture', 107)
printCal_mul(0x322,1.0,'high aperture', 108)
printCal_mul(0x32a,1.0,'high aperture slope .01 PLC', 109)
printCal_mul(0x332,1.0,'high aperture slope .1 PLC', 110)
printCal_mul(0x33a,1.0,'high aperture null .01 PLC', 111)
printCal_mul(0x342,1.0,'high aperture null .1 PLC', 112)

printCal_long(0x34a, 'underload dcv 100mV', 113)
printCal_long(0x34e, 'underload dcv 1V', 114)
printCal_long(0x352, 'underload dcv 10V', 115)
printCal_long(0x356, 'underload dcv 100V', 116)
printCal_long(0x35a, 'underload dcv 1000V', 117)
printCal_long(0x35e, 'overload dcv 100mV', 118)
printCal_long(0x362, 'overload dcv 1V', 119)
printCal_long(0x366, 'overload dcv 10V', 120)
printCal_long(0x36a, 'overload dcv 100V', 121)
printCal_long(0x36e, 'overtoad dcv 1000V', 122)
printCal_long(0x372, 'underload ohm 10', 123)
printCal_long(0x376, 'underload ohm 100', 124)
printCal_long(0x37a, 'underload ohm 1k', 125)
printCal_long(0x37e, 'underload ohm 10k', 126)
printCal_long(0x382, 'underload ohm 100k', 127)
printCal_long(0x386, 'underload ohm 1M', 128)
printCal_long(0x38a, 'underload ohm 10M', 129)
printCal_long(0x38e, 'underload ohm 100M', 130)
printCal_long(0x392, 'underload ohm 1G', 131)
printCal_long(0x396, 'overload ohm 10', 132)
printCal_long(0x39a, 'overload ohm 100', 133)
printCal_long(0x39e, 'overload ohm 1k', 134)
printCal_long(0x3a2, 'overload ohm 10k', 135)
printCal_long(0x3a6, 'overload ohm 100k', 136)
printCal_long(0x3aa, 'overload ohm 1M', 137)
printCal_long(0x3ae, 'overload ohm 10M', 138)
printCal_long(0x3b2, 'overload ohm 100M', 139)
printCal_long(0x3b6, 'overload ohm 1G', 140)
printCal_long(0x3ba, 'underload ohm ocomp 10', 141)
printCal_long(0x3be, 'underload ohm ocomp 100', 142)
printCal_long(0x3c2, 'underload ohm ocomp 1k', 143)
printCal_long(0x3c6, 'underload ohm ocomp 10k', 144)
printCal_long(0x3ca, 'underload ohm ocomp 100k', 145)
printCal_long(0x3ce, 'underload ohm ocomp 1M', 146)
printCal_long(0x3d2, 'underload ohm ocomp 10M', 147)
printCal_long(0x3d6, 'underload ohm ocomp 100M', 148)
printCal_long(0x3da, 'underload ohm ocomp 1G', 149)
printCal_long(0x3de, 'overload ohm ocomp 10', 150)
printCal_long(0x3e2, 'overload ohm ocomp 100', 151)
printCal_long(0x3e6, 'overload ohm ocomp 1k', 152)
printCal_long(0x3ea, 'overload ohm ocomp 10k', 153)
printCal_long(0x3ee, 'overload ohm ocomp 100k', 154)
printCal_long(0x3f2, 'overload ohm ocomp 1M', 155)
printCal_long(0x3f6, 'overload ohm ocomp 10M', 156)
printCal_long(0x3fa, 'overload ohm ocomp 100M', 157)
printCal_long(0x3fe, 'overload ohm ocomp 1G', 158)
printCal_long(0x402, 'underload dci 100nA', 159)
printCal_long(0x402, 'underload dci 1uA', 160)
printCal_long(0x402, 'underload dci 10uA', 161)
printCal_long(0x402, 'underload dci 100uA', 162)
printCal_long(0x402, 'underload dci 1mA', 163)
printCal_long(0x402, 'underload dci 10mA', 164)
printCal_long(0x402, 'underload dci 100mA', 165)
printCal_long(0x402, 'underload dci 1A', 166)
printCal_long(0x422, 'overload dci 100nA', 167) # simply multiplies [0x402] * 12
printCal_long(0x422, 'overload dci 1uA', 168)
printCal_long(0x422, 'overload dci 10uA', 169)
printCal_long(0x422, 'overload dci 100uA', 170)
printCal_long(0x422, 'overload dci 1mA', 171)
printCal_long(0x422, 'overload dci 10mA', 172)
printCal_long(0x422, 'overload dci 100mA', 173)
printCal_long(0x422, 'overload dci 1A', 174)
printCal_mul(0x442,1.0,'acal dcv temperature', 175)
printCal_mul(0x44a,1.0,'acal ohm temperature', 176)
printCal_mul(0x452,1.0,'acal acv temperature', 177)
printCal_byte(0x45a, 'acdc offset dac 10mV', 178)
printCal_byte(0x45b, 'acdc offset dac 100mV', 179)
printCal_byte(0x45c, 'acdc offset dac 1V', 180)
printCal_byte(0x45d, 'acdc offset dac 10V', 181)
printCal_byte(0x45e, 'acdc offset dac 100V', 182)
printCal_byte(0x45f, 'acdc offset dac 1KV', 183)
printCal_byte(0x460, 'ac offset dac 10mV', 184)
printCal_byte(0x461, 'ac offset dac 100mV', 185)
printCal_byte(0x462, 'ac offset dac 1V', 186)
printCal_byte(0x463, 'ac offset dac 10V', 187)
printCal_byte(0x464, 'ac offset dac 100V', 188)
printCal_byte(0x465, 'ac offset dac 1KV', 189)
printCal_byte(0x466, 'acdci offset dac 100uA', 190)
printCal_byte(0x467, 'acdci offset dac 1mA', 191)
printCal_byte(0x468, 'acdci offset dac 10mA', 192)
printCal_byte(0x469, 'acdci offset dac 100mA', 193)
printCal_byte(0x46a, 'acdci offset dac 1A', 194)
printCal_word(0x46c, 'flatness dac 10mV', 195)
printCal_word(0x46e, 'flatness dac 100mV', 196)
printCal_word(0x470, 'flatness dac 1V', 197)
printCal_word(0x472, 'flatness dac 10V', 198)
printCal_word(0x474, 'flatness dac 100V', 199)
printCal_word(0x476, 'flatness dac 1KV', 200)
printCal_byte(0x478, 'level dac dc 1.2V', 201)
printCal_byte(0x47a, 'level dac dc 12V', 202)
printCal_byte(0x47c, 'level dac ac 1.2V', 203)
printCal_byte(0x47d, 'level dac ac 12V', 204)
printCal_byte(0x47e, 'dcv trigger offset 100mV', 205)
printCal_byte(0x47f, 'dcv trigger offset 1V', 206)
printCal_byte(0x480, 'dcv trigger offset 10V', 207)
printCal_byte(0x481, 'dcv trigger offset 100V', 208)
printCal_byte(0x482, 'dcv trigger offset 1KV', 209)
printCal_tmul(0x484,0x4e4,'acdcv sync offset 10mV',210)
printCal_tmul(0x48c,0x4ec,'acdcv sync offset 100mV',211)
printCal_tmul(0x494,0x4f4,'acdcv sync offset 1V',212)
printCal_tmul(0x49c,0x4fc,'acdcv sync offset 10V',213)
printCal_tmul(0x4a4,0x504,'acdcv sync offset 100V',214)
printCal_tmul(0x4ac,0x50c,'acdcv sync offset 1KV',215)
printCal_tmul(0x4b4,0x4e4,'acv sync offset 10mV',216)
printCal_tmul(0x4bc,0x4ec,'acv sync offset 100mV',217)
printCal_tmul(0x4c4,0x4f4,'acv sync offset 1V',218)
printCal_tmul(0x4cc,0x4fc,'acv sync offset 10V',219)
printCal_tmul(0x4d4,0x504,'acv sync offset 100V',220)
printCal_tmul(0x4dc,0x50c,'acv sync offset 1KV',221)

printCal_rel(0x4e4,'acv sync gain 10mV',222)
printCal_rel(0x4ec,'acv sync gain 100mV',223)
printCal_rel(0x4f4,'acv sync gain 1V',224)
printCal_rel(0x4fc,'acv sync gain 10V',225)
printCal_rel(0x504,'acv sync gain 100V',226)
printCal_rel(0x50c,'acv sync gain 1KV',227)
printCal_mul(0x514,1.0,'ab ratio', 228)
printCal_mul(0x51c,1.0,'gain ratio', 229)

printCal_rel(0x524,'acv ana gain 10mV',230)
printCal_rel(0x52c,'acv ana gain 100mV',231)
printCal_rel(0x534,'acv ana gain 1V',232)
printCal_rel(0x53c,'acv ana gain 10V',233)
printCal_rel(0x544,'acv ana gain 100V',234)
printCal_rel(0x54c,'acv ana gain 1KV',235)

printCal_imul(0x554,0x524,'acv sync offset 10mV',236)
printCal_imul(0x55c,0x52c,'acv sync offset 100mV',237)
printCal_imul(0x564,0x534,'acv sync offset 1V',238)
printCal_imul(0x56c,0x53c,'acv sync offset 10V',239)
printCal_imul(0x574,0x544,'acv sync offset 100V',240)
printCal_imul(0x57c,0x54c,'acv sync offset 1KV',241)

printCal_mul(0x584,1.0,'rmsdc ratio', 242)
printCal_mul(0x58c,1.0,'sampdc ratio', 243)
printCal_mul(0x594,1.0,'aci gain', 244)
printCal_mul(0x5b6,1.0,'freq gain', 245)

printCal_byte(0x5be, 'attenuator high frequency dac', 246)
printCal_byte(0x5c0, 'amplifier high frequency dac 10mV', 247)
printCal_byte(0x5c1, 'amplifier high frequency dac 100mV', 248)
printCal_byte(0x5c2, 'amplifier high frequency dac 1V', 249)
printCal_byte(0x5c3, 'amplifier high frequency dac 10V', 250)
printCal_byte(0x5c4, 'amplifier high frequency dac 100V', 251)
printCal_byte(0x5c5, 'amplifier high frequency dac 1KV', 252)
printCal_byte(0x5c6, 'interpolator', 253)


printDump()
