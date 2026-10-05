# HP 3458A — A3U220 80C51 (03458-85501 Rev 1): Inguard Controller

File: `A3_U220_Intel_P80C51BH_03458-85501_Rev1.BIN` (4096 bytes, internal mask ROM of an 80C51BH)
Annotated disassembly: [`inguard_80c51_disasm.txt`](inguard_80c51_disasm.txt)

> **This is the INGUARD processor, not the front panel.** The CLIP parts list puts `A3U220 03458-85501`
> on **A3 = "PC ASSEMBLY – A/D INGUARD LOGIC"**, next to the A/D hybrid (U180), the 6000-gate CMOS gate
> array (U210), a 20 MHz oscillator (U230) and the HFBR-1510/2501 fiber-optic transmitter/receiver.
> The front-panel 80C51 is a different chip, **A6U400 (03458-85502)**, and its ROM is not in this repo.
> (The older `fp80c51_disasm.txt` was written under the front-panel assumption, so its labels are wrong.)

## 1. Integrity

* Checksum: the sum of bytes `0x0000–0x0FFB` mod 256 is `0xFF`, which matches the ROM's own check (`ROM_CHECKSUM` @0FDA,
  run by self-test command 0x32). Byte `0x0FFB = 0x75` is the adjust byte. `0x0FFC–0x0FFF = FF`.
* Code coverage: 3960 of 4096 bytes are reached from the reset/IRQ vectors and the command jump table. The only
  unreached bytes are the jump table itself and 8 dead bytes at 0x0824.

## 2. Hardware model (derived from the code)

The 80C51 has no external bus. It reaches all the inguard hardware through the gate array:

| 80C51 resource | Use |
|---|---|
| **Serial port, mode 0** (`SCON=00`) | 8-bit synchronous byte bus to the gate array (RXD = data, TXD = clock). No UART use. |
| **P0[4:0]** | gate-array **register address** (P0 is written as `0xE0 \| reg` or `0xF0 \| reg`) |
| **P2.3** | address/transfer **strobe** (always pulsed `CLR`/`SETB`) |
| **P0.5 / P0.6 / P0.7** | gate-array status inputs, read in the INT0 ISR. **P0.6 = UART word ready / TX ready** (every transfer polls it). P0.5 = trigger event, P0.7 = status changed. |
| **INT0** (P3.2) | gate-array interrupt (UART message, trigger, status change) |
| **INT1** (P3.3) | **input overload / protection** interrupt (high priority, `IP=04`) |
| **Timer0 / Timer1** | `TMOD=55h`: both are **16-bit external event counters** (C/T=1), not timers. T0 is extended to 24+8 bits with RAM 31h. |
| P3.6 (WR) | pulsed together with gate-array reg 0C: a reset/clear strobe |
| P3.7 (RD) | read as an input in the INT0 ISR (selects the direct-dispatch path) |
| P1.3 | **trigger pulse** to the ADC/trigger logic (command 0x00, Timer0 ISR) |
| P1.2 / P1.1 | ADC handshake: pulse P1.2 to start, wait on P1.2 and P1.1 (`ADC_HANDSHAKE_reading` @0860) |
| P1.4, P1.7, P2.7 | sequence strobes: arm, end-of-reading, start |
| P1.5 / P1.6 | gate the T0/T1 count inputs; the Timer1 ISR just pulses P1.6 when the count overflows |
| P2.0 / P2.1 / P2.2 / P2.6 | ADC input switch/FET control. Commands 0x0A/0B/0C/11/12/29/36 set fixed patterns, some with cycle-exact `MUL AB` padding, and settle times come from RAM 3E/3F. |
| P2.4 | **EXT OUT** pulse (commands 0x05/0x26, and at reading or sequence end depending on the EXTOUT config in 24h) |
| P1.0 | input bit returned to the outguard by command 0x37 |

### Gate-array register map (as used by the code)

| P0 | Reg | Access | Meaning |
|---|---|---|---|
| `FF` | 1F | read 1–2 bytes | **UART RX word** from outguard (byte 1 = opcode, byte 2 = parameter) |
| `E7` | 07 | write 2 bytes | **UART TX data word** to outguard |
| `E8` | 08 | write 1 byte | **UART TX command/interrupt message** to outguard |
| `E9` | 09 | write | control register (RAM shadow 22h; init 0x80) |
| `FA` | 1A | read | status register → RAM 21h (bit0 = front/rear terminal, bit2 = terminal changed, bit5 = trigger/event) |
| `F8`, `F9` | 18/19 | read | counter capture (frequency/period command 0x19) |
| `FC`, `FD` | 1C/1D | read ×10 | diagnostic readback (commands 0x2C/0x2D) |
| `EA`,`EB`,`EC`,`ED` | 0A–0D | strobe | clear/reset strobes (ADC/counter reset, init) |
| `E0`–`E6` | 00–06 | write | **shift-register chain n**: shift out the RAM shadow, then latch |
| `F0`–`F6` | 10–16 | read | **direct mode**: incoming UART words go into shift register n *and* to the CPU (RAM copy) |

