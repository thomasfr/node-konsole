/**
 * Default Listener for Konsole
 * @param level String Level used for logging. log|info|warn|error
 * @param args Array Original arguments of the konsole.* call
 */
module.exports = function defaultListener(level, args) {
    var trace = this.trace; // trace is a getter, if you do not access the property it will not generate a trace
    this.write(" " + this.label + " " + this.processType + ":" + this.pid + " " + level.toUpperCase() + " " +
        "+" + this.diff + "ms " +
        (trace.path ? "(" + trace.path : "") +
        (trace.line ? ":" + trace.line + ") " : "") + "'" +
        this.format.apply(this, args) + "'");
}