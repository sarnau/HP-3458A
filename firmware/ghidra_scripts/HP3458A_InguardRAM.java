// Name the HP 3458A inguard 80C51 (A3U220) internal RAM variables and flag bits.
// INTMEM bytes get labels (and byte arrays for multi-byte shadows); the bit-addressable flags get labels in the BITS
// space (bit address = (byte - 0x20) * 8 + bit), which replace the default "27.4"-style names the decompiler shows as _7_4.
// Source: firmware/inguard_80c51_analysis.md (sections 2a/2b/5/7). Labels you set yourself are kept.
//@category HP3458A
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.*;
import ghidra.program.model.data.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;
import java.util.*;

public class HP3458A_InguardRAM extends GhidraScript {
    static final String[][] BYTES = {
        {"21", "gGA_STATUS", "1", "last gate-array status byte (read reg A): bit0 front/rear terminal, bit2 terminal changed, bit5 trigger/event"},
        {"22", "gGA_CTRL_SHADOW", "1", "shadow of gate-array control reg 9 (init 0x80), written by GA_WRITE_CTRL_reg09_from_22h"},
        {"23", "gTRIG_TARM_SEL", "1", "TRIG event select bits 0-2 (cmd 0x30), TARM event select bits 4-6 (cmd 0x2F)"},
        {"24", "gSEQ_CFG", "1", "cmd 0x03 bits 0-5: EXTOUT at end / per reading, AZERO pairs, wait for 0x2E, OCOMP; bit6 reading done, bit7 count done"},
        {"25", "gSTATE", "1", "run-time state flags (see bit labels 25h.x)"},
        {"26", "gMODE", "1", "mode flags (see bit labels 26h.x)"},
        {"27", "gMODE2", "1", "mode flags (see bit labels 27h.x)"},
        {"28", "gMODE3", "1", "28h.0 = SR4 bit 6Eh.1, 28h.1 = trigger deferred"},
        {"29", "gZERO_SETTLE_LO", "1", "switch settle time for the zero reading (cmd 0x2B value - 0x16), low"},
        {"2A", "gZERO_SETTLE_HI", "1", "switch settle time for the zero reading, high"},
        {"2B", "gSUBSAMPLE_TIMEOUT_HI", "1", "subsample trigger timeout (cmd 0x3D), outer count"},
        {"2C", "gSUBSAMPLE_TIMEOUT_LO", "1", "subsample trigger timeout (cmd 0x3D), inner count"},
        {"2D", "gSUBSAMPLE_FLAGS", "1", "2Dh.0 = STEP is 0, 2Dh.1 = B2 is 0 (cmd 0x18)"},
        {"30", "gXFER_COUNT", "1", "word/byte count for RX_WORDS_DIRECT_to_RAM / SHIFT_OUT_RAM_block"},
        {"31", "gT0_EXT", "1", "Timer0 extension byte (bits 16-23 of the 409.6 us tick count)"},
        {"32", "gDLY_INNER", "1", "scratch counter for the delay loops (inner)"},
        {"33", "gDLY_OUTER", "1", "scratch counter for the delay loops (outer)"},
        {"34", "gTRIG_COUNT_WORK", "3", "TRIG event count, working copy (DJNZ-prepared, cmd 0x30)"},
        {"37", "gTRIG_COUNT_RELOAD", "3", "TRIG event count, reload value (cmd 0x30)"},
        {"3A", "gTRIG_DELAY_LOOP", "4", "32-bit software trigger delay (cmd 0x31), DJNZ-prepared"},
        {"3E", "gSWITCH_SETTLE_LO", "1", "input-amp switch settle time, inner (cmd 0x2B)"},
        {"3F", "gSWITCH_SETTLE_HI", "1", "input-amp switch settle time, outer (cmd 0x2B)"},
        {"40", "gSR1_47_SAVED", "1", "saved SR1 byte 47h (current-source bits), restored after OCOMP source-off reading"},
        {"41", "gOCOMP_SETTLE_HI", "1", "OCOMP settle time after source switch, outer (cmd 0x2A)"},
        {"42", "gOCOMP_SETTLE_LO", "1", "OCOMP settle time, inner (cmd 0x2A)"},
        {"43", "gSEQ_PARAM_A", "1", "cmd 0x18: B1 high byte (DJNZ); cmd 0x1B: inter-burst delay; self-test scratch"},
        {"44", "gSEQ_PARAM_B", "1", "cmd 0x18: B2 high byte (DJNZ)"},
        {"45", "gSR1_DCBD_SHADOW", "10", "SR1 shadow: A1 DC/ohms board relays and FET drives, 80 bits (cmd 0x1F, direct mode)"},
        {"4F", "gSR0_ACBD_SHADOW", "10", "SR0 shadow: A2 AC board, 80 bits (cmd 0x20)"},
        {"59", "gSR5_ADMEM_SHADOW", "12", "SR5 shadow: ADC slope/sequence memory, 96 bits (cmd 0x21)"},
        {"65", "gSR6_ADCAL_SHADOW", "6", "SR6 shadow: ADC calibration, 48 bits (cmd 0x22)"},
        {"6B", "gNRDGS_T1_HI", "1", "Timer1 preload high = -(NRDGS >> 8) (cmd 0x25), loaded into TH1"},
        {"6C", "gNRDGS_T1_LO", "1", "Timer1 preload low, loaded into TL1"},
        {"6D", "gSR4_SHADOW", "6", "SR4 shadow: GA 8-bit reading counter (~NRDGS low byte at 6Dh) + trigger/count mode bits (cmd 0x25)"},
        {"73", "gTIMER_TICKS", "3", "TIMER: -(409.6 us ticks), 73h -> T0 ext (31h), 74h -> TH0, 75h -> TL0 (cmd 0x23)"},
        {"76", "gSR3_TIMER_FIRST", "2", "SR3 shadow: TIMER first partial period ((~(d/10))<<4 | d%10) (cmd 0x23)"},
        {"78", "gDELAY_TICKS", "3", "DELAY: -(409.6 us ticks), 78h -> T0 ext, 79h -> TH0, 7Ah -> TL0 (cmd 0x24)"},
        {"7B", "gSR2_DELAY_FIRST", "2", "SR2 shadow: DELAY first partial period, 100 ns field + 10 ns digit (cmd 0x24, stepped by cmd 0x18)"},
    };
    static final String[][] BITS = {
        {"8", "bGA_STAT_TERMINAL", "21h.0: front/rear terminal state (reported as 08/09)"},
        {"A", "bGA_STAT_TERMINAL_CHANGED", "21h.2: terminal switch changed"},
        {"D", "bGA_STAT_EVENT", "21h.5: trigger/event seen by the gate array"},
        {"11", "bGA_CTL_BIT1", "22h.1: control reg bit 1 (cmds 0x3B/0x3C)"},
        {"12", "bGA_CTL_BIT2", "22h.2: control reg bit 2 (cmds 0x1D/0x1E)"},
        {"15", "bGA_CTL_EXT_TRIG", "22h.5: control reg bit 5: external trigger enable"},
        {"17", "bGA_CTL_BIT7", "22h.7: control reg bit 7"},
        {"18", "bTRIG_AUTO", "23h.0: TRIG AUTO: no wait (cmd 0x30, neither bit set)"},
        {"19", "bTRIG_SGL", "23h.1: TRIG SGL: wait for software arm 25h.5 (cmd 0x30 bit0)"},
        {"1A", "bTRIG_EXT", "23h.2: TRIG EXT: wait for gate-array event (cmd 0x30 bit1, edge = bit0)"},
        {"1C", "bTARM_AUTO", "23h.4: TARM AUTO: no wait (cmd 0x2F, neither bit set)"},
        {"1D", "bTARM_SGL", "23h.5: TARM SGL: wait for software arm 25h.5 (cmd 0x2F bit0)"},
        {"1E", "bTARM_EXT", "23h.6: TARM EXT: wait for gate-array event (cmd 0x2F bit1, edge = bit0)"},
        {"20", "bEXTOUT_AT_SEQ_END", "24h.0: EXT OUT pulse at end of sequence"},
        {"21", "bEXTOUT_PER_READING", "24h.1: EXT OUT pulse per reading"},
        {"22", "bSEQ_AZERO_PAIRS", "24h.2: take signal/zero reading pairs (AZERO ON, CMD15_AZERO_PAIR_SEQUENCE)"},
        {"24", "bSEQ_WAIT_NEXT", "24h.4: wait for cmd 0x2E/0x09 between readings"},
        {"25", "bSEQ_OCOMP", "24h.5: offset-compensated ohms (cmds 0x16/0x1C)"},
        {"26", "bREADING_DONE", "24h.6: reading finished"},
        {"27", "bCOUNT_DONE", "24h.7: trigger count exhausted (reports 07)"},
        {"28", "bTIMER_IS_ZERO", "25h.0: TIMER tick count is 0 (not used)"},
        {"29", "bDELAY_IS_ZERO", "25h.1: DELAY tick count is 0 (not used)"},
        {"2A", "bT1COUNT_IS_ZERO", "25h.2: NRDGS < 256: Timer1 not started"},
        {"2B", "bARM_WAIT_ACTIVE", "25h.3: WAIT_ARM_AND_TRIGGER in progress"},
        {"2C", "bTRIG_SEEN", "25h.4: trigger seen while busy (cmd 0x0E reply)"},
        {"2D", "bSW_ARM", "25h.5: software arm (cmd 0x04, TARM SGL)"},
        {"2E", "bNEXT_READING_REQ", "25h.6: next reading requested (cmd 0x2E)"},
        {"2F", "bSTOP_REQ", "25h.7: stop sequence requested (cmd 0x09)"},
        {"31", "bAMP_ON_INPUT", "26h.1: input amp currently on input HI (else on zero)"},
        {"32", "bSUBSAMPLE_TIMED_OUT", "26h.2: subsample trigger timeout expired: fire UPTRG ourselves"},
        {"33", "bSR23_RELATCH_PENDING", "26h.3: re-latch SR2/SR3 on next trigger (delay changed)"},
        {"34", "bNO_TRIGGER_WAIT", "26h.4: command param bit0: start without waiting for a trigger"},
        {"35", "bTRIG_DELAY_ZERO", "26h.5: software trigger delay (cmd 0x31) is 0"},
        {"36", "bEXT_TRIG_EDGE", "26h.6: external trigger edge/mode (cmds 0x07/0x2F/0x30 bit0)"},
        {"37", "bOCOMP_LONG_SETTLE", "26h.7: use the long delay loop for the OCOMP settle (cmd 0x2A bit0)"},
        {"38", "bTRIG_TOO_FAST_SENT", "27h.0: \"trigger too fast\" (04) already reported"},
        {"3A", "bT0_EXTRA_TICK", "27h.2: Timer0 phase flag (CALC_flags_3A_3B)"},
        {"3B", "bT0_EXTRA_TICK_PENDING", "27h.3: Timer0 phase flag, consumed by the Timer0 ISR"},
        {"3C", "bDELAY_RUNNING", "27h.4: DELAY counting: defer a trigger (cmd 0x00) until it expires"},
        {"3D", "bEXT_TRIG_ENABLED", "27h.5: external trigger enabled (cmds 0x06/0x07)"},
        {"3E", "bSUBSAMPLE_NO_TIMEOUT", "27h.6: subsample timeout disabled (cmd 0x3D with 0)"},
        {"3F", "bSWITCH_HOLD_STATE", "27h.7: HOLD (P2.6) state to use while switching to input"},
        {"40", "bSR4_6E_BIT1", "28h.0: copy of SR4 bit 6Eh.1"},
        {"41", "bTRIGGER_DEFERRED", "28h.1: trigger arrived during DELAY: fire when the Timer0 ISR expires"},
        {"68", "bSUBSAMPLE_STEP_ZERO", "2Dh.0: cmd 0x18 STEP is 0: do not advance DELAY"},
        {"69", "bSUBSAMPLE_B2_ZERO", "2Dh.1: cmd 0x18 B2 is 0: skip second burst phase"},
    };