This matches the HP Journal (Apr 1989, p.36) description of the "direct output mode": configuration data goes
straight into the shift registers while the processor keeps a copy.

### Shift-register chains and their RAM shadows

| Chain | RAM shadow | Bits | Loaded by | Outguard name (68000 fn) |
|---|---|---|---|---|
| SR0 | 4F–58 | 80 | cmd 0x20 | `SET_ACBD_*` – **AC converter board (A2)** |
| SR1 | 45–4E | 80 | cmd 0x1F | `SET_DCBD_*` – **DC/ohms front end (A1)**, relays. Modified locally by 0x27/0x28/0x38/0x3A and by the INT1 overload ISR. |
| SR2 | 7B–7C | 16 | cmd 0x24 / 0x0F | trigger delay / timebase (the SYNC-subsample loop adjusts it in BCD) |
| SR3 | 76–77 | 16 | cmd 0x23 | timer timebase |
| SR4 | 6D–72 | 48 | cmd 0x25 | trigger/sample-count config (6Eh.1 → flag 28h.0) |
| SR5 | 59–64 | 96 | cmd 0x21 | `ADMEM_SEND_*` – ADC slope/sequence memory |
| SR6 | 65–6A | 48 | cmd 0x22 | `ADCAL_SEND_*` – ADC calibration |

That totals 384 bits. The journal says "five shift registers containing 460 bits", so the remaining bits are probably inside the gate array.

## 3. Firmware architecture

* `RESET`→`MAIN_init` @0020: `HW_INIT` (ports, RAM, `IP=04`, `TMOD=55`, `TCON=50`, `SCON=00`, **DPTR=00DD**
  stays loaded permanently as the jump-table base), write control reg, send command message **0x01**
  ("I have reset") to the outguard, `IE=8F`, then **`SJMP $`**. All work runs from interrupts.
* `ISR_INT0_gatearray` @0087: reads the status reg. On a trigger event (P0.5) it starts the delay counter
  (`TRIGGER_EVENT_start_delay_counter` @0680). On a status change (P0.7) it reads status into 21h and reports a
  terminal change. When a UART word is ready (P0.6) it calls `CMD_DISPATCH`.
* `CMD_DISPATCH` @00C0: opcode = first byte of the UART word. If it is ≥ 0x3E, it replies with command message
  **0x0A** (outguard: `ERROR_UNKNOWN_SLAVE_PROCESSOR_COMMAND`). Otherwise it runs `RL A; JMP @A+DPTR` through
  the **62-entry AJMP table @00DD**. Handlers read their parameter byte or extra words through
  `GA_READ_BYTE`/`RX_WORD_first_byte_wait`.
* **Foreground trick**: `LEAVE_ISR_CONTINUE_FOREGROUND` @0E37 pops the return address to 08/09, sets
  `SP=09` and executes `RETI`. A long measurement command (0x14–0x1C, 0x10, 0x32) leaves interrupt context this
  way and runs as foreground code, so new UART commands can still interrupt it, for example 0x2E "next
  reading" or 0x09 "stop", which set flags 25h.6/25h.7 that the sequence loops poll. Sequences end in `SJMP $`
  and wait for the next command.
* **Cycle-exact padding**: `MUL AB` / `DIV AB` / `MOVC` act as 4- and 2-cycle NOPs in the shift loops and
  switch sequences (e.g. 0C88, 02CB, 0E9F).
* `ISR_TIMER0` @06D9: when the 24-bit event count runs out it fires the trigger pulse P1.3 (if one was deferred) and
  reloads the **interval** count (73–75). The **first** count comes from 78–7A. In 3458A terms this looks like
  **DELAY → first reading, then TIMER interval**, both counted in gate-array timebase ticks (inferred).
* `ISR_INT1_OVERLOAD_PROTECT` @0710: forces bits in the SR1 (DC board) shadow, re-shifts SR0/SR1 with relay
  settle delays, and sends command message **0x05** (outguard: `CALRAM_INCREMENT_DESTRUCTIVE_EVENTS`, the
  input-protection relay sequence described in the journal).

## 4. Link protocol

