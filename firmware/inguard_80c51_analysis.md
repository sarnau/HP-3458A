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

## 2. Hardware model (code + A3/A1 schematics)

Pin names below come from the CLIP schematic, A3 sheet 1 "IN-GRD CTL & INTERPOLATOR" (03458-66503, "IN GUARD CONTROL LOGIC"
block). U220 is drawn there as "MC8051", clocked from the gate array's 10 MHz `CK10` into XTAL2.
The 80C51 has no external bus (EA tied high, ALE/PSEN not connected). Everything else goes through gate array U210 ("GA_CHIP"):

| 80C51 pin | Net → destination | Use in the firmware |
|---|---|---|
| RXD P3.0 / TXD P3.1 | `UPDA` / `IGCLK` → U210 | serial port mode 0 (`SCON=00`): 8-bit synchronous byte bus to the gate array |
| P0.0–P0.3 | `ADD0`–`ADD3` → U210 | gate-array **register address** (low nibble of P0) |
| P0.4 | `XRXW` → U210 | **read/write select**: P0 = `0xE0\|reg` writes, `0xF0\|reg` reads |
| P0.5 | `NRDGOUT` ← U210 | "new reading out" status (INT0 ISR: start delay counter) |
| P0.6 | `BFSTAT` ← U210 | **UART buffer status**: word ready / TX ready, polled by every transfer |
| P0.7 | `OTHINT` ← U210 | "other interrupt" (status change → read status reg A) |
| P2.3 | `IGSTB` → U210 | inguard strobe (always pulsed `CLR`/`SETB`) |
| P3.7 | `CMDI` ← U210 | command-message indicator (INT0 ISR goes straight to `CMD_DISPATCH`) |
| INT0 P3.2 | `XINTR` ← U210 | gate-array interrupt |
| INT1 P3.3 | `XD_OVLD_F` ← A1 overload detector (U10A via P3(6)/P2(6)) | **input overload** interrupt (high priority, `IP=04`) |
| RESET | `UPRST` ← U210 | the gate array resets the CPU |
| T0 P3.4 / T1 P3.5 | `C0MIN` / `C1MIN` ← U210 | `TMOD=55h`: **external event counters** of two gate-array carries (see §2a). T0 counts **409.6 µs timebase ticks**, T1 counts **readings / 256**. |
| P1.0 | `LEVEL` ← AC board (P1(12)) | AC level-trigger comparator, returned by cmd 0x37 |
| P1.1 | `ADBSY` ← U210 (TP220) | **A/D busy** (`JB P1.1,$` waits) |
| P1.2 | `INCMP`/`XCINCMP` ↔ U210 via R223 1 kΩ | ADC handshake: pulsed low as a strobe, read as the integrator-compare/done input |
| P1.3 | `UPTRG` → U210 | **µP trigger** (cmd 0x00, Timer0 ISR) |
| P1.4 | `ENTRG` → U210 | enable trigger (arm) |
| P1.5 / P1.6 | `XCOT0` / `XCOT1` → U210 | counter 0/1 gate. The Timer1 ISR pulses XCOT1 on overflow. |
| P1.7 | `NRFT` → U210, U212B | reading-done / flip-flop reset strobe |
| P3.6 | `INRFT` → U211B PRE | pulsed at init and with reg C (`GA_RESET_regC_pulse_WR`) |
| P2.4 | `XEXOR` → U210 | **EXT OUT** pulse (cmds 0x05/0x26, per reading or per sequence per 24h) |
| P2.5 | `SEND` → U210 | enable sending ADC readings to the UART |
| P2.6 | `HOLD` → U210, U212A CLR | A/D hold |
| P2.7 | `XETRG` → U210 | execute/start trigger for the A/D sequence (cmd 0x01, sequences) |
| **P2.0** | `PC` → R283 → `PC_F` → P2(12) → **A1** U11D → **Q10** | **PRECHARGE**: JFET from `BOOT` (U12, bootstrapped buffer copy of the input) to the DC input-amp node `P4(1)`. Active high. |
| **P2.1** | `HZ` → R282 → `HZ_F` → P2(11) → **A1** U11C → **Q11** | **ZERO connect**: JFET from the input-amp node to the zero/low FET mux Q22–Q25 (selected by HDGI/HZHVA/HGND/HOHHL from shift reg U6, i.e. from SR1). Active high. Also clears U211A → `XENOV`, which disables the overload clamp sense while on zero. |
| **P2.2** | `XHC` → R281 → `XHC_F` → P2(10) → **A1** U11B → Q28 → **Q12** | **HI connect** (active low): JFET from the selected input HI bus (front-end FET mux Q13–Q21, also the gate of the U12 bootstrap buffer) to the input-amp node |

