# HP-3458A

The 3458A uses a Motorola 68000 running at 8MHz and has 384kb of ROM plus a variable amount of RAM.

## Ghidra Firmware

To open the firmware in Ghidra, you need Ghidra 11.4.1 and update the 68000 processor files with the ones in this repo. The reason for this is, that certain custom calling conventions are needed. pascal calling convention is still an issue – stack cleanup by the called function seemed to be an unsolved issue in Ghidra and technically the parameter order needs to be reversed.

## Jumper

The Outguard Controller Board has two jumpers:

- JM600: Default Position at +5V, Alternative to GND, which allows to override password security for CALRAM access
- JM132: Default Position at U908C.8, Alternative to +5V, which allows to disable any write access to the CALRAM

## Memory Map

|     Memory Range  |    IC Name  | IC Number | Comment |
| ----------------- | ----------- | --------- | ------- |
| 0x000000-0x01FFFF | ROM0L/ROM0U | U110/U111 | 128KB ROM0 (2 x TM27C512) |
| 0x020000-0x03FFFF | ROM1L/ROM1U | U112/U113 | 128KB ROM0 (2 x TM27C512) |
| 0x040000-0x05FFFF | ROM2L/ROM2U | U114/U115 | 128KB ROM0 (2 x TM27C512) |
| 0x060000-0x060FFF | CRAM        |      U132 | CALRAM 16k Nonvolatile SRAM (1 x DS1220Y-150) – only upper byte |
| 0x070000-0x070005 |             |      U700 | Crossguard/Isolator (MB62H301 CMOS Gate Array) |
| 0x080000-0x08001F |             |      U904 | HPIB (TMS9914ANL) |
| 0x090000-0x090001 |             |   U909A.1 | RESET ASM (triggered by any write access, byte or word-wide) |
| 0x0A0000-0x0A0001 |             |  U703C.10 | Write-only: word-write, Crossguard Reset (triggered by any write access) |
| 0x0B0000-0x0B0001 |             |     U908D | Write-only: word-write 0, CALRAM Write-Enable |
| 0x0C0001-0x0C0001 |             |   U102.13 | Write-only: ENABLE REGISTER |
| 0x0C0001-0x0C0001 |             |      U603 | Read-only:  STATUS REGISTER |
| 0x0D0001-0x0D0001 |             |   U902A.3 | HDASM (triggered by any write access) |
| 0x0E0000-0x0E0003 |             |      U800 | Front Panel Interface - Serial Interface Controller (HD63A50P @ 10MHz) |
| 0x0F0000-0x0F000F |             |      U400 | Programmable Timer (HD83A40P) |
| 0x100000-0x100001 |             |           | Write-only: word-write 1, during internal output for a scope to measure a low-level hang |
| 0x110000-0x11FFFF |             |           | Internal simulator IO for debugging the hardware |
| 0x120000-0x12FFFF | RAM0L/RAM0U | U121/U122 | DATARAM RAM 256K Nonvolatile SRAM (2 x DS1235Y-150) |
| 0x130000-0x13FFFF | RAM1L/RAM1U | U123/U124 | 64KB OPTIONAL RAM 0 (2 x HM62256LP-12) |
| 0x140000-0x14FFFF | RAM2L/RAM2U | U125/U126 | 64KB OPTIONAL RAM 1 (2 x HM62256LP-12) |

## Registers

### ENABLE Register

|  Databus Bit  | Signal  | Comment          |
| ------------- | ------- | ---------------- |
|      D0       | EITRIG  |                  |
|      D1       | EITE    |                  |
|      D2       | FPTST   | Front panel test |
|      D3       | n/c     |                  |
|      D4       | DISBERR | disable BERR     |
|      D5       | RSFP    |                  |
|      D6       | EXG1    |                  |
|      D7       | INT7    | trigger IPL7 IRQ |

### STATUS Register

|  Databus Bit  | Signal  | Comment          |
| ------------- | ------- | ---------------- |
|      D0       | JM600   | Jumper, override CALRAM password |
|      D1       | ASMON   |                  |
|      D2       | HOLD    | Front panel test |
|      D3       | A-      |                  |
|      D4       | B-      | disable BERR     |
|      D5       | IFP-    |                  |
|      D6       | ITE0    | HPIB:ATN & NRFD from TMS99114 |
|      D7       | CALWE   | CALRAM is write-enabled for a short time |

## IRQ Levels

The 68000 has 7 IPL, triggered by U605 as the interrupt controller

|    IRQ Level  |    Signal   | Comment          |
| ------------- | ----------- | ---------------- |
|      0        |             | Jumper, override CALRAM password |
|      1        | IPT-        | Timer (U400) |
|      2        | IXGRD-      | Crossguard IRQ (EXGI & CTRLO) |
|      3        | IXGO1-      | Crossguard IRQ (IRQ from U700) |
|      4        | U805.1 IFP- | Frontend IRQ (U800.7: IRQ output from the HD63A50P) |
|      5        | U910.8 IIB- | GPIB (/(ATN & NRFD & EITE) & IHPIB-) |
|      6        | ITRIG-      | endless loop (U800.2 EITRIG & Timer 3 Out) |
|      7        | INT7-       | request CALRAM access, triggered by bit 3 in the enable register |

## Traps

|  TRAP  | Comment          |
| ------ | ---------------- |
|     0  | pSOS function call |
|     1  | pSOS driver call |
|     2  | Run pSOS scheduler |
|     3  | pSOS startup |
|     4  | unknown |
|     5  | Enable IRQ 2 |
|     6  | Disable IRQs |
|     7  | Enable IRQs |
|     8  | unused |
|     9  | unused |
|    10  | unused |
|    11  | unused |
|    12  | unused |
|    13  | unused |
|    14  | unused |
|    15  | Simulator call, e.g. a breakpoint trigger |

VECTOR $100 is tied to debugging via a simulator.
