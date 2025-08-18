# HP-3458A

The 3458A uses a Motorola 68000 running at 8MHz and has 384kb of ROM plus a variable amount of RAM.

## Memory Map

	0x000000-0x01FFFF - ROM0L/ROM0U - U110/U111 - 128KB ROM0 (2 x TM27C512)
	0x020000-0x03FFFF - ROM1L/ROM1U - U112/U113 - 128KB ROM1 (2 x TM27C512)
	0x040000-0x05FFFF - ROM2L/ROM2U - U114/U115 - 128KB ROM2 (2 x TM27C512)
	0x060000-0x060FFF - CRAM        - U132      - CALRAM 16k Nonvolatile SRAM (1 x DS1220Y-150) – only upper byte
	0x070000-0x070006 -             - U700      - Crossguard/Isolator (MB62H301 CMOS Gate Array)
	0x080000-0x08001F -             - U904      - HPIB (TMS9914ANL)
	0x090000-0x090000 -             -           - ?
	0x0A0000-0x0A0001 -             -           - ?
	0x0B0000-0x0B0001 -             -           - ?
	0x0C0001-0x0C0001 -             - U102      - ENABLE REGISTER (74HCT273N, Write-Only) Bit 0: EITRIG, 1:n/c, 2:DTACK-stuff, 3:INT7, 4:EXG1, 5:RSFP, 6:FPTST, 7:EITE
	0x0D0001-0x0D0001 -             -           - ?
	0x0E0000-0x0E0003 -             - U800      - Front Panel Interface - Serial Interface Controller (HD63A50P @ 10MHz)
	0x0F0000-0x0F000F -             - U400      - Programmable Timer (HD83A40P)
	0x100000-0x11FFFF -             -      "    - Mirror of 0x0F0000-0x0Fxxxxx
	0x120000-0x12FFFF - RAM0L/RAM0U - U121/U122 - DATARAM RAM 256K Nonvolatile SRAM (2 x DS1235Y-150)
	0x130000-0x13FFFF - RAM1L/RAM1U - U123/U123 - 64KB OPTIONAL RAM 0 (2 x HM62256LP-12)
	0x140000-0x14FFFF - RAM2L/RAM2U - U124/U126 - 64KB OPTIONAL RAM 1 (2 x HM62256LP-12)

## IRQ Levels

The 68000 has 7 IPL, triggered by U605 as the interrupt controller

    0 -        - never triggered, illegal
	1 - IPT-   - Timer (U400)
	2 - IXGRD- - Isolator (Inboard) (EXGI & CTRLO)
	3 - IXGO1- - Isolator (Inboard) (IRQ from U700)
	4 - U805.1 - Frontend (U800, Display, Keyboard)
	5 - U910.8 - GPIB (U904)
	6 - ITRIG- - endless loop (U800.2 EITRIG & Timer 3 Out)
	7 - INT7-  - CALRAM access

## Traps

	TRAP #0  - pSOS function call
	TRAP #1  - pSOS driver call
	TRAP #2  - Run pSOS scheduler
	TRAP #3  - pSOS startup
	TRAP #4  - unknown
	TRAP #5  - Enable IRQ 2
	TRAP #6  - Disable IRQs
	TRAP #7  - Enable IRQs
	TRAP #8  - unused
	TRAP #9  - unused
	TRAP #10 - unused
	TRAP #11 - unused
	TRAP #12 - unused
	TRAP #13 - unused
	TRAP #14 - unused
	TRAP #15 - looks like some debugging helper code

VECTOR $100 also seems to be tied to some debugging code.