On A1 ("SENTRY INPUT SIGNAL CONDITIONING", sheet 4 of 5) U11 is an LM339 used as a level shifter (inputs vs +2 V, open-collector
outputs to the −21 V JFET gate drive). Power-up state (`HW_INIT`: P2=0xBE) is PC off, HZ on, HC off, so the input amp sits on zero.

### 2a. What T0 and T1 count

`C0MIN`/`C1MIN` are internal gate-array signals, so the schematic only shows the pins. The meaning comes from how the 68000 builds the
values it loads (opcodes 0x23/0x24/0x25) and how it converts them back (`CMD_TIMER?` @0x2059A, `CMD_DELAY?` @0x20734,
`DETECT_LFREQ` @0x2F10E).

**T0 ← `C0MIN` = carry of a 12-bit timebase in the gate array, clocked by `CK10` (10 MHz). One pulse every 4096 × 100 ns = 409.6 µs.**
* A time value `t` (in 10 ns units) is split as `t = count × 40960 + d`. The partial period `d` goes into SR2 (DELAY) or SR3 (TIMER)
  as `(~(d/10) << 4) | (d % 10)`: a 12-bit inverted 100 ns preload plus a 10 ns digit for the time interpolator.
  `−count` goes into 78–7A (DELAY) or 73–75 (TIMER), and the 80C51 loads it into TL0/TH0 + RAM 31h (24 bits).
* `CMD_TIMER?` reverses this: `(count × 40960 + d) × 1e-8 s`. The power-on default `count=2441, d=16630` → 100,000,000 × 10 ns =
  **1.000 s**, which is the documented TIMER default.
* Use in the firmware: a trigger (`NRDGOUT`/P0.5 in the INT0 ISR) loads the DELAY count. When it expires, the Timer0 ISR pulses `UPTRG` and
  reloads the TIMER count for the following readings. 25h.1/25h.0 flag DELAY/TIMER = 0 (counter not used).

**T1 ← `C1MIN` = carry of an 8-bit reading counter in the gate array. One pulse every 256 readings.**
* `0x29048(N, …)` (called from `CMD_NRDGS`) puts `~N & 0xFF` into SR4 (the gate-array counter) and `−(N >> 8)` into T1 (6B/6C).
  Together that is a 24-bit reading count, which matches the 3458A NRDGS limit of 16,777,215 = 2²⁴−1.
* When T1 overflows, the Timer1 ISR pulses `XCOT1` (P1.6) to tell the gate array the burst is complete. With `N >> 8 == 0`
  (25h.2), T1 is not started and XCOT1 is held low, so presumably the gate array's own 8-bit counter ends the burst (inferred).

**Opcode 0x19 (line frequency)** uses the same two carries. The 8-bit counter counts line-sync cycles, and the 68000 computes
`period = (T0 × 4096 + GA reg 9) × 100 ns / (T1 × 256 + GA reg 8)`, falling back to 60 Hz if the reply is FFFF.

### Input-amp switching (autozero / precharge)

These three JFETs form the autozero front end of the DC input amplifier:

| State | P2.2 XHC | P2.1 HZ | P2.0 PC | Set by |
|---|---|---|---|---|
| amp on **input HI** | 0 | 0 | 0 | cmd 0x0A (flag 26h.1=1) |
| amp on **zero** | 1 | 1 | 0 | cmd 0x0B (26h.1=0), power-up |
| **precharge** only | 1 | 0 | 1 | cmd 0x0C (also P2.6=0) |
| all open | 1 | 0 | 0 | cmd 0x29 |
| HI and zero together | 0 | 1 | 0 | cmd 0x36 |

* `SWITCH_TO_ZERO` @0CEB (was `INPUT_SW_A`): HC off, short wait, HZ on, settle (3E/3F).
* `SWITCH_TO_INPUT_PRECHARGED` @0D0B (was `INPUT_SW_B`): HZ off, **PC on for a few µs** (charges the amp input to the
  bootstrapped input voltage, so closing the HI switch pulls almost no charge from the source), PC off, HC on, settle (3E/3F).
