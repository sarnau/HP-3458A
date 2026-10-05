// Give the inguard 80C51 RAM-block helpers pointer prototypes, so call sites show the RAM variable instead of a number.
//
// The helpers take an internal-RAM address in R0 and the count in gXFER_COUNT (RAM 30h). The default __stdcall puts the
// first parameter in ACC, and a plain pointer would point into CODE (the default space), so each helper gets custom
// storage with a 1-byte INTMEM pointer (typedef iram_ptr) in R0. Safe to run more than once.
//@category HP3458A
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.*;
import ghidra.program.model.data.*;
import ghidra.program.model.lang.Register;
import ghidra.program.model.listing.*;
import ghidra.program.model.listing.Function.FunctionUpdateType;
import ghidra.program.model.symbol.SourceType;

public class HP3458A_InguardRamPtrProtos extends GhidraScript {
    // address, function name, parameter name, plate comment
    static final String[][] HELPERS = {
        {"0C6E", "RX_WORDS_DIRECT_to_RAM", "dst_last",
         "Receive gXFER_COUNT 16-bit UART words in direct mode (they also go into the selected shift register)\n" +
         "and store the 2*gXFER_COUNT bytes downwards from dst_last (R0)."},
        {"0C9F", "SHIFT_OUT_RAM_block", "src_last",
         "Shift gXFER_COUNT bytes out to the selected gate-array shift register, reading downwards from src_last (R0)."},
        {"0F7F", "PREP_DJNZ_COUNTER", "counter",
         "Prepare a gXFER_COUNT-byte counter at counter (R0, upwards) for nested DJNZ loops:\n" +
         "every byte after a non-zero byte is incremented, and the last byte is incremented if it is 0."},
    };

    @Override
    public void run() throws Exception {
        AddressSpace intmem = currentProgram.getAddressFactory().getAddressSpace("INTMEM");
        AddressSpace code = currentProgram.getAddressFactory().getAddressSpace("CODE");
        if (intmem == null || code == null) { printerr("INTMEM/CODE address space not found"); return; }
        Register r0 = currentProgram.getRegister("R0");
        if (r0 == null) { printerr("no R0 register"); return; }

        DataTypeManager dtm = currentProgram.getDataTypeManager();
        DataType iptr = dtm.addDataType(new PointerTypedef("iram_ptr", ByteDataType.dataType, 1, dtm, intmem),
            DataTypeConflictHandler.REPLACE_HANDLER);

        // use the compiler spec's default convention (__stdcall) instead of the functions' "unknown"
        String cc = currentProgram.getCompilerSpec().getDefaultCallingConvention().getName();

        int done = 0;
        for (String[] h : HELPERS) {
            Function f = getFunctionAt(code.getAddress(Long.parseLong(h[0], 16)));
            if (f == null) { printerr("no function at " + h[0] + " (" + h[1] + ")"); continue; }
            Parameter p = new ParameterImpl(h[2], iptr, r0, currentProgram, SourceType.USER_DEFINED);
            ReturnParameterImpl ret = new ReturnParameterImpl(VoidDataType.dataType, currentProgram);
            f.setCustomVariableStorage(true);
            f.updateFunction(cc, ret, FunctionUpdateType.CUSTOM_STORAGE, true,
                SourceType.USER_DEFINED, p);
            setPlateComment(f.getEntryPoint(), h[3]);
            println(f.getName() + " -> " + f.getSignature().getPrototypeString() + " @ R0");
            done++;
        }
        println(String.format("inguard RAM helpers: %d prototypes set (iram_ptr = 1-byte INTMEM pointer)", done));
    }
}
