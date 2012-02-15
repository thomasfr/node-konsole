var Konsole = require('./Konsole');
var util = require('util');
var additions = ['addDefaultListener', 'on', 'relay'];
var overrides = ['log', 'info', 'warn', 'error', 'time', 'timeEnd'];
var consoleLabel = 'console';
var orig;
module.exports = function create(label) {
    if (typeof label === "undefined") {
        if (!orig) {
            orig = {};
            var konsole = new Konsole(consoleLabel);
            overrides.forEach(function overrideConsole(funcName) {
                orig[funcName] = console[funcName] || undefined;
                console[funcName] = function () {
                    return konsole[funcName].apply(konsole, arguments);
                }
            });
            additions.forEach(function addToConsole(funcName) {
                console[funcName] = function () {
                    return konsole[funcName].apply(konsole, arguments);
                }
            });
        }
        return function () {
            overrides.forEach(function (funcName) {
                console[funcName] = orig[funcName];
            });
            additions.forEach(function (funcName) {
                delete console[funcName];
            });
            orig = null;
            delete orig;
        }
    }
    return new Konsole(label);
}