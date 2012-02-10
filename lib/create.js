var Konsole = require('./Konsole');

var additions = ['addDefaultListener', 'on', 'relay'];
var overrides = ['log', 'info', 'warn', 'error', 'time', 'timeEnd'];
var consoleLabel = 'console';

module.exports = function create(label, options) {
    if (typeof label === 'object' || (typeof label === 'undefined' && typeof options === 'undefined')) {
        options = label;
        var orig = {}, konsole = new Konsole(consoleLabel, options);
        overrides.forEach(function overrideConsole(funcName) {
            orig[funcName] = console[funcName] || undefined;
            console[funcName] = function () {
                return konsole[funcName].apply(konsole, arguments);
            }
        });
        additions.forEach(function addToConsole(funcName) {
            console[funcName] = function scopeProxy() {
                return konsole[funcName].apply(konsole, arguments);
            }
        });
        return function restoreConsole() {
            overrides.forEach(function (funcName) {
                console[funcName] = orig[funcName];
            });
            additions.forEach(function (funcName) {
                delete console[funcName];
            });
        }
    }
    return new Konsole(label, options);
}