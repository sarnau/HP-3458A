# HP-3458A

The 3458A uses a Motorola 68000 running at 8MHz and has 384kb of ROM plus a variable amount of RAM.

## IRQ Map

The 68000 has 7 IPL

## Memory Map

Unknown Adr: Enable Register (1 Byte, Write Only). Bit 0: EITRIG, 1:N/C, 2:DTACK-stuff, 3:INT7, 4:EXG1, 5:RSFP, 6:FPTST, 7:EITE

	0x000000-0x01FFFF - ROM0L/ROM0U - U110/U111 - 128KB ROM0
	0x020000-0x03FFFF - ROM1L/ROM1U - U112/U113 - 128KB ROM1
	0x040000-0x05FFFF - ROM2L/ROM2U - U114/U115 - 128KB ROM2
	0x060000-0x060FFF - CRAM        - U132      - CALRAM 16k Nonvolatile SRAM (DS1220Y-150)
	0x070000-0x070006 -             - U700      - IO Crossguard/Isolator (MB62H301 CMOS Gate Array)
	0x080000-0x08001F -             - U904      - IO HPIB (TMS9914ANL)
	0x090000-0x090001 -             -           - IO ?
	0x0A0000-0x0A0001 -             -           - IO ?
	0x0B0000-0x0B0001 -             -           - IO ?
	0x0C0000-0x0C0001 -             -           - IO ?
	0x0D0000-0x0D0001 -             -           - IO ?
	0x0E0000-0x0E0003 -             - U800      - IO Front Panel Interface (HD83A50)
	0x0F0000-0x0F000F -             - U400      - IO Programmable Timer (HD83A40/MC6840)
	0x100000-0x11FFFF - RAM0L/RAM0U - U121/U122 - RAM 256K Nonvolatile SRAM (2 x DS1235Y-150)
	0x120000-0x12AFFF -      "      -     "     - DATARAM
	0x12B000-0x12FFFF -      "      -     "     - NON-VOLATILE RAM
	0x130000-0x13FFFF - RAM1L/RAM1U - U123/U123 - 64KB OPTIONAL RAM 0 (2 x HM62256LP-12)
	0x140000-0x14FFFF - RAM2L/RAM2U - U124/U126 - 64KB OPTIONAL RAM 1 (2 x HM62256LP-12)
