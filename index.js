var util = require("util");
var events = require("events");

/**
 *  Matches a line from nodes stacktrace
 *  2 = object.function
 *  4 = file path
 *  5 = line
 *  6 = char
 */
var pattern = new RegExp(/^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g);
var slice = Array.prototype.slice;

function parseStackLine(line) {
    var match, stack = [];
    while (match = pattern.exec(line)) {
        stack.push({
            "object":match[2] || null,
            "path":match[4] || null,
            "line":match[5] || null,
            "char":match[6] || null
        });
    }
    return stack;
}

function getRawTrace() {
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    // splice(3) uuuuhuhuuuuu magic number alert.
    // we kick the first 3 elements from the beginning. these 3 elements
    // are the 3 calls from within this module.
    return err.stack.split("\n").splice(4) || [];
}

function getTrace() {
    var rawStack = getRawTrace();
    var stack = [], stackLine;

    rawStack.forEach(function (line) {
        line = line.trim();
        stackLine = parseStackLine(line);
        stack.push(stackLine);
    });
    return stack;
}

function getCalleeTrace() {
    var rawCalleeLine = getRawTrace()[0].trim() || "";
    return parseStackLine(rawCalleeLine)[0] || {};
}

function defaultHandler(level, label, path, line, args) {
    this.out("[" + label + "] [" + level.toUpperCase() + "] (" + path + ":" + line + ") " + util.format.apply(this, args));
}

function emit(level, args) {
    var trace = getCalleeTrace();
    var label = this.label || "";
    var path = trace.path || "";
    var line = trace.line || "";
    this.emit.apply(this, ['data', level, label, path, line, args]);
    this.emit.apply(this, [level, label, path, line, args]);
}

function Konsole(label) {
    events.EventEmitter.call(this);
    this.label = label;
}
util.inherits(Konsole, events.EventEmitter);

Konsole.prototype.log = function () {
    emit.apply(this, ["log", slice.call(arguments)]);
}
Konsole.prototype.info = function () {
    emit.apply(this, ["info", slice.call(arguments)]);
}
Konsole.prototype.warn = function () {
    emit.apply(this, ["warn", slice.call(arguments)]);
}
Konsole.prototype.error = function () {
    emit.apply(this, ["error", slice.call(arguments)]);
}
Konsole.prototype.dir = console.dir;
Konsole.prototype.time = console.time;
Konsole.prototype.timeEnd = console.timeEnd;
Konsole.prototype.trace = console.trace;
Konsole.prototype.assert = console.assert;

Konsole.prototype.out = function () {
    process.stdout.write(util.format.apply(this, arguments) + '\n');
}
Konsole.prototype.relayEvents = function (origin) {
    var that = this;
    origin.on("data", function () {
        that.emit.apply(that, ["data"].concat(slice.call(arguments)));
    });
}
Konsole.prototype.registerDefaultHandler = function () {
    this.on("data", defaultHandler);
}

module.exports = Konsole;