* `TOGGLE_INPUT_ZERO` @0CE8: picks one of the two above from flag 26h.1.
* `ADC_HANDSHAKE_reading` @0860 takes a reading, toggles, takes a second reading and toggles back. That is the in-sequence **AZERO ON**
  signal/zero pair. Cmd 0x14 (zero reading) is `SWITCH_TO_ZERO` + reading + toggle back with settle time 29/2A.
* Cmds 0x11/0x12 are cycle-timed variants: 0x12 = HC off, 20 ms, precharge pulse, HC on, trigger. 0x11 = HC on for 20 ms, then HC off + PC on, trigger.

### Gate-array register map (as used by the code)

P0 low nibble = register, bit 4 (`XRXW`) = 1 for read. The upper bits P0.5–P0.7 are inputs and are written as 1.

| P0 | Reg | Access | Meaning |
|---|---|---|---|
| `FF` | F (rd) | read 1–2 bytes | **UART RX word** from outguard (byte 1 = opcode, byte 2 = parameter) |
| `E7` | 7 (wr) | write 2 bytes | **UART TX data word** to outguard |
| `E8` | 8 (wr) | write 1 byte | **UART TX command/interrupt message** to outguard |
| `E9` | 9 (wr) | write | control register (RAM shadow 22h; init 0x80) |
| `FA` | A (rd) | read | status register → RAM 21h (bit0 = front/rear terminal, bit2 = terminal changed, bit5 = trigger/event) |
| `F8`, `F9` | 8/9 (rd) | read | counter capture (line-frequency command 0x19) |
| `FC`, `FD` | C/D (rd) | read ×10 | diagnostic readback (commands 0x2C/0x2D) |
| `EA`,`EB`,`EC`,`ED` | A–D (wr) | strobe | clear/reset strobes (ADC/counter reset, init) |
| `E0`–`E6` | 0–6 (wr) | write | **shift-register chain n**: shift out the RAM shadow, then latch |
| `F0`–`F6` | 0–6 (rd) | read | **direct mode**: incoming UART words go into shift register n *and* to the CPU (RAM copy) |

This matches the HP Journal (Apr 1989, p.36) description of the "direct output mode": configuration data goes
straight into the shift registers while the processor keeps a copy.

### Shift-register chains and their RAM shadows

