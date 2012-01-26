var util = require("util");
var events = require("events");

// SemVer http://semver.org/
var version = '1.0.0';

/**
 *  Matches a line from nodes stacktrace
 *  2 = object.function
 *  4 = file path
 *  5 = line
 *  6 = char
 */
var pattern = new RegExp(/^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g);
var slice = Array.prototype.slice;
var eventNames = ['data', 'log', 'info', 'warn', 'error'];

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
    // splice(4)  ohh ohh - magic number alert.
    // we kick the first 4 elements from the beginning. these 4 elements
    // are the 4 calls from within this module.
    return err.stack.split("\n").splice(4) || [];
}

function getTrace() {
    var rawStack = getRawTrace(), stack = [], stackLine;
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

function defaultListener(level, label, file, line, char, args) {
    this.out("[" + label + "] [" + level.toUpperCase() + "] (" + file + ":" + line + ":" + char + ") " + util.format.apply(this, args));
}

function hasListener() {
    var that = this, hasListeners = false;
    eventNames.forEach(function (eventName) {
        if (that.listeners(eventName).length > 0) {
            hasListeners = true;
        }
    });
    return hasListeners;
}

function emitHelper(level, args) {
    var trace = getCalleeTrace(), label = this.label || "", path = trace.path || "", line = trace.line || "", char = trace.char || "", tEmit = this.emit;
    if (!this.relayed && !hasListener.call(this)) {
        this.registerDefaultListener.call(this);
    }
    tEmit.apply(this, ['data', level, label, path, line, char, args]);
    tEmit.apply(this, [level, label, path, line, char, args]);
}

function create(label) {
    return new Konsole(label || "");
}

function Konsole(label) {
    events.EventEmitter.call(this);
    this.label = label;
}
Konsole.create = create;
util.inherits(Konsole, events.EventEmitter);

/**
 * console API
 */
Konsole.prototype.log = function () {
    emitHelper.apply(this, ["log", slice.call(arguments)]);
}
Konsole.prototype.info = function () {
    emitHelper.apply(this, ["info", slice.call(arguments)]);
}
Konsole.prototype.warn = function () {
    emitHelper.apply(this, ["warn", slice.call(arguments)]);
}
Konsole.prototype.error = function () {
    emitHelper.apply(this, ["error", slice.call(arguments)]);
}
Konsole.prototype.dir = console.dir;
Konsole.prototype.time = console.time;
Konsole.prototype.timeEnd = console.timeEnd;
Konsole.prototype.trace = console.trace;
Konsole.prototype.assert = console.assert;

/**
 * Konsole API
 */
Konsole.prototype.out = function () {
    process.stdout.write(util.format.apply(this, arguments) + '\n');
}
Konsole.prototype.relay = function () {
    var that = this, origins = slice.call(arguments);
    origins.forEach(function (origin) {
        origin.relayed = true;
        origin.on("data", function () {
            if (!that.relayed && !hasListener.call(that)) {
                that.registerDefaultListener.call(that);
            }
            that.emit.apply(that, ["data"].concat(slice.call(arguments)));
            that.emit.apply(that, slice.call(arguments));
        });
    })
}
Konsole.prototype.registerDefaultListener = function () {
    this.on("data", defaultListener);
}
Konsole.prototype.create = create;
Konsole.prototype.version = version;
Konsole.prototype.relayed = false;
Konsole.prototype.label = "";

module.exports = Konsole;