The physical link is the custom gate-array UART (3.3 Mbit/s fiber). Each message is a **16-bit word**. Data words and
command (interrupt) words are separate message types. Outguard side: `0x70000` = word TX/RX, `0x70003` = status,
`IRQ_27_LEVEL_3_IRQ_ISOLATOR_SEND`, `IRQ_26_LEVEL_2_IRQ_ISOLATOR_RECEIVE`, queue `ISOLATOR_ADD_SEND_BUFFER`.

**Outguard → inguard:** the word's low byte is the opcode, because it is shifted in first. The 68000 pushes e.g. `0x0039` for `REV?`,
`0x0115` = opcode 0x15 with param 0x01, `0xC833` = opcode 0x33 (delay) with param 0xC8.

**Inguard → outguard command messages** (`IRQ_26` decode, low byte plus gate-array flag bits):

| Code | Sent by 80C51 at | Outguard reaction |
|---|---|---|
| `01` | power-up (`MAIN_init`) | `ISOLATOR_UNEXPECTED_SLAVE_PROCESSOR_RESET` |
| `02` | cmd 0x10 complete | polled reply (not via IRQ) |
| `04` | trigger while busy (0F08) | `ERROR_TRIGGER_TOO_FAST` |
| `05` | INT1 overload / cmd 0x28 | `CALRAM_INCREMENT_DESTRUCTIVE_EVENTS` |
| `07` | trigger count done (0EE5) | sets 0x1214C5 (sequence done) |
| `08`/`09` | terminal switch change (`SEND_TERMINAL_STATUS`) | `ISOLATOR_SELECT_TERMINAL(0/1)` front/rear |
| `0A` | bad opcode | `ERROR_UNKNOWN_SLAVE_PROCESSOR_COMMAND` |
| `AA`,`55` | self-test end | `ISOLATOR_TEST` |
| bit 8/9 | gate array | ± sensor/ADC overrange (`$14FA = ±1`) |
| bit 10 / 11 | gate array ADC | balance / multislope rundown convergence error |
| bit 12 | gate array | trigger too fast |
| bit 13 | gate array | reading/end-of-sequence flag |

Data words (readings, reply values) go out through reg 07, and the ADC result words come straight from the gate array.

## 5. Command table (outguard → inguard opcodes)

Semantics marked † are inferred from code behaviour and/or the name of the 68000 function that sends the opcode. The rest is read directly from the handler code.