| Chain | RAM shadow | Bits | Loaded by | Outguard name (68000 fn) |
|---|---|---|---|---|
| SR0 | 4F–58 | 80 | cmd 0x20 | `SET_ACBD_*` – **AC converter board (A2)** |
| SR1 | 45–4E | 80 | cmd 0x1F | `SET_DCBD_*` – **DC/ohms front end (A1)**, relays. Modified locally by 0x27/0x28/0x38/0x3A and by the INT1 overload ISR. |
| SR2 | 7B–7C | 16 | cmd 0x24 / 0x0F | DELAY first-period prescaler: `(~(d/10)) << 4 \| d%10` (100 ns clocks + 10 ns digit). The SYNC-subsample loop steps it in BCD. |
| SR3 | 76–77 | 16 | cmd 0x23 | TIMER first-period prescaler, same format |
| SR4 | 6D–72 | 48 | cmd 0x25 | GA 8-bit reading counter (low byte of NRDGS) + trigger/count mode bits (6Eh.1 → flag 28h.0) |
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
* `ISR_TIMER0` @06D9: when the 409.6 µs tick count runs out it fires the trigger pulse P1.3 (if one was deferred) and
  reloads the **TIMER** count (73–75). The first count after a trigger is the **DELAY** (78–7A). See §2a.
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
| 02 | 0181 | read GA status reg (A) → send as data word |
| 03 | 0197 | **sequence/EXTOUT config** → 24h[5:0]: bit0/1 = EXT OUT pulse at sequence end / per reading, bit2 = alternate ADC handshake path, bit4 = wait for 0x2E/0x09 between readings, bit5 = **OCOMP** (used by 0x16/0x1C) † |
| 04 | 000E | software arm (25h.5) – TARM SGL † |
| 05 | 0191 | **EXT OUT pulse** (P2.4) – sent by `CMD_EXTOUT` |
| 06 / 07 | 01BA/01A5 | ext-trigger disable / enable+edge (param bit0 → 26h.6; 27h.5, ctl reg bit5) |
| 08 | 01C5 | **ADC self-test conversion**: sets SR5 (ADMEM) bit 0x62.5 (test mode), switch A, arms, optionally triggers (param bit0), checks the P1.2 handshake timing, replies with a data word (always 00; pass/fail shows up as gate-array convergence-error flags). Sent only by the self-test `ISOLATOR_0004e448(0/1)`, called from `ISOLATOR_0004ddb8` (0x0108, then 0x0008 with different ADC settings). |
| 09 | 051D | **stop** running sequence (25h.7) |
| 0A/0B/0C/29/36 | | input-amp switch states: 0A = HI, 0B = zero, 0C = precharge, 29 = all open, 36 = HI+zero (see §2) |
| 0D | 0016 | SETB P2.5 |
| 0E | 0251 | reply flag 25h.4 as data (`CMD_MSIZE?`) |
| 0F | 0265 | DELAY reload without restarting the counters (`0x29232`, used while a sequence runs) |
| 10 | 0276 | **measurement init/abort**: reset GA, reload counters, reply `02` (`ISOLATOR_CHECK`) |
| 11 / 12 | 02BD/02D6 | cycle-timed HI/precharge sequences, then `XETRG` (see §2) |
| 13 | 02B8 | leave ISR / idle |
| 14 | 0889 | **one-shot zero reading** (switch A, ADC handshake, switch back after settle 29/2A). Sent from slot `$1214BE` when AZERO is not ON. The 68000 feeds the result into `ADCAL_SEND` (SR6 offset). |
| 15 / 1A | 0776/077F | **main reading sequence** (slot `$1214BC`): 0x15 for DCV, DCI, DSAC/DSDC and OHM/OHMF without OCOMP. 0x1A first forces the amp onto the input with precharge (`SWITCH_TO_INPUT_PRECHARGED`) and is used for analog ACV/ACDCV (mode 8) and ACI/ACDCI (mode 7). EXT OUT per reading, waits for 2E/09 when 24h.4 is set. |
| 16 | 0AFE | **OCOMP ohms sequence** (OHM/OHMF with OCOMP ON): when 24h.5 is set, each result is a reading pair. It clears the current-source bits in SR1 byte 47h (`ANL 47h,#C0`), re-latches, waits the settle time 41/42 (cmd 0x2A), takes the second reading, then restores 47h. |
| 17 | 02F1 | strobe GA reg 0D, clear busy flag |
| 18 | 09A6 | **SYNC subsampling burst**: two nested sample loops. Each sample advances the SR2 delay by a BCD/binary increment (`SUBSAMPLE_advance_delay_BCD` @0A96), matching the journal's AC digital subsampling. |
| 19 | 08DA | **line-frequency / sync-period measurement**: sent by `DETECT_LFREQ` (`0x0119`) and `CMD_SYNCPARM`, not by FREQ/PER. Runs both counters for a ~1 s window (until TH0 = 0x0A, i.e. 2560 × 409.6 µs) and sends 4 words: GA reg 9 (12-bit prescaler), T0, GA reg 8 (8-bit cycle counter), T1. FFFF = no signal; the 68000 then assumes 60 Hz. |
| 1B | 0BF6 | **AC-cal paired-reading burst**: repeats {arm, wait trigger, latch SR1, trigger, wait reading, latch SR1, delay(param)} until the count is done. Sent only by AC autocal/test (`ACAL_ACV_RATIO_1`, `TEST_ACV_etc` via 0x3B1C2) as `0x1B, time/500`, bracketed by 0x1E/0x1D. `ISOLATOR_0002ba6c` reads N pairs and accumulates Σ(A−B). |
| 1C | 0BB0 | **one-shot OCOMP zero pair** (slot `$1214BE` for OHM/OHMF with OCOMP ON and AZERO not ON): reading with the source on, then source off (47h&C0), settle, second reading. For OHMF the result is kept in `$14E8`, otherwise it goes to `ADCAL_SEND`. |
| 1D/1E, 3B/3C | | control reg bit 2 / bit 1 on/off |
| **1F** | 0320 | **load SR1 (DC board)**, 5 words via direct mode |
| **20** | 033B | **load SR0 (AC board)**, 5 words |
| **21** | 0367 | **load SR5 (ADMEM)**, 6 words |
| **22** | 0353 | **load SR6 (ADCAL)**, 3 words |
| 23 | 037E | **TIMER**: SR3 = first partial period, 73–75 = −(number of 409.6 µs ticks) (`0x292D0`, from `CMD_TIMER`/`CMD_DELAY`) |
| 24 | 03BE | **DELAY**: SR2 = first partial period, 78–7A = −ticks (`0x291B0`, from `CMD_DELAY`, `CMD_APER`, `CMD_NPLC`, `CMD_RES`). Also `CMD_SWEEP` via `0x2935E`/`0x293BE`. |
| 25 | 03F8 | **NRDGS**: SR4 (incl. GA 8-bit reading counter = ~N low byte, and trigger-mode bits) + T1 = −(N>>8) (`0x29048` from `CMD_NRDGS`, then `0x2943E`) |
| 26 | 0440 | EXTOUT pulse(s) per 24h config |
| 27 / 28 | 0445/0458 | DC relay drive release / protected relay sequence (checks INT1 and reports 05 on overload) |
| 2A | 04BA | settle flag + settle time 41/42 |
| 2B | 04CD | input-switch settle time (value − 0x16 → 29/2A) |
| 2C / 2D | 04F9/0514 | read 10 bytes from GA reg C / D → data words (diagnostic) |
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