    Set<String> ours = new HashSet<>();
    int labeled = 0, kept = 0, typed = 0;

    boolean label(Address a, String name, String cmt) throws Exception {
        SymbolTable st = currentProgram.getSymbolTable();
        Symbol p = st.getPrimarySymbol(a);
        if (p != null && p.getSource() == SourceType.USER_DEFINED && !ours.contains(p.getName()) && !p.getName().equals(name)) {
            println("kept your label " + p.getName() + " at " + a + " (list has " + name + ")"); kept++;
            return false;
        }
        if (p == null || !p.getName().equals(name)) {
            createLabel(a, name, true, SourceType.USER_DEFINED);
            labeled++;
        }
        if (cmt != null && !cmt.isEmpty()) currentProgram.getListing().setComment(a, CommentType.EOL, cmt);
        return true;
    }

    @Override
    public void run() throws Exception {
        for (String[] e : BYTES) ours.add(e[1]);
        for (String[] e : BITS) ours.add(e[1]);
        AddressSpace intmem = currentProgram.getAddressFactory().getAddressSpace("INTMEM");
        AddressSpace bits = currentProgram.getAddressFactory().getAddressSpace("BITS");
        if (intmem == null || bits == null) { printerr("INTMEM/BITS address spaces not found"); return; }
        Listing listing = currentProgram.getListing();

        for (String[] e : BYTES) {
            Address a = intmem.getAddress(Long.parseLong(e[0], 16));
            int len = Integer.parseInt(e[2]);
            if (!label(a, e[1], e[3])) continue;
            DataType dt = (len == 1) ? ByteDataType.dataType : new ArrayDataType(ByteDataType.dataType, len, 1);
            Data d = listing.getDataAt(a);
            if (d == null || !d.getDataType().isEquivalent(dt)) {
                try {
                    listing.clearCodeUnits(a, a.add(len - 1), false);
                    listing.createData(a, dt);
                    typed++;
                } catch (Exception ex) {
                    println("could not type " + e[1] + " at " + a + ": " + ex.getMessage());
                }
            }
        }
        for (String[] e : BITS) {
            Address a = bits.getAddress(Long.parseLong(e[0], 16));
            label(a, e[1], e[2]);
        }
        println(String.format("inguard RAM: %d labels set, %d data types applied, %d of your labels kept", labeled, typed, kept));
    }
}
