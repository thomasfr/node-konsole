/**
 * Default Listener for Konsole
 * @param level String Level used for logging. log|info|warn|error
 * @param label String Label used for the Konsole instance
 * @param args Array Original arguments of the konsole.* call
 * @param pid int ID of the process where the konsole.* call initiated
 * @param pType String Either 'master' or 'worker'
 * @param trace Array If options.trace === true then this will hold once trace line where the konsole.* call was executed
 * @param diff int if options.diff === true then this will hold the diff in milliseconds to the last konsole.* call with the same label
 */
module.exports = function defaultListener(level, args) {
    var trace = this.trace; // trace is a getter, if you do not access the property it will not generate a trace
    this.write(" " + this.label + " " + this.processType + ":" + this.pid + " " + level.toUpperCase() + " " +
        "+" + this.diff + "ms " +
        (trace.path ? "(" + trace.path : "") +
        (trace.line ? ":" + trace.line + ") " : "") + "'" +
        this.format.apply(this, args) + "'");
}