## 6. How the 68000 picks the measurement opcodes

`MEASURE_SELECT_ROUTINE` @0x31EC6 (args: internal function code `$1397`, AZERO `$13A0`, OCOMP `$139F`) fills two opcode slots plus the
reading routine `$1214C0`. `MEASURE_TRIGGER_AND_TAKE` @0x39B7A then works in three steps:

1. If a zero reading is pending (`$1477 == 2`) and `$1214BE != 0x13`, it sends `$1214BE`, reads the result (`ISOLATOR_0002a9c6`) and loads it into
   `ADCAL_SEND` (or `$14E8` for OHMF + 0x1C).
2. Unless the fast integer path is selected, it sends `$1214BC` (the sequence), plus `0x00` (trigger) or `0x04` (arm) for TRIG/TARM SGL.
3. It calls the reading routine. When the EXTOUT mode `$13A4` is 4, it sends `0x05` at the end.

Internal function codes (from `CMD_FUNC?` @0x1EFB0): 1 DCV, 3 OHM, 4 OHMF, 5 DCI, 6 DSAC/DSDC, 7 ACI/ACDCI,
8/10/11 ACV/ACDCV (SETACV analog/sync/random), 12 SSAC/SSDC, 13/14 FREQ/PER.

| Code | Function | `$1214BC` sequence | `$1214BE` zero op (AZERO off) |
|---|---|---|---|
| 1 | DCV | 0x15 | 0x14 |
| 3 / 4 | OHM / OHMF | 0x15, or **0x16** with OCOMP | 0x14, or **0x1C** with OCOMP |
| 5 | DCI | 0x15 | 0x13 (default case: no zero reading) |
| 6 | DSAC/DSDC | 0x15 | 0x14 |
| 7 | ACI/ACDCI | 0x1A | 0x14 |
| 8 | ACV/ACDCV analog | 0x1A | 0x14 |
| 10 / 11 | ACV/ACDCV sync / random | 0x13 (none; read path drives 0x18 etc.) | 0x14 |
| 12 | SSAC/SSDC | 0x13 | 0x14 |
| 13 / 14 | FREQ/PER | 0x13 | 0x14 |

For DC-type codes (≤5) with AZERO ON the zero slot is 0x13 (none), because autozero then happens inside the sequence.
For codes >5 the zero slot is always set to 0x14, but it is only sent when `$1477 == 2`.
`$1477` is set to 2 by `ADMEM_SEND_00029ca8`/the AZERO path (0x2A6C2) whenever the zero reference has to be re-taken.

## 7. RAM map (highlights)

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
| 6B/6C | Timer1 preload = −(NRDGS >> 8) |
| 6D–72 | SR4 shadow |
| 73–75 / 76–77 | TIMER tick count / SR3 (TIMER first period) |
| 78–7A / 7B–7C | DELAY tick count / SR2 (DELAY first period) |

## 8. Open points

* 0x18 is confirmed as part of the sampling read paths (`MEAS_read_scale_float`, `READING_FAST_INT_PATH`), but the exact subsample timing units are still open.
