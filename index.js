var util = require("util");
var events = require("events");

// SemVer http://semver.org/
var version = '2.0.0';

var pattern = new RegExp(/^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g);
var slice = Array.prototype.slice;
var globalEventName = "message";
var eventNames = [globalEventName, 'log', 'info', 'warn', 'error'];
var overrides = ['log', 'info', 'warn', 'error'];
var proxies = ['dir', 'time', 'timeEnd', 'trace', 'assert'];
var consoleLabel = "console";
var createTrace = true;
var emptyStack = {object:null, path:null, line:null, char:null};

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
    return stack[0] || emptyStack;
}

function getTrace() {
    if (!this.trace) {
        return emptyStack;
    }
    else {
        var line = getTraceLine();
        return parseStackLine(line);
    }
}

function getTraceLine() {
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack.split("\n").splice(1), i = 0, l = stack.length, line = ""; // First line is "Error"
    for (i; i < l; i++) {
        line = stack[i] || "";
        line = line.trim();
        if (!(new RegExp(__filename)).test(line)) {
            return line;
        }
    }
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
    var trace = getTrace.call(this),
        label = this.label || "",
        pid = process.pid,
        pType = (process.env.NODE_WORKER_ID ? 'worker' : 'master'),
        tEmit = this.emit,
        relayed = this.relayed;
    if (!relayed && !hasListener.call(this)) {
        this.on(globalEventName, this.defaultListener);
    }
    tEmit.apply(this, [globalEventName, level, label, args, pid, pType, trace]);
    tEmit.apply(this, [level, label, args, pid, pType, trace]);
}

function Konsole(label, options) {
    events.EventEmitter.call(this);
    options = options || {};
    if (options.trace == false) this.trace = false;
    this.label = label || "";
}

util.inherits(Konsole, events.EventEmitter);

/**
 * console API Overrides and Proxies
 */
overrides.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
        emitHelper.apply(this, [funcName, slice.call(arguments)]);
    }
});
proxies.forEach(function (funcName) {
    Konsole.prototype[funcName] = function () {
        return console[funcName].apply(console, arguments);
    }
});

/**
 * Konsole API
 */
Konsole.prototype.write = function () {
    process.stdout.write(util.format.apply(this, arguments) + '\n');
}
Konsole.prototype.relay = function () {
    var that = this, origins = slice.call(arguments), tEmit = that.emit;
    origins.forEach(function (origin) {
        origin.relayed = true;
        origin.on(globalEventName, function () {
            if (!that.relayed && !hasListener.call(that)) {
                that.on(globalEventName, that.defaultListener);
            }
            tEmit.apply(that, [globalEventName].concat(slice.call(arguments)));
            tEmit.apply(that, slice.call(arguments));
        });
    });
}
Konsole.prototype.defaultListener = function (level, label, args, pid, pType, trace) {
    this.write("[" + label + ":" + pType + ":" + pid + "] " + level.toUpperCase() + " " + trace.path + ":" + trace.line + ":" + trace.char + " '" + util.format.apply(this, args) + "'");
}
Konsole.prototype.version = version;
Konsole.prototype.relayed = false;
Konsole.prototype.trace = createTrace;
Konsole.prototype.label = "";

module.exports = function (consoleOverride, options) {
    if (consoleOverride !== false && typeof consoleOverride !== "string") {
        var orig = {}, konsole = new Konsole(consoleLabel, options);
        overrides.forEach(function (funcName) {
            orig[funcName] = console[funcName];
            console[funcName] = function () {
                return konsole[funcName].apply(konsole, arguments);
            }
            console.on = function () {
                return konsole.on.apply(konsole, arguments);
            }
        });
        return function () {
            overrides.forEach(function (funcName) {
                console[funcName] = orig[funcName];
            });
            delete console.on;
        }
    }
    else {
        // consoleOverride used as label here. Everything else than false expected
        return new Konsole(consoleOverride, options);
    }
};
