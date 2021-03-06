// https://github.com/alessioalex/generic-middleware/blob/1.1.0/lib/middleware.js
/** @license MIT */

// this copy makes it friendlier for AMD and drops "err" parameter detection

define(function () {
  'use strict';

  var noop = function emptyFn () {};

  /**
  @constructor
  */
  function Middleware () {
    if (!(this instanceof Middleware)) {
      return new Middleware();
    }

    this._stack = [];
    this._errorHandler = noop;

    this.init = this.init.bind(this);
  }

  /**
  @param {Function} fn - function to inject into the stack
  */
  Middleware.prototype.use = function use (fn) {
    this._stack.push(fn);
  };

  /**
  @param {Function?} [after] - function in the stack to follow (if null, add to the tail)
  @param {Function} fn - function to inject into the stack
  */
  Middleware.prototype.useAfter = function useAfter (after, fn) {
    var index = this._stack.indexOf(after);
    if (!after || index < 0) {
      this._stack.push(fn);
      return;
    }
    this._stack.splice(index + 1, 0, fn);
  };

  /**
  @param {Function?} [before] - function in the stack to precede (if null, add to the head)
  @param {Function} fn - function to inject into the stack
  */
  Middleware.prototype.useBefore = function useBefore (before, fn) {
    var index = this._stack.indexOf(before);
    if (!before || index < 0) {
      this._stack.unshift(fn);
      return;
    }
    this._stack.splice(index, 0, fn);
  };

  Middleware.prototype.addErrorHandler = function addErrorHandler (fn) {
    this._errorHandler = fn;
  };

  Middleware.prototype.init = function init () {
    var args = Array.prototype.slice.call(arguments);

    this._handle(null, 0, args);
  };

  Middleware.prototype._handle = function _handle (err, index, arg) {
    var that = this;
    var args = (arg && arg.length) ? arg.slice(0) : [];

    // no `next()`-ing in the error handler
    if (!err) {
      args.push(function next (e) {
        that._handle(e, (index + 1), arg);
      });
    }

    if (!err) {
      this._callStackFn(index, args);
    } else {
      args.unshift(err);
      this._errorHandler.apply(null, args);
    }
  };

  Middleware.prototype._callStackFn = function _callStackFn (index, args) {
    var stack = this._stack;

    if (index < stack.length) {
      stack[index].apply(null, args);
    }
  };

  return Middleware;
});
