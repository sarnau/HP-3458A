// Set prototypes for the HP 3458A inguard 80C51 functions (all except the three RAM-pointer helpers, which
// HP3458A_InguardRamPtrProtos handles). Most helpers pass everything through RAM globals, SFRs and bits, so they get
// void f(void); this also removes Ghidra's wrong guesses (e.g. "undefined1 ISR(undefined1 param_1)") and the
// "Unknown calling convention" warning. Register-passing helpers get explicit storage:
//   A in: GA_WRITE_wait_ready, GA_WRITE_BYTE_strobe, GA_SHIFT_BYTE_wait_ready
//   R4/R5/R6 in: SUBSAMPLE_DELAY_ADD_STEP_10ns     B out: CALC_ROM_CHECKSUM
// RX_BYTE_bit0_to_C returns its result in the carry flag, which the 8051 language only models as PSW bit 7,
// so it stays void with a comment. Functions whose signature you set yourself are skipped. Safe to run more than once.
//@category HP3458A
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.*;
import ghidra.program.model.data.*;
import ghidra.program.model.lang.Register;
import ghidra.program.model.listing.*;
import ghidra.program.model.listing.Function.FunctionUpdateType;
import ghidra.program.model.symbol.SourceType;
import java.util.*;

public class HP3458A_InguardProtos extends GhidraScript {
    // address, expected name, return type, return register ("" = default/void), params "name:type:reg|...", plate comment
    static final String[][] PROTOS = {
        {"0000", "RESET", "void", "", "", ""},
        {"0003", "VEC_INT0", "void", "", "", ""},
        {"0005", "rx_low_byte_bit0_to_C", "void", "", "", "Read the parameter byte; bit 0 -> bNO_TRIGGER_WAIT (26h.4)."},
        {"000B", "VEC_TIMER0", "void", "", "", ""},
        {"000E", "CMD04_TARM_SGL_ARM", "void", "", "", ""},
        {"0013", "VEC_INT1", "void", "", "", ""},
        {"0016", "CMD0D_SET_SEND", "void", "", "", ""},
        {"001B", "VEC_TIMER1_NRDGS_done_pulse_XCOT1", "void", "", "", ""},
        {"0020", "MAIN_init", "void", "", "", ""},
        {"003C", "HW_INIT", "void", "", "", ""},
        {"0087", "ISR_INT0_gatearray", "void", "", "", ""},
        {"00C0", "CMD_DISPATCH", "void", "", "", ""},
        {"0159", "j_CMD16_OCOMP_SEQUENCE", "void", "", "", ""},
        {"015C", "j_CMD18_SUBSAMPLE_BURSTS", "void", "", "", ""},
        {"015F", "j_CMD19_LFREQ_MEASURE", "void", "", "", ""},
        {"0162", "j_CMD1A_AC_SEQUENCE", "void", "", "", ""},
        {"0165", "j_CMD1B_ACCAL_PAIR_BURST", "void", "", "", ""},
        {"0168", "j_CMD1C_OCOMP_ZERO_PAIR", "void", "", "", ""},
        {"016B", "j_CMD14_ZERO_READING", "void", "", "", ""},
        {"016E", "CMD00_TRIGGER", "void", "", "", ""},
        {"017B", "CMD01_PULSE_XETRG", "void", "", "", ""},
        {"0181", "CMD02_READ_GA_STATUS", "void", "", "", ""},
        {"0191", "CMD05_EXTOUT_PULSE", "void", "", "", ""},
        {"0197", "CMD03_SET_SEQ_EXTOUT_CFG", "void", "", "", ""},
        {"01A5", "CMD07_EXT_TRIG_ENABLE", "void", "", "", ""},
        {"01BA", "CMD06_EXT_TRIG_DISABLE", "void", "", "", ""},
        {"01C5", "CMD08_ADC_SELFTEST", "void", "", "", ""},
        {"0233", "CMD0A_AMP_TO_INPUT", "void", "", "", ""},
        {"023D", "CMD0B_AMP_TO_ZERO", "void", "", "", ""},
        {"0247", "CMD0C_AMP_PRECHARGE", "void", "", "", ""},
        {"0251", "CMD0E_QUERY_TRIG_SEEN", "void", "", "", ""},
        {"0265", "CMD0F_RELOAD_DELAY", "void", "", "", ""},
        {"0276", "CMD10_MEAS_INIT_ABORT", "void", "", "", ""},
        {"02B8", "CMD13_IDLE", "void", "", "", ""},
        {"02BD", "CMD11_TIMED_HI_PRECHARGE", "void", "", "", ""},
        {"02D6", "CMD12_TIMED_PRECHARGED_CONNECT", "void", "", "", ""},
        {"02F1", "CMD17_GA_REGD_STROBE", "void", "", "", ""},
        {"02FC", "CMD1D_CTL_BIT2_ON", "void", "", "", ""},
        {"0305", "CMD1E_CTL_BIT2_OFF", "void", "", "", ""},
        {"030E", "CMD3B_CTL_BIT1_ON", "void", "", "", ""},
        {"0317", "CMD3C_CTL_BIT1_OFF", "void", "", "", ""},
        {"0320", "CMD1F_LOAD_SR1_DCBD", "void", "", "", ""},
        {"033B", "CMD20_LOAD_SR0_ACBD", "void", "", "", ""},
        {"0353", "CMD22_LOAD_SR6_ADCAL", "void", "", "", ""},
        {"0367", "CMD21_LOAD_SR5_ADMEM", "void", "", "", ""},
        {"037E", "CMD23_LOAD_TIMER", "void", "", "", ""},
        {"03BE", "CMD24_LOAD_DELAY", "void", "", "", ""},
        {"03F8", "CMD25_LOAD_NRDGS", "void", "", "", ""},
        {"0440", "CMD26_EXTOUT_DEFERRED", "void", "", "", ""},
        {"0445", "CMD27_DC_RELAY_RELEASE", "void", "", "", ""},
        {"0458", "CMD28_DC_RELAY_PROTECT_SEQ", "void", "", "", ""},
        {"04B2", "CMD29_AMP_ALL_OPEN", "void", "", "", ""},
        {"04BA", "CMD2A_SET_OCOMP_SETTLE", "void", "", "", ""},
        {"04CD", "CMD2B_SET_SWITCH_SETTLE", "void", "", "", ""},
        {"04F9", "CMD2C_READ_GA_REGC", "void", "", "", ""},
        {"0514", "CMD2D_READ_GA_REGD", "void", "", "", ""},
        {"051D", "CMD09_STOP_SEQUENCE", "void", "", "", ""},
        {"0521", "CMD2E_NEXT_READING", "void", "", "", ""},
        {"0525", "CMD2F_SET_TARM_EVENT", "void", "", "", ""},
        {"0549", "CMD30_SET_TRIG_EVENT", "void", "", "", ""},
        {"058A", "CMD31_SET_TRIG_DELAY_LOOP", "void", "", "", ""},
        {"05BB", "CMD32_SELF_TEST", "void", "", "", ""},
        {"05E9", "CMD33_DELAY_SHORT", "void", "", "", ""},
        {"05F5", "CMD34_DELAY_MS", "void", "", "", ""},
        {"0601", "CMD35_DELAY_LONG", "void", "", "", ""},
        {"0612", "CMD36_AMP_HI_AND_ZERO", "void", "", "", ""},
        {"061A", "CMD37_READ_LEVEL", "void", "", "", ""},
        {"0627", "CMD38_RELAY_SETTLE", "void", "", "", ""},
        {"063B", "CMD39_REV_QUERY", "void", "", "", ""},
        {"0645", "CMD3A_SR1_SET_BITS", "void", "", "", ""},
        {"0650", "CMD3D_SET_SUBSAMPLE_TIMEOUT", "void", "", "", ""},
        {"0667", "CMD_EXIT_popPSW_ACC_ret", "void", "", "", ""},
        {"066C", "ISR_exit_report_terminal", "void", "", "", ""},
        {"066F", "SEND_TERMINAL_STATUS_08_09", "void", "", "", ""},
        {"0680", "TRIGGER_EVENT_start_delay_counter", "void", "", "", ""},
        {"06D9", "ISR_TIMER0_DELAY_TIMER_expired", "void", "", "", ""},
        {"0710", "ISR_INT1_OVERLOAD_PROTECT", "void", "", "", ""},
        {"0776", "CMD15_MAIN_SEQUENCE", "void", "", "", ""},
        {"077F", "CMD1A_AC_SEQUENCE_body", "void", "", "", ""},
        {"07FA", "CMD15_AZERO_PAIR_SEQUENCE", "void", "", "", ""},
        {"0860", "ADC_HANDSHAKE_reading", "void", "", "", ""},
        {"0889", "CMD14_ZERO_READING_body", "void", "", "", ""},
        {"08DA", "CMD19_LFREQ_MEASURE_body", "void", "", "", ""},
        {"09A6", "CMD18_SUBSAMPLE_BURSTS_body", "void", "", "", ""},
        {"0A96", "SUBSAMPLE_DELAY_ADD_STEP_10ns", "void", "", "step_lo:byte:R4|step_hi:byte:R5|step_tenths:byte:R6", "Add the cmd 0x18 step to the DELAY: R6 = 10 ns digit (BCD), R5:R4 = 100 ns field (R4 low nibble cleared).\nUpdates SR2 (7Bh:7Ch), the SR3 tenths digit and the DELAY tick count 78h-7Ah."},
        {"0AE5", "SUBSAMPLE_TRIGGER_TIMEOUT", "void", "", "", ""},
        {"0AFE", "CMD16_OCOMP_SEQUENCE_body", "void", "", "", ""},
        {"0B84", "set_P2_5", "void", "", "", ""},
        {"0B8C", "WAIT_ADC_ready", "void", "", "", ""},
        {"0BA1", "SR1_update_if_47_changed", "void", "", "", ""},
        {"0BB0", "CMD1C_OCOMP_ZERO_PAIR_body", "void", "", "", ""},
        {"0BF6", "CMD1B_ACCAL_PAIR_BURST_body", "void", "", "", ""},
        {"0C39", "GA_WRITE_wait_ready", "void", "", "msg:byte:ACC", "Wait for BFSTAT (P0.6), then write A to the gate-array register selected in P0 (0xE8 = TX command message, 0xE7 = TX data word)."},
        {"0C3C", "GA_WRITE_BYTE_strobe", "void", "", "value:byte:ACC", "Shift A out to the gate array and strobe IGSTB (P2.3); interrupts off during the transfer."},
        {"0C4E", "GA_SHIFT_BYTE_wait_ready", "void", "", "value:byte:ACC", "Wait for BFSTAT, then shift A out without a strobe (first byte of a 16-bit TX data word)."},
        {"0C59", "RX_WORD_first_byte_wait", "void", "", "", ""},
        {"0C5C", "GA_STROBE_then_read", "void", "", "", ""},
        {"0C62", "GA_READ_BYTE", "void", "", "", ""},
        {"0CAB", "SMALL_DELAY", "void", "", "", ""},
        {"0CB9", "DELAY_RAM_33", "void", "", "", ""},
        {"0CC3", "DELAY_120", "void", "", "", ""},
        {"0CC6", "DELAY_40", "void", "", "", ""},
        {"0CD1", "DELAY_RAM_32_33", "void", "", "", ""},
        {"0CE8", "TOGGLE_INPUT_ZERO", "void", "", "", ""},
        {"0CEB", "SWITCH_TO_ZERO", "void", "", "", ""},
        {"0D0B", "SWITCH_TO_INPUT_PRECHARGED", "void", "", "", ""},
        {"0D39", "GA_RESET_regC_pulse_WR", "void", "", "", ""},
        {"0D4C", "SR4_LATCH_6D_72", "void", "", "", ""},
        {"0D69", "SR5_LATCH_59_64", "void", "", "", ""},
        {"0D82", "SR1_DCBD_LATCH_45_4E", "void", "", "", ""},
        {"0D98", "SR2_LATCH_7B_7C", "void", "", "", ""},
        {"0DAE", "SR3_LATCH_76_77", "void", "", "", ""},
        {"0DC4", "CHK_DELAYCOUNT_zero", "void", "", "", ""},
        {"0DD1", "RX_BYTE_bit0_to_C", "void", "", "", "Read the low byte of the current UART word; returns its bit 0 in the carry flag (A = byte >> 1)."},
        {"0DD8", "CHK_T1COUNT_zero", "void", "", "", ""},
        {"0DE3", "LOAD_T0_first_or_interval", "void", "", "", ""},
        {"0E0C", "CALC_flags_3A_3B", "void", "", "", ""},
        {"0E21", "LOAD_T1_count", "void", "", "", ""},
        {"0E2C", "PULSE_P1_7", "void", "", "", ""},
        {"0E37", "LEAVE_ISR_CONTINUE_FOREGROUND", "void", "", "", ""},
        {"0E46", "RETI_only", "void", "", "", ""},
        {"0E47", "START_COUNTERS", "void", "", "", ""},
        {"0E6C", "set_27h4", "void", "", "", ""},
        {"0E75", "WAIT_ARM_AND_TRIGGER", "void", "", "", ""},
        {"0EF6", "WAIT_EXT_EVENT_poll_GA", "void", "", "", ""},
        {"0F3C", "set_ctl_bit5", "void", "", "", ""},
        {"0F44", "WAIT_SW_ARM_25h5", "void", "", "", ""},
        {"0F4A", "EXTOUT_pulse", "void", "", "", ""},
        {"0F5D", "RELOAD_TRIG_COUNT", "void", "", "", ""},
        {"0F67", "DELAY_settle_41_42", "void", "", "", ""},
        {"0F8C", "GA_WRITE_CTRL_reg09_from_22h", "void", "", "", ""},
        {"0F9E", "SELFTEST_UART_ECHO", "void", "", "", ""},
        {"0FDA", "CALC_ROM_CHECKSUM", "byte", "B", "", "Sum ROM 0x0000-0x0FFB; returns B = 0 if the sum is 0xFF (checksum ok), 1 otherwise."},
    };