| Op | Handler | Action |
|---|---|---|
| 00 | 016E | **trigger**: pulse P1.3 (deferred via 28h.1 while the delay counter runs) |
| 01 | 017B | pulse P2.7 (start) |
| 02 | 0181 | read GA status reg (1A) → send as data word |
| 03 | 0197 | **EXTOUT config** → 24h[5:0] † |
| 04 | 000E | software arm (25h.5) – TARM SGL † |
| 05 | 0191 | **EXT OUT pulse** (P2.4) – sent by `CMD_EXTOUT` |
| 06 / 07 | 01BA/01A5 | ext-trigger disable / enable+edge (param bit0 → 26h.6; 27h.5, ctl reg bit5) |
| 08 | 01C5 | timed P1.2 handshake test; result bit → data word † |
| 09 | 051D | **stop** running sequence (25h.7) |
| 0A/0B/0C/29/36 | | ADC input switch states (P2.0–P2.2), 0A/0B also set the zero/signal flag 26h.1 † |
| 0D | 0016 | SETB P2.5 |
| 0E | 0251 | reply flag 25h.4 as data (`CMD_MSIZE?`) |
| 0F | 0265 | load SR2 + delay count without restarting |
| 10 | 0276 | **measurement init/abort**: reset GA, reload counters, reply `02` (`ISOLATOR_CHECK`) |
| 11 / 12 | 02BD/02D6 | cycle-timed input-switch sequences (P2.0/P2.2/P2.6, then pulse P2.7) |
| 13 | 02B8 | leave ISR / idle |
| 14 | 0889 | **single reading** (ADC handshake, optional SR5 bit tweak) |
| 15 / 1A | 0776/077F | **reading sequence** (EXTOUT per reading, waits for 2E/09) |
| 16 | 0AFE | reading sequence with SR1 range/relay switching between readings (autorange/ohms †) |
| 17 | 02F1 | strobe GA reg 0D, clear busy flag |
| 18 | 09A6 | **SYNC subsampling burst**: two nested sample loops. Each sample advances the SR2 delay by a BCD/binary increment (`SUBSAMPLE_advance_delay_BCD` @0A96), matching the journal's AC digital subsampling. |
| 19 | 08DA | **frequency/period**: counts with T0/T1 and GA counters 18/19, sends 4 data words (FFFF = timeout) |
| 1B | 0BF6 | repeat sequence with SR1 re-latch and delay |
| 1C | 0BB0 | single sequence with SR1 update |
| 1D/1E, 3B/3C | | control reg bit 2 / bit 1 on/off |
| **1F** | 0320 | **load SR1 (DC board)**, 5 words via direct mode |
| **20** | 033B | **load SR0 (AC board)**, 5 words |
| **21** | 0367 | **load SR5 (ADMEM)**, 6 words |
| **22** | 0353 | **load SR6 (ADCAL)**, 3 words |
| 23 | 037E | load SR3 + 24-bit **interval** count (73–75) |
| 24 | 03BE | load SR2 + 24-bit **first/delay** count (78–7A) |
| 25 | 03F8 | load SR4 + 16-bit T1 count (6B/6C) |
| 26 | 0440 | EXTOUT pulse(s) per 24h config |
| 27 / 28 | 0445/0458 | DC relay drive release / protected relay sequence (checks INT1 and reports 05 on overload) |
| 2A | 04BA | settle flag + settle time 41/42 |
| 2B | 04CD | input-switch settle time (value − 0x16 → 29/2A) |
| 2C / 2D | 04F9/0514 | read 10 bytes from GA reg 1C / 1D → data words (diagnostic) |
| 2E | 0521 | **next reading** (25h.6) |
| 2F | 0525 | **TARM event** select (23h bits 4–6) † |
| 30 | 0549 | **TRIG event** select (23h bits 0–2) + 24-bit count 37–39 † |
| 31 | 058A | 32-bit software **delay** (3A–3D), used in `WAIT_ARM_AND_TRIGGER` |
| 32 | 05BB | **self-test**: UART echo loop, `AA 55`, ROM checksum, RAM test, re-init, reply status (bit0 ROM, bit1 RAM) |
| 33 / 34 / 35 | | busy-wait delays (short / ~ms / long) |
| 37 | 061A | reply P1.0 |
| 38 | 0627 | relay settle: delay, clear SR1 bit 45h.1, re-shift, delay (follows every 0x1F load) |
| **39** | 063B | **REV?** → data word `0002` (inguard firmware revision 2) |
| 3A | 0645 | set SR1 bits (4Dh \|= 66h, &7F) and re-shift |
| 3D | 0650 | aux count 2B/2C (used as a timeout in the subsample loop) |
| ≥3E | — | reply `0A` (unknown command) |

## 6. RAM map (highlights)

| Addr | Use |
|---|---|
| 08/09 | foreground "return address" slot used by `LEAVE_ISR_CONTINUE_FOREGROUND` (SP=09) |
| 21 | last GA status byte |
| 22 | GA control-reg shadow (bits 1,2,5,7 driven by commands) |
| 23 | TARM (bits 4–6) / TRIG (bits 0–2) event selects |
| 24 | EXTOUT config [5:0], 24h.6 = reading done, 24h.7 = count done |
| 25 | state flags (25h.0/1 = interval/delay count is zero, 25h.4 = trigger seen, 25h.5 = sw arm, 25h.6 = next, 25h.7 = stop) |
| 26/27 | misc mode flags (26h.1 input-switch state, 26h.4 = "no trigger wait" from param bit0, 27h.3/4 counter phase) |
| 29/2A, 3E/3F, 41/42 | settle times |
| 2B/2C | subsample timeout |
| 30–33 | scratch counters for shift/delay loops |
| 34–36 / 37–39 | trigger count (working / reload) |
| 3A–3D | 32-bit trigger delay |
| 45–58 | SR1/SR0 shadows (DC / AC boards) |
| 59–6A | SR5/SR6 shadows (ADMEM / ADCAL) |
| 6B/6C | Timer1 count |
| 6D–72 | SR4 shadow |
| 73–75 / 76–77 | interval count / SR3 |
| 78–7A / 7B–7C | first/delay count / SR2 |

## 7. Open points

* Exact meaning of P2.0/P2.1/P2.2/P2.6 (which ADC input/zero switches) needs the A3 schematic. The CLIP schematic
  pages were not OCR-readable.
* T0/T1 count sources (which gate-array clocks or events drive pins T0/T1) are inferred from usage only.
* Commands 0x08, 0x16, 0x1B, 0x1C would benefit from mapping each one to the 68000 call site in `MEASURE_TRIGGER_AND_TAKE`
  (most of those opcodes are sent through variables, so the static scan did not resolve them).
