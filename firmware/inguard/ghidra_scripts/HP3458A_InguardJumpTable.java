// Make Ghidra recover the inguard 80C51 command dispatch (CMD_DISPATCH @ 0x00C0) as a switch.
//
// The dispatcher ends in  RL A ; JMP @A+DPTR  at 0x00DC. DPTR is loaded with 0x00DD once in HW_INIT and never changes
// during normal operation, and the jump lands *in* the table: each 2-byte slot at 0x00DD + 2*n is an AJMP to the handler
// for opcode n (n = 0x00..0x3D, bounded by the CJNE A,#3Eh / JNC check). Ghidra cannot see either fact, so this script
//   1. pins DPTR = 0x00DD over CMD_DISPATCH (removes the bogus param_1),
//   2. writes a jump-table override for the JMP @A+DPTR with the 62 slot addresses and adds COMPUTED_JUMP references,
//   3. disassembles the slots and re-derives the function body, so each slot's AJMP becomes a tail call to its handler.
// Same approach as Ghidra's SwitchOverride.java. Safe to run more than once.
//@category HP3458A
import ghidra.app.script.GhidraScript;
import ghidra.app.cmd.disassemble.DisassembleCommand;
import ghidra.app.cmd.function.CreateFunctionCmd;
import ghidra.program.model.address.*;
import ghidra.program.model.lang.Register;
import ghidra.program.model.listing.*;
import ghidra.program.model.pcode.JumpTable;
import ghidra.program.model.symbol.*;
import java.math.BigInteger;
import java.util.*;

public class HP3458A_InguardJumpTable extends GhidraScript {
    static final long DISPATCH = 0x00C0;
    static final long JMP_AT_A_DPTR = 0x00DC;
    static final long TABLE = 0x00DD;
    static final int ENTRIES = 0x3E;   // opcodes 0x00..0x3D

    Address code(long off) {
        AddressSpace sp = currentProgram.getAddressFactory().getAddressSpace("CODE");
        if (sp == null) sp = currentProgram.getAddressFactory().getDefaultAddressSpace();
        return sp.getAddress(off);
    }

    @Override
    public void run() throws Exception {
        Listing listing = currentProgram.getListing();
        Address jmp = code(JMP_AT_A_DPTR);
        Function f = getFunctionAt(code(DISPATCH));
        if (f == null) { printerr("no function at 0x00C0 (run HP3458A_InguardNames first)"); return; }

        // 1. DPTR is constant 0x00DD inside the dispatcher
        Register dptr = currentProgram.getRegister("DPTR");
        if (dptr != null) {
            currentProgram.getProgramContext().setValue(dptr, code(DISPATCH), code(TABLE - 1), BigInteger.valueOf(TABLE));
        } else {
            println("warning: no DPTR register in this language, skipping context");
        }

        // 2. disassemble the table slots (each is AJMP handler) and collect them as jump destinations
        Instruction ji = listing.getInstructionAt(jmp);
        if (ji == null || !ji.getMnemonicString().toUpperCase().startsWith("JMP")) {
            printerr("expected JMP @A+DPTR at " + jmp + ", found " + ji); return;
        }
        ArrayList<Address> dests = new ArrayList<>();
        for (int n = 0; n < ENTRIES; n++) {
            Address slot = code(TABLE + 2L * n);
            if (listing.getInstructionAt(slot) == null) {
                listing.clearCodeUnits(slot, slot.add(1), false);
                new DisassembleCommand(slot, new AddressSet(slot, slot.add(1)), false).applyTo(currentProgram, monitor);
            }
            dests.add(slot);
            setEOLComment(slot, String.format("opcode 0x%02X", n));
        }

        // replace any old computed-jump references from the JMP, then add one per slot
        ReferenceManager rm = currentProgram.getReferenceManager();
        for (Reference r : rm.getReferencesFrom(jmp)) {
            if (r.getReferenceType().isComputed() || r.getReferenceType().isJump()) rm.delete(r);
        }
        for (Address d : dests) {
            ji.addMnemonicReference(d, RefType.COMPUTED_JUMP, SourceType.USER_DEFINED);
        }
        ji.setFlowOverride(FlowOverride.NONE);

        // 3. jump-table override for the decompiler, then grow the function body over the slots
        JumpTable jt = new JumpTable(jmp, dests, true, 0);
        jt.writeOverride(f);
        CreateFunctionCmd.fixupFunctionBody(currentProgram, f, monitor);

        // name the slots' targets in the listing: label the slot area once
        SymbolTable st = currentProgram.getSymbolTable();
        if (st.getPrimarySymbol(code(TABLE)) == null || !"CMD_JUMP_TABLE".equals(st.getPrimarySymbol(code(TABLE)).getName())) {
            createLabel(code(TABLE), "CMD_JUMP_TABLE", true, SourceType.USER_DEFINED);
        }
        println(String.format("CMD_DISPATCH: DPTR pinned to 0x%04X, %d jump-table destinations, body now %s",
            TABLE, dests.size(), f.getBody().getMinAddress() + "-" + f.getBody().getMaxAddress()));
    }
}