    DataType type(String t) {
        switch (t) {
            case "byte": return ByteDataType.dataType;
            case "void": return VoidDataType.dataType;
            default: throw new IllegalArgumentException(t);
        }
    }

    @Override
    public void run() throws Exception {
        AddressSpace code = currentProgram.getAddressFactory().getAddressSpace("CODE");
        String cc = currentProgram.getCompilerSpec().getDefaultCallingConvention().getName();
        int done = 0, skipped = 0, missing = 0;
        for (String[] p : PROTOS) {
            Function f = getFunctionAt(code.getAddress(Long.parseLong(p[0], 16)));
            if (f == null) { println("no function at " + p[0] + " (" + p[1] + ")"); missing++; continue; }
            if (f.getSignatureSource() == SourceType.USER_DEFINED && !p[1].equals(f.getName())) {
                println("skipped " + f.getName() + " (signature set by you)"); skipped++; continue;
            }
            boolean custom = !p[3].isEmpty() || p[4].contains(":R") ;
            List<Parameter> params = new ArrayList<>();
            if (!p[4].isEmpty()) {
                for (String s : p[4].split("\\|")) {
                    String[] q = s.split(":");
                    Register r = currentProgram.getRegister(q[2]);
                    params.add(new ParameterImpl(q[0], type(q[1]), r, currentProgram, SourceType.USER_DEFINED));
                }
            }
            ReturnParameterImpl ret = p[3].isEmpty()
                ? new ReturnParameterImpl(type(p[2]), currentProgram)
                : new ReturnParameterImpl(type(p[2]), new VariableStorage(currentProgram, currentProgram.getRegister(p[3])), currentProgram);
            f.setCustomVariableStorage(custom);
            f.updateFunction(cc, ret, params,
                custom ? FunctionUpdateType.CUSTOM_STORAGE : FunctionUpdateType.DYNAMIC_STORAGE_ALL_PARAMS,
                true, SourceType.USER_DEFINED);
            if (!p[5].isEmpty()) setPlateComment(f.getEntryPoint(), p[5]);
            done++;
        }
        println(String.format("inguard prototypes: %d set, %d skipped (yours), %d not found", done, skipped, missing));
    }
}
