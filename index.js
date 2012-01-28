var util = require("util"),
    format = util.format,
    EventEmitter = require("events").EventEmitter;

// SemVer http://semver.org/
var version = '2.0.0';

var pattern = new RegExp(/^at (([^ ]+) )?(\(?([^:]+)*:([0-9]+)*:([0-9]+)*\)?)?$/g);
var slice = Array.prototype.slice;
var globalEventName = "message";
var eventNames = [globalEventName, 'log', 'info', 'warn', 'error'];
var loglevels = ['log', 'info', 'warn', 'error'];
var overrides = ['on', 'relay', 'log', 'info', 'warn', 'error', 'time', 'timeEnd'];
var proxies = ['dir', 'time', 'timeEnd', 'trace', 'assert'];
var consoleLabel = "console";
var createTrace = true;
var createDiff = true;
var times = {};
var emptyStack = {object:null, path:null, line:null, char:null};
var prevTime = {};

function parseStackLine(line) {
    var match, stack = [];
    while (match = pattern.exec(line)) {
        stack.push({ object:match[2] || null, path:match[4] || null, line:match[5] || null, char:match[6] || null });
    }
    return stack[0] || emptyStack;
}

function getTrace() {
    if (!createTrace) return emptyStack;
    return parseStackLine(getTraceLine());
}

function getTraceLine() {
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack.split("\n").splice(1), i = 0, l = stack.length, line = ""; // First line is "Error"
    for (i; i < l; i++) {
        line = (stack[i] || "").trim();
        if (!(new RegExp(__filename)).test(line)) return line;
    }
}

function hasListener() {
    var that = this, hasListeners = false;
    eventNames.forEach(function (eventName) {
        if (that.listeners(eventName).length > 0) hasListeners = true;
    });
    return hasListeners;
}

function getDiff(label) {
    if (!createDiff) return null;
    var curr = new Date(),
        diff = curr - (prevTime[label] || curr);
    prevTime[label] = curr;
    return diff;
}

function emitHelper(level, args) {
    var label = this.label || "",
        diff = getDiff.apply(this, [label]),
        trace = getTrace.call(this),
        pid = process.pid,
        pType = (process.env.NODE_WORKER_ID ? 'worker' : 'master'),
        tEmit = this.emit,
        relayed = this.relayed;
    tEmit.apply(this, [globalEventName, level, label, args, pid, pType, trace, diff]);
    tEmit.apply(this, [level, label, args, pid, pType, trace, diff]);
}

function Konsole(label, options) {
    EventEmitter.call(this);
    options = options || {};
    if (options.trace == false) createTrace = false;
    if (options.diff == false) createDiff = false;
    this.label = label || "";
}
util.inherits(Konsole, EventEmitter);
var proto = Konsole.prototype;

loglevels.forEach(function (funcName) {
    proto[funcName] = function () {
        emitHelper.apply(this, [funcName, slice.call(arguments)]);
    }
});
proxies.forEach(function (funcName) {
    proto[funcName] = function () {
        return console[funcName].apply(console, arguments);
    }
});

proto.write = function () {
    process.stdout.write(format.apply(this, arguments) + '\n');
}
proto.format = function () {
    return format.apply(this, arguments);
}
proto.relay = function () {
    var that = this, origins = slice.call(arguments), tEmit = that.emit;
    origins.forEach(function (origin) {
        origin.relayed = true;
        origin.on(globalEventName, function () {
            var args = slice.call(arguments);
            tEmit.apply(that, [globalEventName].concat(args));
            tEmit.apply(that, args);
        });
    });
}
proto.defaultListener = function (level, label, args, pid, pType, trace) {
    this.write("[" + label + ":" + pType + ":" + pid + "] " + level.toUpperCase() + " " + trace.path + ":" + trace.line + ":" + trace.char + " '" + format.apply(this, args) + "'");
}
proto.version = version;
proto.relayed = false;
proto.label = "";
proto.time = function (label) {
    times[label] = Date.now();
};
proto.timeEnd = function (label) {
    var duration = Date.now() - times[label];
    this.log('%s: %dms', label, duration);
};

module.exports = function (consoleOverride, options) {
    process.stdout.write(typeof consoleOverride + "\n");
    if (typeof consoleOverride === "object") {
        options = consoleOverride;
        var orig = {}, konsole = new Konsole(consoleLabel, options);
        overrides.forEach(function (funcName) {
            orig[funcName] = console[funcName] || undefined;
            console[funcName] = function () {
                return konsole[funcName].apply(konsole, arguments);
            }
        });
        return function () {
            overrides.forEach(function (funcName) {
                console[funcName] = orig[funcName];
            });
            delete console.on, console.relay;
        }
    }
    // consoleOverride used as label here. Everything else than false expected
    return new Konsole(consoleOverride, options);
};