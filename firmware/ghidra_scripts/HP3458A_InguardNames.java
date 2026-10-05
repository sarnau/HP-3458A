// Create, name and comment the HP 3458A inguard 80C51 (A3U220, 03458-85501) functions.
// Source: firmware/inguard_80c51_analysis.md. Ghidra does not follow the JMP @A+DPTR command dispatch at 0x00C0,
// so the 62 command handlers (jump table at 0x00DD), their LJMP stubs and the long sequence bodies are created here.
// Names you set yourself are kept (only default FUN_/LAB_ names or names from this list are replaced).
//@category HP3458A
import ghidra.app.script.GhidraScript;
import ghidra.app.cmd.disassemble.DisassembleCommand;
import ghidra.program.model.address.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;
import java.util.*;

public class HP3458A_InguardNames extends GhidraScript {
    static final String[][] ENTRIES = {
        {"0000", "RESET", ""},
        {"0003", "VEC_INT0", ""},
        {"0005", "rx_low_byte_bit0_to_C", ""},
        {"000B", "VEC_TIMER0", ""},
        {"000E", "CMD04_TARM_SGL_ARM", "outguard opcode 0x04: TARM SGL software arm (25h.5)"},
        {"0013", "VEC_INT1", ""},
        {"0016", "CMD0D_SET_SEND", "outguard opcode 0x0D: SETB P2.5"},
        {"001B", "VEC_TIMER1_NRDGS_done_pulse_XCOT1", ""},
        {"0020", "MAIN_init", ""},
        {"003C", "HW_INIT", ""},
        {"0087", "ISR_INT0_gatearray", ""},
        {"00C0", "CMD_DISPATCH", ""},
        {"0159", "j_CMD16_OCOMP_SEQUENCE", "outguard opcode 0x16: OCOMP ohms sequence (reading pairs, source off/on)"},
        {"015C", "j_CMD18_SUBSAMPLE_BURSTS", "outguard opcode 0x18: subsample bursts: B1, B2, step dt (10ns units, BCD digit) added to DELAY per burst"},
        {"015F", "j_CMD19_LFREQ_MEASURE", "outguard opcode 0x19: line-frequency measure: send GA reg9, T0, GA reg8, T1"},
        {"0162", "j_CMD1A_AC_SEQUENCE", "outguard opcode 0x1A: AC analog sequence (input switch B)"},
        {"0165", "j_CMD1B_ACCAL_PAIR_BURST", "outguard opcode 0x1B: AC-cal paired-reading burst (sum A-B)"},
        {"0168", "j_CMD1C_OCOMP_ZERO_PAIR", "outguard opcode 0x1C: one-shot OCOMP zero pair"},
        {"016B", "j_CMD14_ZERO_READING", "outguard opcode 0x14: one-shot zero reading (AZERO off) -> ADCAL"},
        {"016E", "CMD00_TRIGGER", "outguard opcode 0x00: TRIGGER (pulse P1.3 or defer)"},
        {"017B", "CMD01_PULSE_XETRG", "outguard opcode 0x01: pulse P2.7"},
        {"0181", "CMD02_READ_GA_STATUS", "outguard opcode 0x02: pass-through byte -> outguard data"},
        {"0191", "CMD05_EXTOUT_PULSE", "outguard opcode 0x05: EXTOUT pulse P2.4"},
        {"0197", "CMD03_SET_SEQ_EXTOUT_CFG", "outguard opcode 0x03: sequence/EXTOUT/OCOMP config (24h[5:0])"},
        {"01A5", "CMD07_EXT_TRIG_ENABLE", "outguard opcode 0x07: ext-trigger disable"},
        {"01BA", "CMD06_EXT_TRIG_DISABLE", "outguard opcode 0x06: ext-trigger enable cfg"},
        {"01C5", "CMD08_ADC_SELFTEST", "outguard opcode 0x08: ADC self-test conversion (ISOLATOR_0004e448)"},
        {"0233", "CMD0A_AMP_TO_INPUT", "outguard opcode 0x0A: amp -> input HI (XHC=0 HZ=0 PC=0)"},
        {"023D", "CMD0B_AMP_TO_ZERO", "outguard opcode 0x0B: amp -> zero (XHC=1 HZ=1)"},
        {"0247", "CMD0C_AMP_PRECHARGE", "outguard opcode 0x0C: precharge only (PC=1)"},
        {"0251", "CMD0E_QUERY_TRIG_SEEN", "outguard opcode 0x0E: query flag 25h.4 -> data"},
        {"0265", "CMD0F_RELOAD_DELAY", "outguard opcode 0x0F: load SR2 + delay count (no restart)"},
        {"0276", "CMD10_MEAS_INIT_ABORT", "outguard opcode 0x10: INIT/ABORT measurement, reply 02"},
        {"02B8", "CMD13_IDLE", "outguard opcode 0x13: idle (leave ISR)"},
        {"02BD", "CMD11_TIMED_HI_PRECHARGE", "outguard opcode 0x11: timed HI/precharge seq 1 + XETRG"},
        {"02D6", "CMD12_TIMED_PRECHARGED_CONNECT", "outguard opcode 0x12: timed precharged connect + XETRG"},
        {"02F1", "CMD17_GA_REGD_STROBE", "outguard opcode 0x17: GA reg 0D strobe"},
        {"02FC", "CMD1D_CTL_BIT2_ON", "outguard opcode 0x1D: ctl bit2 on"},
        {"0305", "CMD1E_CTL_BIT2_OFF", "outguard opcode 0x1E: ctl bit2 off"},
        {"030E", "CMD3B_CTL_BIT1_ON", "outguard opcode 0x3B: ctl bit1 on"},
        {"0317", "CMD3C_CTL_BIT1_OFF", "outguard opcode 0x3C: ctl bit1 off"},
        {"0320", "CMD1F_LOAD_SR1_DCBD", "outguard opcode 0x1F: load SR1 (DC board, 80b)"},
        {"033B", "CMD20_LOAD_SR0_ACBD", "outguard opcode 0x20: load SR0 (AC board, 80b)"},
        {"0353", "CMD22_LOAD_SR6_ADCAL", "outguard opcode 0x22: load SR6 (ADCAL, 48b)"},
        {"0367", "CMD21_LOAD_SR5_ADMEM", "outguard opcode 0x21: load SR5 (ADMEM, 96b)"},
        {"037E", "CMD23_LOAD_TIMER", "outguard opcode 0x23: TIMER: SR3 first period + -ticks(409.6us) -> 73-75"},
        {"03BE", "CMD24_LOAD_DELAY", "outguard opcode 0x24: DELAY: SR2 first period + -ticks(409.6us) -> 78-7A"},
        {"03F8", "CMD25_LOAD_NRDGS", "outguard opcode 0x25: NRDGS: SR4 (GA 8-bit rdg counter) + T1 = -(N>>8)"},
        {"0440", "CMD26_EXTOUT_DEFERRED", "outguard opcode 0x26: EXTOUT pulse (deferred)"},
        {"0445", "CMD27_DC_RELAY_RELEASE", "outguard opcode 0x27: DC relay drive release"},
        {"0458", "CMD28_DC_RELAY_PROTECT_SEQ", "outguard opcode 0x28: DC relay protect sequence"},
        {"04B2", "CMD29_AMP_ALL_OPEN", "outguard opcode 0x29: all input switches open"},
        {"04BA", "CMD2A_SET_OCOMP_SETTLE", "outguard opcode 0x2A: set settle flag + time 41/42"},
        {"04CD", "CMD2B_SET_SWITCH_SETTLE", "outguard opcode 0x2B: set switch settle time 3E/3F"},
        {"04F9", "CMD2C_READ_GA_REGC", "outguard opcode 0x2C: read GA reg 1C x10 -> outguard"},
        {"0514", "CMD2D_READ_GA_REGD", "outguard opcode 0x2D: read GA reg 1D x10 -> outguard"},
        {"051D", "CMD09_STOP_SEQUENCE", "outguard opcode 0x09: STOP sequence (25h.7)"},
        {"0521", "CMD2E_NEXT_READING", "outguard opcode 0x2E: NEXT reading (25h.6)"},
        {"0525", "CMD2F_SET_TARM_EVENT", "outguard opcode 0x2F: TARM event"},
        {"0549", "CMD30_SET_TRIG_EVENT", "outguard opcode 0x30: TRIG event + count"},
        {"058A", "CMD31_SET_TRIG_DELAY_LOOP", "outguard opcode 0x31: trigger DELAY (32-bit)"},
        {"05BB", "CMD32_SELF_TEST", "outguard opcode 0x32: SELF TEST"},
        {"05E9", "CMD33_DELAY_SHORT", "outguard opcode 0x33: delay short"},
        {"05F5", "CMD34_DELAY_MS", "outguard opcode 0x34: delay ms"},
        {"0601", "CMD35_DELAY_LONG", "outguard opcode 0x35: delay long"},
        {"0612", "CMD36_AMP_HI_AND_ZERO", "outguard opcode 0x36: HI + zero connected"},
        {"061A", "CMD37_READ_LEVEL", "outguard opcode 0x37: read P1.0 -> outguard"},
        {"0627", "CMD38_RELAY_SETTLE", "outguard opcode 0x38: relay settle pulse SR1"},
        {"063B", "CMD39_REV_QUERY", "outguard opcode 0x39: REV? -> 02"},
        {"0645", "CMD3A_SR1_SET_BITS", "outguard opcode 0x3A: SR1 bits 4Dh set"},
        {"0650", "CMD3D_SET_SUBSAMPLE_TIMEOUT", "outguard opcode 0x3D: set aux count 2B/2C"},
        {"0667", "CMD_EXIT_popPSW_ACC_ret", ""},
        {"066C", "ISR_exit_report_terminal", ""},
        {"066F", "SEND_TERMINAL_STATUS_08_09", ""},
        {"0680", "TRIGGER_EVENT_start_delay_counter", ""},
        {"06D9", "ISR_TIMER0_DELAY_TIMER_expired", ""},
        {"0710", "ISR_INT1_OVERLOAD_PROTECT", ""},
        {"0776", "CMD15_MAIN_SEQUENCE", "outguard opcode 0x15: main reading sequence (DCV/DCI/DS/OHM)"},
        {"077F", "CMD1A_AC_SEQUENCE_body", ""},
        {"0860", "ADC_HANDSHAKE_reading", ""},
        {"0889", "CMD14_ZERO_READING_body", ""},
        {"08DA", "CMD19_LFREQ_MEASURE_body", ""},
        {"09A6", "CMD18_SUBSAMPLE_BURSTS_body", ""},
        {"0A96", "SUBSAMPLE_DELAY_ADD_STEP_10ns", ""},
        {"0AE5", "SUBSAMPLE_TRIGGER_TIMEOUT", ""},
        {"0AFE", "CMD16_OCOMP_SEQUENCE_body", ""},
        {"0B84", "set_P2_5", ""},
        {"0B8C", "WAIT_ADC_ready", ""},
        {"0BA1", "SR1_update_if_47_changed", ""},
        {"0BB0", "CMD1C_OCOMP_ZERO_PAIR_body", ""},
        {"0BF6", "CMD1B_ACCAL_PAIR_BURST_body", ""},
        {"0C39", "GA_WRITE_wait_ready", ""},
        {"0C3C", "GA_WRITE_BYTE_strobe", ""},
        {"0C4E", "GA_SHIFT_BYTE_wait_ready", ""},
        {"0C59", "RX_WORD_first_byte_wait", ""},
        {"0C5C", "GA_STROBE_then_read", ""},
        {"0C62", "GA_READ_BYTE", ""},
        {"0C6E", "RX_WORDS_DIRECT_to_RAM", ""},
        {"0C9F", "SHIFT_OUT_RAM_block", ""},
        {"0CAB", "SMALL_DELAY", ""},
        {"0CB9", "DELAY_RAM_33", ""},
        {"0CC3", "DELAY_120", ""},
        {"0CC6", "DELAY_40", ""},
        {"0CD1", "DELAY_RAM_32_33", ""},
        {"0CE8", "TOGGLE_INPUT_ZERO", ""},
        {"0CEB", "SWITCH_TO_ZERO", ""},
        {"0D0B", "SWITCH_TO_INPUT_PRECHARGED", ""},
        {"0D39", "GA_RESET_regC_pulse_WR", ""},
        {"0D4C", "SR4_LATCH_6D_72", ""},
        {"0D69", "SR5_LATCH_59_64", ""},
        {"0D82", "SR1_DCBD_LATCH_45_4E", ""},
        {"0D98", "SR2_LATCH_7B_7C", ""},
        {"0DAE", "SR3_LATCH_76_77", ""},
        {"0DC4", "CHK_DELAYCOUNT_zero", ""},
        {"0DD1", "RX_BYTE_bit0_to_C", ""},
        {"0DD8", "CHK_T1COUNT_zero", ""},
        {"0DE3", "LOAD_T0_first_or_interval", ""},
        {"0E0C", "CALC_flags_3A_3B", ""},
        {"0E21", "LOAD_T1_count", ""},
        {"0E2C", "PULSE_P1_7", ""},
        {"0E37", "LEAVE_ISR_CONTINUE_FOREGROUND", ""},
        {"0E46", "RETI_only", ""},
        {"0E47", "START_COUNTERS", ""},
        {"0E6C", "set_27h4", ""},
        {"0E75", "WAIT_ARM_AND_TRIGGER", ""},
        {"0EF6", "WAIT_EXT_EVENT_poll_GA", ""},
        {"0F3C", "set_ctl_bit5", ""},
        {"0F44", "WAIT_SW_ARM_25h5", ""},
        {"0F4A", "EXTOUT_pulse", ""},
        {"0F5D", "RELOAD_TRIG_COUNT", ""},
        {"0F67", "DELAY_settle_41_42", ""},
        {"0F7F", "PREP_DJNZ_COUNTER", ""},
        {"0F8C", "GA_WRITE_CTRL_reg09_from_22h", ""},
        {"0F9E", "SELFTEST_UART_ECHO", ""},
        {"0FDA", "CALC_ROM_CHECKSUM", ""},
    };

    Address code(long off) {
        AddressSpace sp = currentProgram.getAddressFactory().getAddressSpace("CODE");
        if (sp == null) sp = currentProgram.getAddressFactory().getDefaultAddressSpace();
        return sp.getAddress(off);
    }

    @Override
    public void run() throws Exception {
        Set<String> ours = new HashSet<>();
        for (String[] e : ENTRIES) ours.add(e[1]);
        Listing listing = currentProgram.getListing();
        SymbolTable st = currentProgram.getSymbolTable();
        int created = 0, renamed = 0, kept = 0, failed = 0;

        // shared epilogues first, so the handlers' AJMPs to them become tail calls instead of merged bodies
        for (long off : new long[] {0x0667, 0x066C}) {
            Address a = code(off);
            if (getFunctionAt(a) == null) { disassemble(a); createFunction(a, null); }
        }

        for (String[] e : ENTRIES) {
            Address a = code(Long.parseLong(e[0], 16));
            Function f = getFunctionAt(a);
            if (f == null) {
                if (listing.getInstructionAt(a) == null) new DisassembleCommand(a, null, true).applyTo(currentProgram, monitor);
                Function inside = getFunctionContaining(a);
                if (inside != null && !inside.getEntryPoint().equals(a)) {
                    // split a function that swallowed this entry point
                    AddressSetView body = inside.getBody();
                    AddressSet keep = new AddressSet(body.getMinAddress(), a.previous());
                    keep = keep.intersect(body);
                    inside.setBody(keep);
                }
                f = createFunction(a, null);
                if (f == null) { println("could not create function at " + a + " for " + e[1]); failed++; }
                else created++;
            }
            String cur = (f != null) ? f.getName() : null;
            Symbol sym = (f != null) ? f.getSymbol() : st.getPrimarySymbol(a);
            boolean defaultName = cur == null || cur.startsWith("FUN_") || cur.startsWith("LAB_") || ours.contains(cur)
                || sym == null || sym.getSource() == SourceType.DEFAULT || sym.getSource() == SourceType.ANALYSIS;
            if (!e[1].equals(cur)) {
                if (defaultName) {
                    if (f != null) f.setName(e[1], SourceType.USER_DEFINED);
                    else createLabel(a, e[1], true, SourceType.USER_DEFINED);
                    renamed++;
                } else { println("kept your name " + cur + " at " + a + " (list has " + e[1] + ")"); kept++; }
            }
            if (!e[2].isEmpty()) setPlateComment(a, e[2]);
        }

        // jump table: 62 AJMP entries, opcode n at 0x00DD + 2n
        Address jt = code(0x00DD);
        createLabel(jt, "CMD_JUMP_TABLE", true, SourceType.USER_DEFINED);
        for (int n = 0; n < 62; n++) {
            Address a = code(0x00DD + 2 * n);
            if (listing.getInstructionAt(a) == null) new DisassembleCommand(a, new AddressSet(a, a.add(1)), false).applyTo(currentProgram, monitor);
            setEOLComment(a, String.format("opcode 0x%02X", n));
        }
        println(String.format("inguard names: %d functions created, %d renamed, %d of your names kept, %d failed", created, renamed, kept, failed));
    }
}
