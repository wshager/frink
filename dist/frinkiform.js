(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.amd = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Observable_1 = require('./Observable');
/**
 * Represents a push-based event or value that an {@link Observable} can emit.
 * This class is particularly useful for operators that manage notifications,
 * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
 * others. Besides wrapping the actual delivered value, it also annotates it
 * with metadata of, for instance, what type of push message it is (`next`,
 * `error`, or `complete`).
 *
 * @see {@link materialize}
 * @see {@link dematerialize}
 * @see {@link observeOn}
 *
 * @class Notification<T>
 */
var Notification = (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    /**
     * Delivers to the given `observer` the value wrapped by this Notification.
     * @param {Observer} observer
     * @return
     */
    Notification.prototype.observe = function (observer) {
        switch (this.kind) {
            case 'N':
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    };
    /**
     * Given some {@link Observer} callbacks, deliver the value represented by the
     * current Notification to the correctly corresponding callback.
     * @param {function(value: T): void} next An Observer `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    Notification.prototype.do = function (next, error, complete) {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    };
    /**
     * Takes an Observer or its individual callback functions, and calls `observe`
     * or `do` methods accordingly.
     * @param {Observer|function(value: T): void} nextOrObserver An Observer or
     * the `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
            return this.observe(nextOrObserver);
        }
        else {
            return this.do(nextOrObserver, error, complete);
        }
    };
    /**
     * Returns a simple Observable that just delivers the notification represented
     * by this Notification instance.
     * @return {any}
     */
    Notification.prototype.toObservable = function () {
        var kind = this.kind;
        switch (kind) {
            case 'N':
                return Observable_1.Observable.of(this.value);
            case 'E':
                return Observable_1.Observable.throw(this.error);
            case 'C':
                return Observable_1.Observable.empty();
        }
        throw new Error('unexpected notification kind value');
    };
    /**
     * A shortcut to create a Notification instance of the type `next` from a
     * given value.
     * @param {T} value The `next` value.
     * @return {Notification<T>} The "next" Notification representing the
     * argument.
     */
    Notification.createNext = function (value) {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    };
    /**
     * A shortcut to create a Notification instance of the type `error` from a
     * given error.
     * @param {any} [err] The `error` error.
     * @return {Notification<T>} The "error" Notification representing the
     * argument.
     */
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    /**
     * A shortcut to create a Notification instance of the type `complete`.
     * @return {Notification<any>} The valueless "complete" Notification.
     */
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    Notification.undefinedValueNotification = new Notification('N', undefined);
    return Notification;
}());
exports.Notification = Notification;

},{"./Observable":2}],2:[function(require,module,exports){
"use strict";
var root_1 = require('./util/root');
var toSubscriber_1 = require('./util/toSubscriber');
var observable_1 = require('./symbol/observable');
/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 *
 * @class Observable<T>
 */
var Observable = (function () {
    /**
     * @constructor
     * @param {Function} subscribe the function that is called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    /**
     * Creates a new Observable, with this Observable as the source, and the passed
     * operator defined as the new observable's operator.
     * @method lift
     * @param {Operator} operator the operator defining the operation to take on the observable
     * @return {Observable} a new observable with the Operator applied
     */
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    /**
     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
     *
     * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
     *
     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
     * might be for example a function that you passed to a {@link create} static factory, but most of the time it is
     * a library implementation, which defines what and when will be emitted by an Observable. This means that calling
     * `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
     * thought.
     *
     * Apart from starting the execution of an Observable, this method allows you to listen for values
     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
     * following ways.
     *
     * The first way is creating an object that implements {@link Observer} interface. It should have methods
     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular do
     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
     * do anything, you can simply omit it. Note however, that if `error` method is not provided, all errors will
     * be left uncaught.
     *
     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
     * This means you can provide three functions as arguments to `subscribe`, where first function is equivalent
     * of a `next` method, second of an `error` method and third of a `complete` method. Just as in case of Observer,
     * if you do not need to listen for something, you can omit a function, preferably by passing `undefined` or `null`,
     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
     * to `error` function, just as before, if not provided, errors emitted by an Observable will be thrown.
     *
     * Whatever style of calling `subscribe` you use, in both cases it returns a Subscription object.
     * This object allows you to call `unsubscribe` on it, which in turn will stop work that an Observable does and will clean
     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
     *
     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
     * It is an Observable itself that decides when these functions will be called. For example {@link of}
     * by default emits all its values synchronously. Always check documentation for how given Observable
     * will behave when subscribed and if its default behavior can be modified with a {@link Scheduler}.
     *
     * @example <caption>Subscribe with an Observer</caption>
     * const sumObserver = {
     *   sum: 0,
     *   next(value) {
     *     console.log('Adding: ' + value);
     *     this.sum = this.sum + value;
     *   },
     *   error() { // We actually could just remove this method,
     *   },        // since we do not really care about errors right now.
     *   complete() {
     *     console.log('Sum equals: ' + this.sum);
     *   }
     * };
     *
     * Rx.Observable.of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
     * .subscribe(sumObserver);
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Subscribe with functions</caption>
     * let sum = 0;
     *
     * Rx.Observable.of(1, 2, 3)
     * .subscribe(
     *   function(value) {
     *     console.log('Adding: ' + value);
     *     sum = sum + value;
     *   },
     *   undefined,
     *   function() {
     *     console.log('Sum equals: ' + sum);
     *   }
     * );
     *
     * // Logs:
     * // "Adding: 1"
     * // "Adding: 2"
     * // "Adding: 3"
     * // "Sum equals: 6"
     *
     *
     * @example <caption>Cancel a subscription</caption>
     * const subscription = Rx.Observable.interval(1000).subscribe(
     *   num => console.log(num),
     *   undefined,
     *   () => console.log('completed!') // Will not be called, even
     * );                                // when cancelling subscription
     *
     *
     * setTimeout(() => {
     *   subscription.unsubscribe();
     *   console.log('unsubscribed!');
     * }, 2500);
     *
     * // Logs:
     * // 0 after 1s
     * // 1 after 2s
     * // "unsubscribed!" after 2.5s
     *
     *
     * @param {Observer|Function} observerOrNext (optional) Either an observer with methods to be called,
     *  or the first of three possible handlers, which is the handler for each value emitted from the subscribed
     *  Observable.
     * @param {Function} error (optional) A handler for a terminal event resulting from an error. If no error handler is provided,
     *  the error will be thrown as unhandled.
     * @param {Function} complete (optional) A handler for a terminal event resulting from successful completion.
     * @return {ISubscription} a subscription reference to the registered handlers
     * @method subscribe
     */
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
        if (operator) {
            operator.call(sink, this.source);
        }
        else {
            sink.add(this.source ? this._subscribe(sink) : this._trySubscribe(sink));
        }
        if (sink.syncErrorThrowable) {
            sink.syncErrorThrowable = false;
            if (sink.syncErrorThrown) {
                throw sink.syncErrorValue;
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.syncErrorThrown = true;
            sink.syncErrorValue = err;
            sink.error(err);
        }
    };
    /**
     * @method forEach
     * @param {Function} next a handler for each value emitted by the observable
     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
     * @return {Promise} a promise that either resolves on observable completion or
     *  rejects with the handled error
     */
    Observable.prototype.forEach = function (next, PromiseCtor) {
        var _this = this;
        if (!PromiseCtor) {
            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
                PromiseCtor = root_1.root.Rx.config.Promise;
            }
            else if (root_1.root.Promise) {
                PromiseCtor = root_1.root.Promise;
            }
        }
        if (!PromiseCtor) {
            throw new Error('no Promise impl found');
        }
        return new PromiseCtor(function (resolve, reject) {
            // Must be declared in a separate statement to avoid a RefernceError when
            // accessing subscription below in the closure due to Temporal Dead Zone.
            var subscription;
            subscription = _this.subscribe(function (value) {
                if (subscription) {
                    // if there is a subscription, then we can surmise
                    // the next handling is asynchronous. Any errors thrown
                    // need to be rejected explicitly and unsubscribe must be
                    // called manually
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscription.unsubscribe();
                    }
                }
                else {
                    // if there is NO subscription, then we're getting a nexted
                    // value synchronously during subscription. We can just call it.
                    // If it errors, Observable's `subscribe` will ensure the
                    // unsubscription logic is called, then synchronously rethrow the error.
                    // After that, Promise will trap the error and send it
                    // down the rejection path.
                    next(value);
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        return this.source.subscribe(subscriber);
    };
    /**
     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     * @method Symbol.observable
     * @return {Observable} this instance of the observable
     */
    Observable.prototype[observable_1.observable] = function () {
        return this;
    };
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new cold Observable by calling the Observable constructor
     * @static true
     * @owner Observable
     * @method create
     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
     * @return {Observable} a new cold observable
     */
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
exports.Observable = Observable;

},{"./symbol/observable":24,"./util/root":34,"./util/toSubscriber":35}],3:[function(require,module,exports){
"use strict";
exports.empty = {
    closed: true,
    next: function (value) { },
    error: function (err) { throw err; },
    complete: function () { }
};

},{}],4:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isFunction_1 = require('./util/isFunction');
var Subscription_1 = require('./Subscription');
var Observer_1 = require('./Observer');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 *
 * @class Subscriber<T>
 */
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    /**
     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
     * defined Observer or a `next` callback function.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     */
    function Subscriber(destinationOrNext, error, complete) {
        _super.call(this);
        this.syncErrorValue = null;
        this.syncErrorThrown = false;
        this.syncErrorThrowable = false;
        this.isStopped = false;
        switch (arguments.length) {
            case 0:
                this.destination = Observer_1.empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    this.destination = Observer_1.empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        this.destination = destinationOrNext;
                        this.destination.add(this);
                    }
                    else {
                        this.syncErrorThrowable = true;
                        this.destination = new SafeSubscriber(this, destinationOrNext);
                    }
                    break;
                }
            default:
                this.syncErrorThrowable = true;
                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
                break;
        }
    }
    Subscriber.prototype[rxSubscriber_1.rxSubscriber] = function () { return this; };
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
     * @param {function(e: ?any): void} [error] The `error` callback of an
     * Observer.
     * @param {function(): void} [complete] The `complete` callback of an
     * Observer.
     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     */
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param {T} [value] The `next` value.
     * @return {void}
     */
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached {@link Error}. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param {any} [err] The `error` exception.
     * @return {void}
     */
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     * @return {void}
     */
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        this._parent = null;
        this._parents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parent = _parent;
        this._parents = _parents;
        return this;
    };
    return Subscriber;
}(Subscription_1.Subscription));
exports.Subscriber = Subscriber;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        _super.call(this);
        this._parentSubscriber = _parentSubscriber;
        var next;
        var context = this;
        if (isFunction_1.isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== Observer_1.empty) {
                context = Object.create(observerOrNext);
                if (isFunction_1.isFunction(context.unsubscribe)) {
                    this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = this.unsubscribe.bind(this);
            }
        }
        this._context = context;
        this._next = next;
        this._error = error;
        this._complete = complete;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._error) {
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                throw err;
            }
            else {
                _parentSubscriber.syncErrorValue = err;
                _parentSubscriber.syncErrorThrown = true;
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            throw err;
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            parent.syncErrorValue = err;
            parent.syncErrorThrown = true;
            return true;
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

},{"./Observer":3,"./Subscription":5,"./symbol/rxSubscriber":25,"./util/isFunction":30}],5:[function(require,module,exports){
"use strict";
var isArray_1 = require('./util/isArray');
var isObject_1 = require('./util/isObject');
var isFunction_1 = require('./util/isFunction');
var tryCatch_1 = require('./util/tryCatch');
var errorObject_1 = require('./util/errorObject');
var UnsubscriptionError_1 = require('./util/UnsubscriptionError');
/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 *
 * @class Subscription
 */
var Subscription = (function () {
    /**
     * @param {function(): void} [unsubscribe] A function describing how to
     * perform the disposal of resources when the `unsubscribe` method is called.
     */
    function Subscription(unsubscribe) {
        /**
         * A flag to indicate whether this Subscription has already been unsubscribed.
         * @type {boolean}
         */
        this.closed = false;
        this._parent = null;
        this._parents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     * @return {void}
     */
    Subscription.prototype.unsubscribe = function () {
        var hasErrors = false;
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parent = _a._parent, _parents = _a._parents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parent = null;
        this._parents = null;
        // null out _subscriptions first so any child subscriptions that attempt
        // to remove themselves from this subscription will noop
        this._subscriptions = null;
        var index = -1;
        var len = _parents ? _parents.length : 0;
        // if this._parent is null, then so is this._parents, and we
        // don't have to remove ourselves from any parent subscriptions.
        while (_parent) {
            _parent.remove(this);
            // if this._parents is null or index >= len,
            // then _parent is set to null, and the loop exits
            _parent = ++index < len && _parents[index] || null;
        }
        if (isFunction_1.isFunction(_unsubscribe)) {
            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
            if (trial === errorObject_1.errorObject) {
                hasErrors = true;
                errors = errors || (errorObject_1.errorObject.e instanceof UnsubscriptionError_1.UnsubscriptionError ?
                    flattenUnsubscriptionErrors(errorObject_1.errorObject.e.errors) : [errorObject_1.errorObject.e]);
            }
        }
        if (isArray_1.isArray(_subscriptions)) {
            index = -1;
            len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject_1.isObject(sub)) {
                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
                    if (trial === errorObject_1.errorObject) {
                        hasErrors = true;
                        errors = errors || [];
                        var err = errorObject_1.errorObject.e;
                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(err.errors));
                        }
                        else {
                            errors.push(err);
                        }
                    }
                }
            }
        }
        if (hasErrors) {
            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
        }
    };
    /**
     * Adds a tear down to be called during the unsubscribe() of this
     * Subscription.
     *
     * If the tear down being added is a subscription that is already
     * unsubscribed, is the same reference `add` is being called on, or is
     * `Subscription.EMPTY`, it will not be added.
     *
     * If this subscription is already in an `closed` state, the passed
     * tear down logic will be executed immediately.
     *
     * @param {TeardownLogic} teardown The additional logic to execute on
     * teardown.
     * @return {Subscription} Returns the Subscription used or created to be
     * added to the inner subscriptions list. This Subscription can be used with
     * `remove()` to remove the passed teardown logic from the inner subscriptions
     * list.
     */
    Subscription.prototype.add = function (teardown) {
        if (!teardown || (teardown === Subscription.EMPTY)) {
            return Subscription.EMPTY;
        }
        if (teardown === this) {
            return this;
        }
        var subscription = teardown;
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (typeof subscription._addParent !== 'function' /* quack quack */) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default:
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
        }
        var subscriptions = this._subscriptions || (this._subscriptions = []);
        subscriptions.push(subscription);
        subscription._addParent(this);
        return subscription;
    };
    /**
     * Removes a Subscription from the internal list of subscriptions that will
     * unsubscribe during the unsubscribe process of this Subscription.
     * @param {Subscription} subscription The subscription to remove.
     * @return {void}
     */
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.prototype._addParent = function (parent) {
        var _a = this, _parent = _a._parent, _parents = _a._parents;
        if (!_parent || _parent === parent) {
            // If we don't have a parent, or the new parent is the same as the
            // current parent, then set this._parent to the new parent.
            this._parent = parent;
        }
        else if (!_parents) {
            // If there's already one parent, but not multiple, allocate an Array to
            // store the rest of the parent Subscriptions.
            this._parents = [parent];
        }
        else if (_parents.indexOf(parent) === -1) {
            // Only add the new parent to the _parents list if it's not already there.
            _parents.push(parent);
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
exports.Subscription = Subscription;
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError_1.UnsubscriptionError) ? err.errors : err); }, []);
}

},{"./util/UnsubscriptionError":26,"./util/errorObject":27,"./util/isArray":28,"./util/isFunction":30,"./util/isObject":31,"./util/tryCatch":36}],6:[function(require,module,exports){
"use strict";
var Observable_1 = require('../../Observable');
var from_1 = require('../../observable/from');
Observable_1.Observable.from = from_1.from;

},{"../../Observable":2,"../../observable/from":18}],7:[function(require,module,exports){
"use strict";
var Observable_1 = require('../../Observable');
var filter_1 = require('../../operator/filter');
Observable_1.Observable.prototype.filter = filter_1.filter;

},{"../../Observable":2,"../../operator/filter":19}],8:[function(require,module,exports){
"use strict";
var Observable_1 = require('../../Observable');
var map_1 = require('../../operator/map');
Observable_1.Observable.prototype.map = map_1.map;

},{"../../Observable":2,"../../operator/map":20}],9:[function(require,module,exports){
"use strict";
var Observable_1 = require('../../Observable');
var reduce_1 = require('../../operator/reduce');
Observable_1.Observable.prototype.reduce = reduce_1.reduce;

},{"../../Observable":2,"../../operator/reduce":22}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var ScalarObservable_1 = require('./ScalarObservable');
var EmptyObservable_1 = require('./EmptyObservable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ArrayLikeObservable = (function (_super) {
    __extends(ArrayLikeObservable, _super);
    function ArrayLikeObservable(arrayLike, scheduler) {
        _super.call(this);
        this.arrayLike = arrayLike;
        this.scheduler = scheduler;
        if (!scheduler && arrayLike.length === 1) {
            this._isScalar = true;
            this.value = arrayLike[0];
        }
    }
    ArrayLikeObservable.create = function (arrayLike, scheduler) {
        var length = arrayLike.length;
        if (length === 0) {
            return new EmptyObservable_1.EmptyObservable();
        }
        else if (length === 1) {
            return new ScalarObservable_1.ScalarObservable(arrayLike[0], scheduler);
        }
        else {
            return new ArrayLikeObservable(arrayLike, scheduler);
        }
    };
    ArrayLikeObservable.dispatch = function (state) {
        var arrayLike = state.arrayLike, index = state.index, length = state.length, subscriber = state.subscriber;
        if (subscriber.closed) {
            return;
        }
        if (index >= length) {
            subscriber.complete();
            return;
        }
        subscriber.next(arrayLike[index]);
        state.index = index + 1;
        this.schedule(state);
    };
    ArrayLikeObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;
        var length = arrayLike.length;
        if (scheduler) {
            return scheduler.schedule(ArrayLikeObservable.dispatch, 0, {
                arrayLike: arrayLike, index: index, length: length, subscriber: subscriber
            });
        }
        else {
            for (var i = 0; i < length && !subscriber.closed; i++) {
                subscriber.next(arrayLike[i]);
            }
            subscriber.complete();
        }
    };
    return ArrayLikeObservable;
}(Observable_1.Observable));
exports.ArrayLikeObservable = ArrayLikeObservable;

},{"../Observable":2,"./EmptyObservable":12,"./ScalarObservable":17}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var ScalarObservable_1 = require('./ScalarObservable');
var EmptyObservable_1 = require('./EmptyObservable');
var isScheduler_1 = require('../util/isScheduler');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ArrayObservable = (function (_super) {
    __extends(ArrayObservable, _super);
    function ArrayObservable(array, scheduler) {
        _super.call(this);
        this.array = array;
        this.scheduler = scheduler;
        if (!scheduler && array.length === 1) {
            this._isScalar = true;
            this.value = array[0];
        }
    }
    ArrayObservable.create = function (array, scheduler) {
        return new ArrayObservable(array, scheduler);
    };
    /**
     * Creates an Observable that emits some values you specify as arguments,
     * immediately one after the other, and then emits a complete notification.
     *
     * <span class="informal">Emits the arguments you provide, then completes.
     * </span>
     *
     * <img src="./img/of.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the arguments given, and the complete notification thereafter. It can
     * be used for composing with other Observables, such as with {@link concat}.
     * By default, it uses a `null` IScheduler, which means the `next`
     * notifications are sent synchronously, although with a different IScheduler
     * it is possible to determine when those notifications will be delivered.
     *
     * @example <caption>Emit 10, 20, 30, then 'a', 'b', 'c', then start ticking every second.</caption>
     * var numbers = Rx.Observable.of(10, 20, 30);
     * var letters = Rx.Observable.of('a', 'b', 'c');
     * var interval = Rx.Observable.interval(1000);
     * var result = numbers.concat(letters).concat(interval);
     * result.subscribe(x => console.log(x));
     *
     * @see {@link create}
     * @see {@link empty}
     * @see {@link never}
     * @see {@link throw}
     *
     * @param {...T} values Arguments that represent `next` values to be emitted.
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emissions of the `next` notifications.
     * @return {Observable<T>} An Observable that emits each given input value.
     * @static true
     * @name of
     * @owner Observable
     */
    ArrayObservable.of = function () {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i - 0] = arguments[_i];
        }
        var scheduler = array[array.length - 1];
        if (isScheduler_1.isScheduler(scheduler)) {
            array.pop();
        }
        else {
            scheduler = null;
        }
        var len = array.length;
        if (len > 1) {
            return new ArrayObservable(array, scheduler);
        }
        else if (len === 1) {
            return new ScalarObservable_1.ScalarObservable(array[0], scheduler);
        }
        else {
            return new EmptyObservable_1.EmptyObservable(scheduler);
        }
    };
    ArrayObservable.dispatch = function (state) {
        var array = state.array, index = state.index, count = state.count, subscriber = state.subscriber;
        if (index >= count) {
            subscriber.complete();
            return;
        }
        subscriber.next(array[index]);
        if (subscriber.closed) {
            return;
        }
        state.index = index + 1;
        this.schedule(state);
    };
    ArrayObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var array = this.array;
        var count = array.length;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ArrayObservable.dispatch, 0, {
                array: array, index: index, count: count, subscriber: subscriber
            });
        }
        else {
            for (var i = 0; i < count && !subscriber.closed; i++) {
                subscriber.next(array[i]);
            }
            subscriber.complete();
        }
    };
    return ArrayObservable;
}(Observable_1.Observable));
exports.ArrayObservable = ArrayObservable;

},{"../Observable":2,"../util/isScheduler":33,"./EmptyObservable":12,"./ScalarObservable":17}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var EmptyObservable = (function (_super) {
    __extends(EmptyObservable, _super);
    function EmptyObservable(scheduler) {
        _super.call(this);
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable that emits no items to the Observer and immediately
     * emits a complete notification.
     *
     * <span class="informal">Just emits 'complete', and nothing else.
     * </span>
     *
     * <img src="./img/empty.png" width="100%">
     *
     * This static operator is useful for creating a simple Observable that only
     * emits the complete notification. It can be used for composing with other
     * Observables, such as in a {@link mergeMap}.
     *
     * @example <caption>Emit the number 7, then complete.</caption>
     * var result = Rx.Observable.empty().startWith(7);
     * result.subscribe(x => console.log(x));
     *
     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>
     * var interval = Rx.Observable.interval(1000);
     * var result = interval.mergeMap(x =>
     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
     * );
     * result.subscribe(x => console.log(x));
     *
     * // Results in the following to the console:
     * // x is equal to the count on the interval eg(0,1,2,3,...)
     * // x will occur every 1000ms
     * // if x % 2 is equal to 1 print abc
     * // if x % 2 is not equal to 1 nothing will be output
     *
     * @see {@link create}
     * @see {@link never}
     * @see {@link of}
     * @see {@link throw}
     *
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emission of the complete notification.
     * @return {Observable} An "empty" Observable: emits only the complete
     * notification.
     * @static true
     * @name empty
     * @owner Observable
     */
    EmptyObservable.create = function (scheduler) {
        return new EmptyObservable(scheduler);
    };
    EmptyObservable.dispatch = function (arg) {
        var subscriber = arg.subscriber;
        subscriber.complete();
    };
    EmptyObservable.prototype._subscribe = function (subscriber) {
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber: subscriber });
        }
        else {
            subscriber.complete();
        }
    };
    return EmptyObservable;
}(Observable_1.Observable));
exports.EmptyObservable = EmptyObservable;

},{"../Observable":2}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var isArray_1 = require('../util/isArray');
var isArrayLike_1 = require('../util/isArrayLike');
var isPromise_1 = require('../util/isPromise');
var PromiseObservable_1 = require('./PromiseObservable');
var IteratorObservable_1 = require('./IteratorObservable');
var ArrayObservable_1 = require('./ArrayObservable');
var ArrayLikeObservable_1 = require('./ArrayLikeObservable');
var iterator_1 = require('../symbol/iterator');
var Observable_1 = require('../Observable');
var observeOn_1 = require('../operator/observeOn');
var observable_1 = require('../symbol/observable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var FromObservable = (function (_super) {
    __extends(FromObservable, _super);
    function FromObservable(ish, scheduler) {
        _super.call(this, null);
        this.ish = ish;
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable from an Array, an array-like object, a Promise, an
     * iterable object, or an Observable-like object.
     *
     * <span class="informal">Converts almost anything to an Observable.</span>
     *
     * <img src="./img/from.png" width="100%">
     *
     * Convert various other objects and data types into Observables. `from`
     * converts a Promise or an array-like or an
     * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)
     * object into an Observable that emits the items in that promise or array or
     * iterable. A String, in this context, is treated as an array of characters.
     * Observable-like objects (contains a function named with the ES2015 Symbol
     * for Observable) can also be converted through this operator.
     *
     * @example <caption>Converts an array to an Observable</caption>
     * var array = [10, 20, 30];
     * var result = Rx.Observable.from(array);
     * result.subscribe(x => console.log(x));
     *
     * // Results in the following:
     * // 10 20 30
     *
     * @example <caption>Convert an infinite iterable (from a generator) to an Observable</caption>
     * function* generateDoubles(seed) {
     *   var i = seed;
     *   while (true) {
     *     yield i;
     *     i = 2 * i; // double it
     *   }
     * }
     *
     * var iterator = generateDoubles(3);
     * var result = Rx.Observable.from(iterator).take(10);
     * result.subscribe(x => console.log(x));
     *
     * // Results in the following:
     * // 3 6 12 24 48 96 192 384 768 1536
     *
     * @see {@link create}
     * @see {@link fromEvent}
     * @see {@link fromEventPattern}
     * @see {@link fromPromise}
     *
     * @param {ObservableInput<T>} ish A subscribable object, a Promise, an
     * Observable-like, an Array, an iterable or an array-like object to be
     * converted.
     * @param {Scheduler} [scheduler] The scheduler on which to schedule the
     * emissions of values.
     * @return {Observable<T>} The Observable whose values are originally from the
     * input object that was converted.
     * @static true
     * @name from
     * @owner Observable
     */
    FromObservable.create = function (ish, scheduler) {
        if (ish != null) {
            if (typeof ish[observable_1.observable] === 'function') {
                if (ish instanceof Observable_1.Observable && !scheduler) {
                    return ish;
                }
                return new FromObservable(ish, scheduler);
            }
            else if (isArray_1.isArray(ish)) {
                return new ArrayObservable_1.ArrayObservable(ish, scheduler);
            }
            else if (isPromise_1.isPromise(ish)) {
                return new PromiseObservable_1.PromiseObservable(ish, scheduler);
            }
            else if (typeof ish[iterator_1.iterator] === 'function' || typeof ish === 'string') {
                return new IteratorObservable_1.IteratorObservable(ish, scheduler);
            }
            else if (isArrayLike_1.isArrayLike(ish)) {
                return new ArrayLikeObservable_1.ArrayLikeObservable(ish, scheduler);
            }
        }
        throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
    };
    FromObservable.prototype._subscribe = function (subscriber) {
        var ish = this.ish;
        var scheduler = this.scheduler;
        if (scheduler == null) {
            return ish[observable_1.observable]().subscribe(subscriber);
        }
        else {
            return ish[observable_1.observable]().subscribe(new observeOn_1.ObserveOnSubscriber(subscriber, scheduler, 0));
        }
    };
    return FromObservable;
}(Observable_1.Observable));
exports.FromObservable = FromObservable;

},{"../Observable":2,"../operator/observeOn":21,"../symbol/iterator":23,"../symbol/observable":24,"../util/isArray":28,"../util/isArrayLike":29,"../util/isPromise":32,"./ArrayLikeObservable":10,"./ArrayObservable":11,"./IteratorObservable":14,"./PromiseObservable":15}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var root_1 = require('../util/root');
var Observable_1 = require('../Observable');
var iterator_1 = require('../symbol/iterator');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var IteratorObservable = (function (_super) {
    __extends(IteratorObservable, _super);
    function IteratorObservable(iterator, scheduler) {
        _super.call(this);
        this.scheduler = scheduler;
        if (iterator == null) {
            throw new Error('iterator cannot be null.');
        }
        this.iterator = getIterator(iterator);
    }
    IteratorObservable.create = function (iterator, scheduler) {
        return new IteratorObservable(iterator, scheduler);
    };
    IteratorObservable.dispatch = function (state) {
        var index = state.index, hasError = state.hasError, iterator = state.iterator, subscriber = state.subscriber;
        if (hasError) {
            subscriber.error(state.error);
            return;
        }
        var result = iterator.next();
        if (result.done) {
            subscriber.complete();
            return;
        }
        subscriber.next(result.value);
        state.index = index + 1;
        if (subscriber.closed) {
            if (typeof iterator.return === 'function') {
                iterator.return();
            }
            return;
        }
        this.schedule(state);
    };
    IteratorObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var _a = this, iterator = _a.iterator, scheduler = _a.scheduler;
        if (scheduler) {
            return scheduler.schedule(IteratorObservable.dispatch, 0, {
                index: index, iterator: iterator, subscriber: subscriber
            });
        }
        else {
            do {
                var result = iterator.next();
                if (result.done) {
                    subscriber.complete();
                    break;
                }
                else {
                    subscriber.next(result.value);
                }
                if (subscriber.closed) {
                    if (typeof iterator.return === 'function') {
                        iterator.return();
                    }
                    break;
                }
            } while (true);
        }
    };
    return IteratorObservable;
}(Observable_1.Observable));
exports.IteratorObservable = IteratorObservable;
var StringIterator = (function () {
    function StringIterator(str, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = str.length; }
        this.str = str;
        this.idx = idx;
        this.len = len;
    }
    StringIterator.prototype[iterator_1.iterator] = function () { return (this); };
    StringIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.str.charAt(this.idx++)
        } : {
            done: true,
            value: undefined
        };
    };
    return StringIterator;
}());
var ArrayIterator = (function () {
    function ArrayIterator(arr, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = toLength(arr); }
        this.arr = arr;
        this.idx = idx;
        this.len = len;
    }
    ArrayIterator.prototype[iterator_1.iterator] = function () { return this; };
    ArrayIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.arr[this.idx++]
        } : {
            done: true,
            value: undefined
        };
    };
    return ArrayIterator;
}());
function getIterator(obj) {
    var i = obj[iterator_1.iterator];
    if (!i && typeof obj === 'string') {
        return new StringIterator(obj);
    }
    if (!i && obj.length !== undefined) {
        return new ArrayIterator(obj);
    }
    if (!i) {
        throw new TypeError('object is not iterable');
    }
    return obj[iterator_1.iterator]();
}
var maxSafeInteger = Math.pow(2, 53) - 1;
function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) {
        return 0;
    }
    if (len === 0 || !numberIsFinite(len)) {
        return len;
    }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) {
        return 0;
    }
    if (len > maxSafeInteger) {
        return maxSafeInteger;
    }
    return len;
}
function numberIsFinite(value) {
    return typeof value === 'number' && root_1.root.isFinite(value);
}
function sign(value) {
    var valueAsNumber = +value;
    if (valueAsNumber === 0) {
        return valueAsNumber;
    }
    if (isNaN(valueAsNumber)) {
        return valueAsNumber;
    }
    return valueAsNumber < 0 ? -1 : 1;
}

},{"../Observable":2,"../symbol/iterator":23,"../util/root":34}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var root_1 = require('../util/root');
var Observable_1 = require('../Observable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var PromiseObservable = (function (_super) {
    __extends(PromiseObservable, _super);
    function PromiseObservable(promise, scheduler) {
        _super.call(this);
        this.promise = promise;
        this.scheduler = scheduler;
    }
    /**
     * Converts a Promise to an Observable.
     *
     * <span class="informal">Returns an Observable that just emits the Promise's
     * resolved value, then completes.</span>
     *
     * Converts an ES2015 Promise or a Promises/A+ spec compliant Promise to an
     * Observable. If the Promise resolves with a value, the output Observable
     * emits that resolved value as a `next`, and then completes. If the Promise
     * is rejected, then the output Observable emits the corresponding Error.
     *
     * @example <caption>Convert the Promise returned by Fetch to an Observable</caption>
     * var result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));
     * result.subscribe(x => console.log(x), e => console.error(e));
     *
     * @see {@link bindCallback}
     * @see {@link from}
     *
     * @param {PromiseLike<T>} promise The promise to be converted.
     * @param {Scheduler} [scheduler] An optional IScheduler to use for scheduling
     * the delivery of the resolved value (or the rejection).
     * @return {Observable<T>} An Observable which wraps the Promise.
     * @static true
     * @name fromPromise
     * @owner Observable
     */
    PromiseObservable.create = function (promise, scheduler) {
        return new PromiseObservable(promise, scheduler);
    };
    PromiseObservable.prototype._subscribe = function (subscriber) {
        var _this = this;
        var promise = this.promise;
        var scheduler = this.scheduler;
        if (scheduler == null) {
            if (this._isScalar) {
                if (!subscriber.closed) {
                    subscriber.next(this.value);
                    subscriber.complete();
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.closed) {
                        subscriber.next(value);
                        subscriber.complete();
                    }
                }, function (err) {
                    if (!subscriber.closed) {
                        subscriber.error(err);
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
        else {
            if (this._isScalar) {
                if (!subscriber.closed) {
                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });
                }
            }
            else {
                promise.then(function (value) {
                    _this.value = value;
                    _this._isScalar = true;
                    if (!subscriber.closed) {
                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
                    }
                }, function (err) {
                    if (!subscriber.closed) {
                        subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));
                    }
                })
                    .then(null, function (err) {
                    // escape the promise trap, throw unhandled errors
                    root_1.root.setTimeout(function () { throw err; });
                });
            }
        }
    };
    return PromiseObservable;
}(Observable_1.Observable));
exports.PromiseObservable = PromiseObservable;
function dispatchNext(arg) {
    var value = arg.value, subscriber = arg.subscriber;
    if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
    }
}
function dispatchError(arg) {
    var err = arg.err, subscriber = arg.subscriber;
    if (!subscriber.closed) {
        subscriber.error(err);
    }
}

},{"../Observable":2,"../util/root":34}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var RangeObservable = (function (_super) {
    __extends(RangeObservable, _super);
    function RangeObservable(start, count, scheduler) {
        _super.call(this);
        this.start = start;
        this._count = count;
        this.scheduler = scheduler;
    }
    /**
     * Creates an Observable that emits a sequence of numbers within a specified
     * range.
     *
     * <span class="informal">Emits a sequence of numbers in a range.</span>
     *
     * <img src="./img/range.png" width="100%">
     *
     * `range` operator emits a range of sequential integers, in order, where you
     * select the `start` of the range and its `length`. By default, uses no
     * IScheduler and just delivers the notifications synchronously, but may use
     * an optional IScheduler to regulate those deliveries.
     *
     * @example <caption>Emits the numbers 1 to 10</caption>
     * var numbers = Rx.Observable.range(1, 10);
     * numbers.subscribe(x => console.log(x));
     *
     * @see {@link timer}
     * @see {@link interval}
     *
     * @param {number} [start=0] The value of the first integer in the sequence.
     * @param {number} [count=0] The number of sequential integers to generate.
     * @param {Scheduler} [scheduler] A {@link IScheduler} to use for scheduling
     * the emissions of the notifications.
     * @return {Observable} An Observable of numbers that emits a finite range of
     * sequential integers.
     * @static true
     * @name range
     * @owner Observable
     */
    RangeObservable.create = function (start, count, scheduler) {
        if (start === void 0) { start = 0; }
        if (count === void 0) { count = 0; }
        return new RangeObservable(start, count, scheduler);
    };
    RangeObservable.dispatch = function (state) {
        var start = state.start, index = state.index, count = state.count, subscriber = state.subscriber;
        if (index >= count) {
            subscriber.complete();
            return;
        }
        subscriber.next(start);
        if (subscriber.closed) {
            return;
        }
        state.index = index + 1;
        state.start = start + 1;
        this.schedule(state);
    };
    RangeObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var start = this.start;
        var count = this._count;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(RangeObservable.dispatch, 0, {
                index: index, count: count, start: start, subscriber: subscriber
            });
        }
        else {
            do {
                if (index++ >= count) {
                    subscriber.complete();
                    break;
                }
                subscriber.next(start++);
                if (subscriber.closed) {
                    break;
                }
            } while (true);
        }
    };
    return RangeObservable;
}(Observable_1.Observable));
exports.RangeObservable = RangeObservable;

},{"../Observable":2}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
var ScalarObservable = (function (_super) {
    __extends(ScalarObservable, _super);
    function ScalarObservable(value, scheduler) {
        _super.call(this);
        this.value = value;
        this.scheduler = scheduler;
        this._isScalar = true;
        if (scheduler) {
            this._isScalar = false;
        }
    }
    ScalarObservable.create = function (value, scheduler) {
        return new ScalarObservable(value, scheduler);
    };
    ScalarObservable.dispatch = function (state) {
        var done = state.done, value = state.value, subscriber = state.subscriber;
        if (done) {
            subscriber.complete();
            return;
        }
        subscriber.next(value);
        if (subscriber.closed) {
            return;
        }
        state.done = true;
        this.schedule(state);
    };
    ScalarObservable.prototype._subscribe = function (subscriber) {
        var value = this.value;
        var scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ScalarObservable.dispatch, 0, {
                done: false, value: value, subscriber: subscriber
            });
        }
        else {
            subscriber.next(value);
            if (!subscriber.closed) {
                subscriber.complete();
            }
        }
    };
    return ScalarObservable;
}(Observable_1.Observable));
exports.ScalarObservable = ScalarObservable;

},{"../Observable":2}],18:[function(require,module,exports){
"use strict";
var FromObservable_1 = require('./FromObservable');
exports.from = FromObservable_1.FromObservable.create;

},{"./FromObservable":13}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
/* tslint:enable:max-line-length */
/**
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate.
 *
 * <span class="informal">Like
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
 * it only emits a value from the source if it passes a criterion function.</span>
 *
 * <img src="./img/filter.png" width="100%">
 *
 * Similar to the well-known `Array.prototype.filter` method, this operator
 * takes values from the source Observable, passes them through a `predicate`
 * function and only emits those values that yielded `true`.
 *
 * @example <caption>Emit only click events whose target was a DIV element</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');
 * clicksOnDivs.subscribe(x => console.log(x));
 *
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}
 *
 * @param {function(value: T, index: number): boolean} predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted, if `false` the value is not passed to the output
 * Observable. The `index` parameter is the number `i` for the i-th source
 * emission that has happened since the subscription, starting from the number
 * `0`.
 * @param {any} [thisArg] An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return {Observable} An Observable of values from the source that were
 * allowed by the `predicate` function.
 * @method filter
 * @owner Observable
 */
function filter(predicate, thisArg) {
    return this.lift(new FilterOperator(predicate, thisArg));
}
exports.filter = filter;
var FilterOperator = (function () {
    function FilterOperator(predicate, thisArg) {
        this.predicate = predicate;
        this.thisArg = thisArg;
    }
    FilterOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
    };
    return FilterOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var FilterSubscriber = (function (_super) {
    __extends(FilterSubscriber, _super);
    function FilterSubscriber(destination, predicate, thisArg) {
        _super.call(this, destination);
        this.predicate = predicate;
        this.thisArg = thisArg;
        this.count = 0;
    }
    // the try catch block below is left specifically for
    // optimization and perf reasons. a tryCatcher is not necessary here.
    FilterSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.predicate.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        if (result) {
            this.destination.next(value);
        }
    };
    return FilterSubscriber;
}(Subscriber_1.Subscriber));

},{"../Subscriber":4}],20:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
/**
 * Applies a given `project` function to each value emitted by the source
 * Observable, and emits the resulting values as an Observable.
 *
 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
 * it passes each source value through a transformation function to get
 * corresponding output values.</span>
 *
 * <img src="./img/map.png" width="100%">
 *
 * Similar to the well known `Array.prototype.map` function, this operator
 * applies a projection to each value and emits that projection in the output
 * Observable.
 *
 * @example <caption>Map every click to the clientX position of that click</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var positions = clicks.map(ev => ev.clientX);
 * positions.subscribe(x => console.log(x));
 *
 * @see {@link mapTo}
 * @see {@link pluck}
 *
 * @param {function(value: T, index: number): R} project The function to apply
 * to each `value` emitted by the source Observable. The `index` parameter is
 * the number `i` for the i-th emission that has happened since the
 * subscription, starting from the number `0`.
 * @param {any} [thisArg] An optional argument to define what `this` is in the
 * `project` function.
 * @return {Observable<R>} An Observable that emits the values from the source
 * Observable transformed by the given `project` function.
 * @method map
 * @owner Observable
 */
function map(project, thisArg) {
    if (typeof project !== 'function') {
        throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
    }
    return this.lift(new MapOperator(project, thisArg));
}
exports.map = map;
var MapOperator = (function () {
    function MapOperator(project, thisArg) {
        this.project = project;
        this.thisArg = thisArg;
    }
    MapOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
    };
    return MapOperator;
}());
exports.MapOperator = MapOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var MapSubscriber = (function (_super) {
    __extends(MapSubscriber, _super);
    function MapSubscriber(destination, project, thisArg) {
        _super.call(this, destination);
        this.project = project;
        this.count = 0;
        this.thisArg = thisArg || this;
    }
    // NOTE: This looks unoptimized, but it's actually purposefully NOT
    // using try/catch optimizations.
    MapSubscriber.prototype._next = function (value) {
        var result;
        try {
            result = this.project.call(this.thisArg, value, this.count++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.destination.next(result);
    };
    return MapSubscriber;
}(Subscriber_1.Subscriber));

},{"../Subscriber":4}],21:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Notification_1 = require('../Notification');
/**
 *
 * Re-emits all notifications from source Observable with specified scheduler.
 *
 * <span class="informal">Ensure a specific scheduler is used, from outside of an Observable.</span>
 *
 * `observeOn` is an operator that accepts a scheduler as a first parameter, which will be used to reschedule
 * notifications emitted by the source Observable. It might be useful, if you do not have control over
 * internal scheduler of a given Observable, but want to control when its values are emitted nevertheless.
 *
 * Returned Observable emits the same notifications (nexted values, complete and error events) as the source Observable,
 * but rescheduled with provided scheduler. Note that this doesn't mean that source Observables internal
 * scheduler will be replaced in any way. Original scheduler still will be used, but when the source Observable emits
 * notification, it will be immediately scheduled again - this time with scheduler passed to `observeOn`.
 * An anti-pattern would be calling `observeOn` on Observable that emits lots of values synchronously, to split
 * that emissions into asynchronous chunks. For this to happen, scheduler would have to be passed into the source
 * Observable directly (usually into the operator that creates it). `observeOn` simply delays notifications a
 * little bit more, to ensure that they are emitted at expected moments.
 *
 * As a matter of fact, `observeOn` accepts second parameter, which specifies in milliseconds with what delay notifications
 * will be emitted. The main difference between {@link delay} operator and `observeOn` is that `observeOn`
 * will delay all notifications - including error notifications - while `delay` will pass through error
 * from source Observable immediately when it is emitted. In general it is highly recommended to use `delay` operator
 * for any kind of delaying of values in the stream, while using `observeOn` to specify which scheduler should be used
 * for notification emissions in general.
 *
 * @example <caption>Ensure values in subscribe are called just before browser repaint.</caption>
 * const intervals = Rx.Observable.interval(10); // Intervals are scheduled
 *                                               // with async scheduler by default...
 *
 * intervals
 * .observeOn(Rx.Scheduler.animationFrame)       // ...but we will observe on animationFrame
 * .subscribe(val => {                           // scheduler to ensure smooth animation.
 *   someDiv.style.height = val + 'px';
 * });
 *
 * @see {@link delay}
 *
 * @param {IScheduler} scheduler Scheduler that will be used to reschedule notifications from source Observable.
 * @param {number} [delay] Number of milliseconds that states with what delay every notification should be rescheduled.
 * @return {Observable<T>} Observable that emits the same notifications as the source Observable,
 * but with provided scheduler.
 *
 * @method observeOn
 * @owner Observable
 */
function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return this.lift(new ObserveOnOperator(scheduler, delay));
}
exports.observeOn = observeOn;
var ObserveOnOperator = (function () {
    function ObserveOnOperator(scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
    };
    return ObserveOnOperator;
}());
exports.ObserveOnOperator = ObserveOnOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ObserveOnSubscriber = (function (_super) {
    __extends(ObserveOnSubscriber, _super);
    function ObserveOnSubscriber(destination, scheduler, delay) {
        if (delay === void 0) { delay = 0; }
        _super.call(this, destination);
        this.scheduler = scheduler;
        this.delay = delay;
    }
    ObserveOnSubscriber.dispatch = function (arg) {
        var notification = arg.notification, destination = arg.destination;
        notification.observe(destination);
        this.unsubscribe();
    };
    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
    };
    ObserveOnSubscriber.prototype._next = function (value) {
        this.scheduleMessage(Notification_1.Notification.createNext(value));
    };
    ObserveOnSubscriber.prototype._error = function (err) {
        this.scheduleMessage(Notification_1.Notification.createError(err));
    };
    ObserveOnSubscriber.prototype._complete = function () {
        this.scheduleMessage(Notification_1.Notification.createComplete());
    };
    return ObserveOnSubscriber;
}(Subscriber_1.Subscriber));
exports.ObserveOnSubscriber = ObserveOnSubscriber;
var ObserveOnMessage = (function () {
    function ObserveOnMessage(notification, destination) {
        this.notification = notification;
        this.destination = destination;
    }
    return ObserveOnMessage;
}());
exports.ObserveOnMessage = ObserveOnMessage;

},{"../Notification":1,"../Subscriber":4}],22:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
/* tslint:enable:max-line-length */
/**
 * Applies an accumulator function over the source Observable, and returns the
 * accumulated result when the source completes, given an optional seed value.
 *
 * <span class="informal">Combines together all values emitted on the source,
 * using an accumulator function that knows how to join a new source value into
 * the accumulation from the past.</span>
 *
 * <img src="./img/reduce.png" width="100%">
 *
 * Like
 * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
 * `reduce` applies an `accumulator` function against an accumulation and each
 * value of the source Observable (from the past) to reduce it to a single
 * value, emitted on the output Observable. Note that `reduce` will only emit
 * one value, only when the source Observable completes. It is equivalent to
 * applying operator {@link scan} followed by operator {@link last}.
 *
 * Returns an Observable that applies a specified `accumulator` function to each
 * item emitted by the source Observable. If a `seed` value is specified, then
 * that value will be used as the initial value for the accumulator. If no seed
 * value is specified, the first item of the source is used as the seed.
 *
 * @example <caption>Count the number of click events that happened in 5 seconds</caption>
 * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')
 *   .takeUntil(Rx.Observable.interval(5000));
 * var ones = clicksInFiveSeconds.mapTo(1);
 * var seed = 0;
 * var count = ones.reduce((acc, one) => acc + one, seed);
 * count.subscribe(x => console.log(x));
 *
 * @see {@link count}
 * @see {@link expand}
 * @see {@link mergeScan}
 * @see {@link scan}
 *
 * @param {function(acc: R, value: T, index: number): R} accumulator The accumulator function
 * called on each source value.
 * @param {R} [seed] The initial accumulation value.
 * @return {Observable<R>} An Observable that emits a single value that is the
 * result of accumulating the values emitted by the source Observable.
 * @method reduce
 * @owner Observable
 */
function reduce(accumulator, seed) {
    var hasSeed = false;
    // providing a seed of `undefined` *should* be valid and trigger
    // hasSeed! so don't use `seed !== undefined` checks!
    // For this reason, we have to check it here at the original call site
    // otherwise inside Operator/Subscriber we won't know if `undefined`
    // means they didn't provide anything or if they literally provided `undefined`
    if (arguments.length >= 2) {
        hasSeed = true;
    }
    return this.lift(new ReduceOperator(accumulator, seed, hasSeed));
}
exports.reduce = reduce;
var ReduceOperator = (function () {
    function ReduceOperator(accumulator, seed, hasSeed) {
        if (hasSeed === void 0) { hasSeed = false; }
        this.accumulator = accumulator;
        this.seed = seed;
        this.hasSeed = hasSeed;
    }
    ReduceOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ReduceSubscriber(subscriber, this.accumulator, this.seed, this.hasSeed));
    };
    return ReduceOperator;
}());
exports.ReduceOperator = ReduceOperator;
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ReduceSubscriber = (function (_super) {
    __extends(ReduceSubscriber, _super);
    function ReduceSubscriber(destination, accumulator, seed, hasSeed) {
        _super.call(this, destination);
        this.accumulator = accumulator;
        this.hasSeed = hasSeed;
        this.index = 0;
        this.hasValue = false;
        this.acc = seed;
        if (!this.hasSeed) {
            this.index++;
        }
    }
    ReduceSubscriber.prototype._next = function (value) {
        if (this.hasValue || (this.hasValue = this.hasSeed)) {
            this._tryReduce(value);
        }
        else {
            this.acc = value;
            this.hasValue = true;
        }
    };
    ReduceSubscriber.prototype._tryReduce = function (value) {
        var result;
        try {
            result = this.accumulator(this.acc, value, this.index++);
        }
        catch (err) {
            this.destination.error(err);
            return;
        }
        this.acc = result;
    };
    ReduceSubscriber.prototype._complete = function () {
        if (this.hasValue || this.hasSeed) {
            this.destination.next(this.acc);
        }
        this.destination.complete();
    };
    return ReduceSubscriber;
}(Subscriber_1.Subscriber));
exports.ReduceSubscriber = ReduceSubscriber;

},{"../Subscriber":4}],23:[function(require,module,exports){
"use strict";
var root_1 = require('../util/root');
function symbolIteratorPonyfill(root) {
    var Symbol = root.Symbol;
    if (typeof Symbol === 'function') {
        if (!Symbol.iterator) {
            Symbol.iterator = Symbol('iterator polyfill');
        }
        return Symbol.iterator;
    }
    else {
        // [for Mozilla Gecko 27-35:](https://mzl.la/2ewE1zC)
        var Set_1 = root.Set;
        if (Set_1 && typeof new Set_1()['@@iterator'] === 'function') {
            return '@@iterator';
        }
        var Map_1 = root.Map;
        // required for compatability with es6-shim
        if (Map_1) {
            var keys = Object.getOwnPropertyNames(Map_1.prototype);
            for (var i = 0; i < keys.length; ++i) {
                var key = keys[i];
                // according to spec, Map.prototype[@@iterator] and Map.orototype.entries must be equal.
                if (key !== 'entries' && key !== 'size' && Map_1.prototype[key] === Map_1.prototype['entries']) {
                    return key;
                }
            }
        }
        return '@@iterator';
    }
}
exports.symbolIteratorPonyfill = symbolIteratorPonyfill;
exports.iterator = symbolIteratorPonyfill(root_1.root);
/**
 * @deprecated use iterator instead
 */
exports.$$iterator = exports.iterator;

},{"../util/root":34}],24:[function(require,module,exports){
"use strict";
var root_1 = require('../util/root');
function getSymbolObservable(context) {
    var $$observable;
    var Symbol = context.Symbol;
    if (typeof Symbol === 'function') {
        if (Symbol.observable) {
            $$observable = Symbol.observable;
        }
        else {
            $$observable = Symbol('observable');
            Symbol.observable = $$observable;
        }
    }
    else {
        $$observable = '@@observable';
    }
    return $$observable;
}
exports.getSymbolObservable = getSymbolObservable;
exports.observable = getSymbolObservable(root_1.root);
/**
 * @deprecated use observable instead
 */
exports.$$observable = exports.observable;

},{"../util/root":34}],25:[function(require,module,exports){
"use strict";
var root_1 = require('../util/root');
var Symbol = root_1.root.Symbol;
exports.rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
    Symbol.for('rxSubscriber') : '@@rxSubscriber';
/**
 * @deprecated use rxSubscriber instead
 */
exports.$$rxSubscriber = exports.rxSubscriber;

},{"../util/root":34}],26:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * An error thrown when one or more errors have occurred during the
 * `unsubscribe` of a {@link Subscription}.
 */
var UnsubscriptionError = (function (_super) {
    __extends(UnsubscriptionError, _super);
    function UnsubscriptionError(errors) {
        _super.call(this);
        this.errors = errors;
        var err = Error.call(this, errors ?
            errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n  ') : '');
        this.name = err.name = 'UnsubscriptionError';
        this.stack = err.stack;
        this.message = err.message;
    }
    return UnsubscriptionError;
}(Error));
exports.UnsubscriptionError = UnsubscriptionError;

},{}],27:[function(require,module,exports){
"use strict";
// typeof any so that it we don't have to cast when comparing a result to the error object
exports.errorObject = { e: {} };

},{}],28:[function(require,module,exports){
"use strict";
exports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });

},{}],29:[function(require,module,exports){
"use strict";
exports.isArrayLike = (function (x) { return x && typeof x.length === 'number'; });

},{}],30:[function(require,module,exports){
"use strict";
function isFunction(x) {
    return typeof x === 'function';
}
exports.isFunction = isFunction;

},{}],31:[function(require,module,exports){
"use strict";
function isObject(x) {
    return x != null && typeof x === 'object';
}
exports.isObject = isObject;

},{}],32:[function(require,module,exports){
"use strict";
function isPromise(value) {
    return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
}
exports.isPromise = isPromise;

},{}],33:[function(require,module,exports){
"use strict";
function isScheduler(value) {
    return value && typeof value.schedule === 'function';
}
exports.isScheduler = isScheduler;

},{}],34:[function(require,module,exports){
(function (global){
"use strict";
// CommonJS / Node have global context exposed as "global" variable.
// We don't want to include the whole node.d.ts this this compilation unit so we'll just fake
// the global "global" var for now.
var __window = typeof window !== 'undefined' && window;
var __self = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' &&
    self instanceof WorkerGlobalScope && self;
var __global = typeof global !== 'undefined' && global;
var _root = __window || __global || __self;
exports.root = _root;
// Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.
// This is needed when used with angular/tsickle which inserts a goog.module statement.
// Wrap in IIFE
(function () {
    if (!_root) {
        throw new Error('RxJS could not find any global context (window, self, global)');
    }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],35:[function(require,module,exports){
"use strict";
var Subscriber_1 = require('../Subscriber');
var rxSubscriber_1 = require('../symbol/rxSubscriber');
var Observer_1 = require('../Observer');
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber_1.rxSubscriber]) {
            return nextOrObserver[rxSubscriber_1.rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber_1.Subscriber(Observer_1.empty);
    }
    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
}
exports.toSubscriber = toSubscriber;

},{"../Observer":3,"../Subscriber":4,"../symbol/rxSubscriber":25}],36:[function(require,module,exports){
"use strict";
var errorObject_1 = require('./errorObject');
var tryCatchTarget;
function tryCatcher() {
    try {
        return tryCatchTarget.apply(this, arguments);
    }
    catch (e) {
        errorObject_1.errorObject.e = e;
        return errorObject_1.errorObject;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}
exports.tryCatch = tryCatch;
;

},{"./errorObject":27}],37:[function(require,module,exports){
module.exports={
	"FOER0000":"Unidentified error.",
	"FOAP0001":"",
	"FOAR0001":"Division by zero.",
	"FOAR0002":"Numeric operation overflow/underflow.",
	"FOAY0001":"",
	"FOAY0002":"",
	"FOCA0001":"Input value too large for decimal.",
	"FOCA0002":"Invalid lexical value.",
	"FOCA0003":"Input value too large for integer.",
	"FOCA0005":"NaN supplied as float/double value.",
	"FOCA0006":"String to be cast to decimal has too many digits of precision.",
	"FOCH0001":"Codepoint not valid.",
	"FOCH0002":"Unsupported collation.",
	"FOCH0003":"Unsupported normalization form.",
	"FOCH0004":"Collation does not support collation units.",
	"FODC0001":"No context document.",
	"FODC0002":"Error retrieving resource.",
	"FODC0003":"Function not defined as deterministic.",
	"FODC0004":"Invalid argument to fn:collection.",
	"FODC0005":"Invalid argument to fn:doc or fn:doc-available.",
	"FODC0006":"String passed to fn:parse-xml is not a well-formed XML document.",
	"FODC0010":"The processor does not support serialization.",
	"FODF1280":"Invalid decimal format name.",
	"FODF1310":"Invalid decimal format picture string.",
	"FODT0001":"Overflow/underflow in date/time operation.",
	"FODT0002":"Overflow/underflow in duration operation.",
	"FODT0003":"Invalid timezone value.",
	"FOFD1340":"Invalid date/time formatting parameters.",
	"FOFD1350":"Invalid date/time formatting component.",
	"FOJS0001":"",
	"FOJS0003":"",
	"FOJS0004":"",
	"FOJS0005":"",
	"FOJS0006":"",
	"FOJS0007":"",
	"FONS0004":"No namespace found for prefix.",
	"FONS0005":"Base-uri not defined in the static context.",
	"FOQM0001":"",
	"FOQM0002":"",
	"FOQM0003":"",
	"FOQM0004":"",
	"FOQM0005":"",
	"FOQM0006":"",
	"FOQM0007":"",
	"FORG0001":"Invalid value for cast/constructor.",
	"FORG0002":"Invalid argument to fn:resolve-uri().",
	"FORG0003":"fn:zero-or-one called with a sequence containing more than one item.",
	"FORG0004":"fn:one-or-more called with a sequence containing no items.",
	"FORG0005":"fn:exactly-one called with a sequence containing zero or more than one item.",
	"FORG0006":"Invalid argument type.",
	"FORG0008":"The two arguments to fn:dateTime have inconsistent timezones.",
	"FORG0009":"Error in resolving a relative URI against a base URI in fn:resolve-uri.",
	"FORG0010":"",
	"FORX0001":"Invalid regular expression flags.",
	"FORX0002":"Invalid regular expression.",
	"FORX0003":"Regular expression matches zero-length string.",
	"FORX0004":"Invalid replacement string.",
	"FOTY0012":"Argument to fn:data() contains a node that does not have a typed value.",
	"FOTY0013":"The argument to fn:data() contains a function item.",
	"FOTY0014":"The argument to fn:string() is a function item.",
	"FOTY0015":"An argument to fn:deep-equal() contains a function item.",
	"FOUT1170":"Invalid $href argument to fn:unparsed-text() (etc.)",
	"FOUT1190":"Cannot decode resource retrieved by fn:unparsed-text() (etc.)",
	"FOUT1200":"Cannot infer encoding of resource retrieved by fn:unparsed-text() (etc.)",
	"FOXT0001":"",
	"FOXT0002":"",
	"FOXT0003":"",
	"FOXT0004":"",
	"XTSE0010":"",
	"XTSE0020":"",
	"XTDE0030":"",
	"XTDE0050":"",
	"XTDE0044":"",
	"XTDE0045":"",
	"XTDE0040":"",
	"XTDE0047":"",
	"XTDE0041":"",
	"XTDE0047":"",
	"XTSE0090":"",
	"XTSE3000":"",
	"XTSE3005":"",
	"XTSE3010":"",
	"XTSE3020":"",
	"XTSE3025":"",
	"XTSE3030":"",
	"XTSE3040":"",
	"XTSE3050":"",
	"XTDE3052":"",
	"XTSE3055":"",
	"XTSE3058":"",
	"XTSE3060":"",
	"XTSE3070":"",
	"XTSE3075":"",
	"XTSE3080":"",
	"XTSE3085":"",
	"XTSE3087":"",
	"XTSE3089":"",
	"XTSE0110":"",
	"XTSE0120":"",
	"XTSE0125":"",
	"XTSE0130":"",
	"XTSE0150":"",
	"XTDE0160":"",
	"XTSE0165":"",
	"XTSE0170":"",
	"XTSE0180":"",
	"XTSE0190":"",
	"XTSE0200":"",
	"XTSE0210":"",
	"XTSE0215":"",
	"XTSE0220":"",
	"XTSE0260":"",
	"XTSE0265":"",
	"XTSE0270":"",
	"XTRE0270":"",
	"XTSE0280":"",
	"XTDE0290":"",
	"XTSE0080":"",
	"XTSE1290":"",
	"XTSE1295":"",
	"XTSE1300":"",
	"XTSE0340":"",
	"XTSE0350":"",
	"XTSE0370":"",
	"XTDE0410":"",
	"XTDE0420":"",
	"XTDE0430":"",
	"XTDE0440":"",
	"XTDE0450":"",
	"XTSE0500":"",
	"XTTE0505":"",
	"XTTE0510":"",
	"XTTE0520":"",
	"XTSE0530":"",
	"XTDE0540":"",
	"XTSE0542":"",
	"XTSE0545":"",
	"XTDE0548":"",
	"XTSE0550":"",
	"XTSE3440":"",
	"XTTE3100":"",
	"XTSE3105":"",
	"XTTE3110":"",
	"XTDE0555":"",
	"XTSE3460":"",
	"XTDE0560":"",
	"XTSE3120":"",
	"XTSE3125":"",
	"XTSE3130":"",
	"XTSE3140":"",
	"XTSE3150":"",
	"XTDE3530":"",
	"XTTE0570":"",
	"XTSE0580":"",
	"XTTE0590":"",
	"XTSE3520":"",
	"XTSE0690":"",
	"XTDE0700":"",
	"XTSE0620":"",
	"XTSE0630":"",
	"XTSE3450":"",
	"XTSE0670":"",
	"XTDE0640":"",
	"XTSE0650":"",
	"XTSE0660":"",
	"XTSE3340":"",
	"XTSE3088":"",
	"XTTE3090":"",
	"XTSE0680":"",
	"XTSE0710":"",
	"XTSE0720":"",
	"XTSE0730":"",
	"XTSE0740":"",
	"XTSE0760":"",
	"XTTE0790":"",
	"XTTE0780":"",
	"XTSE0770":"",
	"XTSE3155":"",
	"XTDE3160":"",
	"XTTE3170":"",
	"XTTE3210":"",
	"XTDE3175":"",
	"XTRE0795":"",
	"XTSE0805":"",
	"XTSE0808":"",
	"XTSE0809":"",
	"XTSE0810":"",
	"XTSE0812":"",
	"XTDE0820":"",
	"XTDE0830":"",
	"XTDE0835":"",
	"XTSE0840":"",
	"XTDE0850":"",
	"XTDE0855":"",
	"XTDE0860":"",
	"XTDE0865":"",
	"XTSE0870":"",
	"XTSE0880":"",
	"XTDE0890":"",
	"XTDE0905":"",
	"XTSE0910":"",
	"XTDE0920":"",
	"XTDE0925":"",
	"XTDE0930":"",
	"XTSE0940":"",
	"XTTE0945":"",
	"XTTE3180":"",
	"XTTE0950":"",
	"XTTE3330":"",
	"XTSE3185":"",
	"XTSE0975":"",
	"XTDE0980":"",
	"XTTE0990":"",
	"XTTE1000":"",
	"XTDE1001":"",
	"XTSE1015":"",
	"XTSE1017":"",
	"XTTE1020":"",
	"XTDE1030":"",
	"XTDE1035":"",
	"XTSE1040":"",
	"XTSE1080":"",
	"XTSE1090":"",
	"XTTE1100":"",
	"XTDE1110":"",
	"XTTE1120":"",
	"XTSE3195":"",
	"XTSE3190":"",
	"XTSE3200":"",
	"XTSE2200":"",
	"XTDE2210":"",
	"XTDE2220":"",
	"XTTE2230":"",
	"XTSE1130":"",
	"XTDE1140":"",
	"XTDE1145":"",
	"XTDE1150":"",
	"XTSE3300":"",
	"XTSE3350":"",
	"XTSE3360":"",
	"XTSE3430":"",
	"XTSE1205":"",
	"XTSE1210":"",
	"XTSE1220":"",
	"XTSE1222":"",
	"XTDE3365":"",
	"XTTE3375":"",
	"XTSE3280":"",
	"XTMM9000":"",
	"XTMM9001":"",
	"XTSE0085":"",
	"XTDE1420":"",
	"XTDE1425":"",
	"XTSE1430":"",
	"XTDE1450":"",
	"XTDE1460":"",
	"XTDE1480":"",
	"XTDE1490":"",
	"XTRE1495":"",
	"XTDE1500":"",
	"XTSE1505":"",
	"XTTE1510":"",
	"XTTE1512":"",
	"XTTE1515":"",
	"XTSE1520":"",
	"XTSE1530":"",
	"XTTE1535":"",
	"XTTE1540":"",
	"XTTE1545":"",
	"XTTE1550":"",
	"XTTE1555":"",
	"XTSE1560":"",
	"XTSE1570":"",
	"XTSE1580":"",
	"XTSE1590":"",
	"XTSE1600":"",
	"XTRE1620":"",
	"XTRE1630":"",
	"XTSE1650":"",
	"XTSE1660":"",
	"XTDE1665":"",
	"XPST0001":"",
	"XPDY0002":"",
	"XPST0003":"",
	"XPTY0004":"",
	"XPST0005":"",
	"XPST0008":"",
	"XQST0009":"",
	"XPST0010":"",
	"XQST0012":"",
	"XQST0013":"",
	"XQST0016":"",
	"XPST0017":"",
	"XPTY0018":"",
	"XPTY0019":"",
	"XPTY0020":"",
	"XQST0022":"",
	"XQTY0024":"",
	"XQDY0025":"",
	"XQDY0026":"",
	"XQDY0027":"",
	"XQTY0030":"",
	"XQST0031":"",
	"XQST0032":"",
	"XQST0033":"",
	"XQST0034":"",
	"XQST0035":"",
	"XQST0038":"",
	"XPST0039":"",
	"XQST0040":"",
	"XQDY0041":"",
	"XQDY0044":"",
	"XQST0045":"",
	"XPST0046":"",
	"XQST0047":"",
	"XQST0048":"",
	"XQST0049":"",
	"XPDY0050":"",
	"XPST0051":"",
	"XPST0052":"",
	"XQDY0054":"",
	"XQST0055":"",
	"XQST0057":"",
	"XQST0058":"",
	"XQST0059":"",
	"XQST0060":"",
	"XQDY0061":"",
	"XQDY0064":"",
	"XQST0065":"",
	"XQST0066":"",
	"XQST0067":"",
	"XQST0068":"",
	"XQST0069":"",
	"XPST0070":"",
	"XQST0071":"",
	"XQDY0072":"",
	"XQDY0074":"",
	"XQST0075":"",
	"XQST0076":"",
	"XQST0079":"",
	"XPST0080":"",
	"XPST0081":"",
	"XQDY0084":"",
	"XQST0085":"",
	"XQTY0086":"",
	"XQST0087":"",
	"XQST0088":"",
	"XQST0089":"",
	"XQST0090":"",
	"XQDY0091":"",
	"XQDY0092":"",
	"XQST0094":"",
	"XQDY0096":"",
	"XQST0097":"",
	"XQST0098":"",
	"XQST0099":"",
	"XQDY0101":"",
	"XQDY0102":"",
	"XQST0103":"",
	"XQST0104":"",
	"XQTY0105":"",
	"XQST0106":"",
	"XQST0108":"",
	"XQST0109":"",
	"XQST0110":"",
	"XQST0111":"",
	"XQST0113":"",
	"XQST0114":"",
	"XQST0115":"",
	"XQST0116":"",
	"XPTY0117":"",
	"XQST0118":"",
	"XQST0119":"",
	"XQST0125":"",
	"XQST0129":"",
	"XPDY0130":"",
	"XPST0133":"",
	"XPST0134":"",
	"SESE0010":"",
	"SESE0020":"",
	"SEDE0030":"",
	"SEDE0050":"",
	"SEDE0044":"",
	"SEDE0045":"",
	"SEDE0040":"",
	"SEDE0047":"",
	"SEDE0041":"",
	"SEDE0047":"",
	"SESE0090":"",
	"SESE3000":"",
	"SESE3005":"",
	"SESE3010":"",
	"SESE3020":"",
	"SESE3025":"",
	"SESE3030":"",
	"SESE3040":"",
	"SESE3050":"",
	"SEDE3052":"",
	"SESE3055":"",
	"SESE3058":"",
	"SESE3060":"",
	"SESE3070":"",
	"SESE3075":"",
	"SESE3080":"",
	"SESE3085":"",
	"SESE3087":"",
	"SESE3089":"",
	"SESE0110":"",
	"SESE0120":"",
	"SESE0125":"",
	"SESE0130":"",
	"SESE0150":"",
	"SEDE0160":"",
	"SESE0165":"",
	"SESE0170":"",
	"SESE0180":"",
	"SESE0190":"",
	"SESE0200":"",
	"SESE0210":"",
	"SESE0215":"",
	"SESE0220":"",
	"SESE0260":"",
	"SESE0265":"",
	"SESE0270":"",
	"SERE0270":"",
	"SESE0280":"",
	"SEDE0290":"",
	"SESE0080":"",
	"SESE1290":"",
	"SESE1295":"",
	"SESE1300":"",
	"SESE0340":"",
	"SESE0350":"",
	"SESE0370":"",
	"SEDE0410":"",
	"SEDE0420":"",
	"SEDE0430":"",
	"SEDE0440":"",
	"SEDE0450":"",
	"SESE0500":"",
	"SETE0505":"",
	"SETE0510":"",
	"SETE0520":"",
	"SESE0530":"",
	"SEDE0540":"",
	"SESE0542":"",
	"SESE0545":"",
	"SEDE0548":"",
	"SESE0550":"",
	"SESE3440":"",
	"SETE3100":"",
	"SESE3105":"",
	"SETE3110":"",
	"SEDE0555":"",
	"SESE3460":"",
	"SEDE0560":"",
	"SESE3120":"",
	"SESE3125":"",
	"SESE3130":"",
	"SESE3140":"",
	"SESE3150":"",
	"SEDE3530":"",
	"SETE0570":"",
	"SESE0580":"",
	"SETE0590":"",
	"SESE3520":"",
	"SESE0690":"",
	"SEDE0700":"",
	"SESE0620":"",
	"SESE0630":"",
	"SESE3450":"",
	"SESE0670":"",
	"SEDE0640":"",
	"SESE0650":"",
	"SESE0660":"",
	"SESE3340":"",
	"SESE3088":"",
	"SETE3090":"",
	"SESE0680":"",
	"SESE0710":"",
	"SESE0720":"",
	"SESE0730":"",
	"SESE0740":"",
	"SESE0760":"",
	"SETE0790":"",
	"SETE0780":"",
	"SESE0770":"",
	"SESE3155":"",
	"SEDE3160":"",
	"SETE3170":"",
	"SETE3210":"",
	"SEDE3175":"",
	"SERE0795":"",
	"SESE0805":"",
	"SESE0808":"",
	"SESE0809":"",
	"SESE0810":"",
	"SESE0812":"",
	"SEDE0820":"",
	"SEDE0830":"",
	"SEDE0835":"",
	"SESE0840":"",
	"SEDE0850":"",
	"SEDE0855":"",
	"SEDE0860":"",
	"SEDE0865":"",
	"SESE0870":"",
	"SESE0880":"",
	"SEDE0890":"",
	"SEDE0905":"",
	"SESE0910":"",
	"SEDE0920":"",
	"SEDE0925":"",
	"SEDE0930":"",
	"SESE0940":"",
	"SETE0945":"",
	"SETE3180":"",
	"SETE0950":"",
	"SETE3330":"",
	"SESE3185":"",
	"SESE0975":"",
	"SEDE0980":"",
	"SETE0990":"",
	"SETE1000":"",
	"SEDE1001":"",
	"SESE1015":"",
	"SESE1017":"",
	"SETE1020":"",
	"SEDE1030":"",
	"SEDE1035":"",
	"SESE1040":"",
	"SESE1080":"",
	"SESE1090":"",
	"SETE1100":"",
	"SEDE1110":"",
	"SETE1120":"",
	"SESE3195":"",
	"SESE3190":"",
	"SESE3200":"",
	"SESE2200":"",
	"SEDE2210":"",
	"SEDE2220":"",
	"SETE2230":"",
	"SESE1130":"",
	"SEDE1140":"",
	"SEDE1145":"",
	"SEDE1150":"",
	"SESE3300":"",
	"SESE3350":"",
	"SESE3360":"",
	"SESE3430":"",
	"SESE1205":"",
	"SESE1210":"",
	"SESE1220":"",
	"SESE1222":"",
	"SEDE3365":"",
	"SETE3375":"",
	"SESE3280":"",
	"SEMM9000":"",
	"SEMM9001":"",
	"SESE0085":"",
	"SEDE1420":"",
	"SEDE1425":"",
	"SESE1430":"",
	"SEDE1450":"",
	"SEDE1460":"",
	"SEDE1480":"",
	"SEDE1490":"",
	"SERE1495":"",
	"SEDE1500":"",
	"SESE1505":"",
	"SETE1510":"",
	"SETE1512":"",
	"SETE1515":"",
	"SESE1520":"",
	"SESE1530":"",
	"SETE1535":"",
	"SETE1540":"",
	"SETE1545":"",
	"SETE1550":"",
	"SETE1555":"",
	"SESE1560":"",
	"SESE1570":"",
	"SESE1580":"",
	"SESE1590":"",
	"SESE1600":"",
	"SERE1620":"",
	"SERE1630":"",
	"SESE1650":"",
	"SESE1660":"",
	"SEDE1665":""
}

},{}],38:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}],39:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.last = exports.position = exports.isVNode = undefined;
exports.VNodeIterator = VNodeIterator;
exports.Step = Step;
exports.nextNode = nextNode;
exports.stringify = stringify;
exports.firstChild = firstChild;
exports.nextSibling = nextSibling;
exports.getDoc = getDoc;
exports.lastChild = lastChild;
exports.parent = parent;
exports.self = self;
exports.iter = iter;
exports.cxFilter = cxFilter;
exports.element = element;
exports.attribute = attribute;
exports.text = text;
exports.node = node;
exports.child = child;
exports.followingSibling = followingSibling;
exports.select = select;
exports.isEmptyNode = isEmptyNode;
exports.name = name;

var _doc = require("./doc");

var _transducers = require("./transducers");

var _seq = require("./seq");

var _pretty = require("./pretty");

function VNodeIterator(iter, parent, f) {
	this.iter = iter;
	this.parent = parent;
	this.f = f;
	this.indexInParent = -1;
	this.__is_VNodeIterator = true;
}

var DONE = {
	done: true
};

VNodeIterator.prototype.next = function () {
	var v = this.iter.next();
	this.indexInParent++;
	if (v.done) return DONE;
	return { value: this.f(v.value, this.parent, this.indexInParent) };
};

function Step(inode, name, parent, depth, indexInParent) {
	this.inode = inode;
	this.name = name;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
}

Step.prototype.type = 17;

Step.prototype.toString = function () {
	return "Step {depth:" + this.depth + ", closes:" + this.parent.name + "}";
};

/*
export function* docIter(node) {
	node = ensureDoc.bind(this)(node);
	yield node;
	while (node) {
		node = nextNode(node);
		if(node) yield node;
	}
}
*/
function nextNode(node /* VNode */) {
	var type = node.type,
	    inode = node.inode,
	    parent = node.parent,
	    indexInParent = node.indexInParent || 0;
	var depth = node.depth || 0;
	// FIXME improve check
	if (type != 17 && (type == 1 || type == 5 || type == 6 || type == 14) && node.count() === 0) {
		return new Step(inode, node.name, node.parent, depth, node.indexInParent);
	}
	if (type != 17 && node.count() > 0) {
		// if we can still go down, return firstChild
		depth++;
		indexInParent = 0;
		parent = node;
		inode = node.first();
		// TODO handle arrays
		node = parent.vnode(inode, parent, depth, indexInParent);
		//console.log("found first", node.name, depth,indexInParent);
		return node;
	} else {
		indexInParent++;
		// if there are no more children, return a 'Step' to indicate a close
		// it means we have to continue one or more steps up the path
		if (parent.count() == indexInParent) {
			//inode = parent;
			depth--;
			node = node.parent;
			if (depth === 0 || !node) return;
			inode = node.inode;
			node = new Step(inode, node.name, node.parent, depth, node.indexInParent);
			//console.log("found step", node.name, depth, indexInParent);
			return node;
		} else {
			// return the next child
			inode = parent.next(node);
			if (inode !== undefined) {
				node = parent.vnode(inode, parent, depth, indexInParent);
				//console.log("found next", node.name, depth, indexInParent);
				return node;
			}
			//throw new Error("Node "+parent.name+" hasn't been completely traversed. Found "+ indexInParent + ", contains "+ parent.count());
		}
	}
}
/*
export function* prevNode(node){
	//var depth = node.depth;
	while(node){
		if(!node.size) {
			//depth--;
			node = node.parent;
			if(!node) break;
			yield node;
		} else{
			if(!("indexInParent" in node)) node.indexInParent = node.parent.size;
			node.indexInParent--;
			node = node.getByIndex(node.indexInParent);
		}
	}
}
*/
function stringify(input) {
	var str = "";
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var docAttrFunc = function docAttrFunc(z, kv) {
		return z += kv[0] == "DOCTYPE" ? "<!" + kv[0] + " " + kv[1] + ">" : "<?" + kv[0] + " " + kv[1] + "?>";
	};
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = docIter(input)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _node = _step.value;

			var type = _node.type;
			if (type == 1) {
				str += "<" + _node.name;
				str = (0, _transducers.foldLeft)(_node.attrEntries(), str, attrFunc);
				if (!_node.count()) str += "/";
				str += ">";
			} else if (type == 3) {
				str += _node.toString();
			} else if (type == 9) {
				str += (0, _transducers.foldLeft)(_node.attrEntries(), str, docAttrFunc);
			} else if (type == 17) {
				str += "</" + _node.name + ">";
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return (0, _pretty.prettyXML)(str);
}

function firstChild(node) {
	// FIXME return root if doc (or something else?)
	var next = _doc.ensureDoc.bind(this)(node);
	if (node !== next) return next;
	// next becomes parent, node = firstChild
	node = next.first();
	if (node) return next.vnode(node, next, next.depth + 1, 0);
}

function nextSibling(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var parent = node.parent;
	var next = parent.next(node);
	// create a new node
	// very fast, but now we haven't updated path, so we have no index!
	if (next) return parent.vnode(next, parent, node.depth, node.indexInParent + 1);
}

/*
export function* children(node){
	node = ensureDoc.bind(this)(node);
	var i = 0;
	for(var c of node.values()){
		if(c) yield node.vnode(c, node, node.depth + 1, i++);
	}
}
*/
function getDoc(node) {
	node = _doc.ensureDoc.bind(this)(node);
	do {
		node = node.parent;
	} while (node.parent);
	return node;
}

function lastChild(node) {
	node = _doc.ensureDoc.bind(this)(node);
	var last = node.last();
	return node.vnode(last, node, node.depth + 1, node.count() - 1);
}

function parent(node) {
	if (!arguments.length) return Axis(parent);
	return node.parent ? (0, _seq.seq)(new VNodeIterator([node.parent.inode][Symbol.iterator](), node.parent.parent, node)) : (0, _seq.seq)();
}

function Singleton(val) {
	this.val = val;
}

Singleton.prototype.next = function () {
	if (this.val !== undefined) {
		var val = this.val;
		this.val = undefined;
		return { value: val };
	}
	return { done: true };
};

function self(f) {
	if (f.name !== "transForEach" && f.name !== "transFilter") f = (0, _transducers.forEach)(f);
	return Axis(function (node) {
		return new Singleton(node);
	}, f, 3);
}

function iter(node, f, cb) {
	// FIXME pass doc?
	var i = 0,
	    prev;
	if (!f) f = function f(node) {
		prev = node;
	};
	node = _doc.ensureDoc.bind(this)(node);
	f(node, i++);
	while (node) {
		node = nextNode(node);
		if (node) {
			f(node, i++);
		}
	}
	if (cb) cb();
	//return prev;
}

var isVNode = exports.isVNode = function isVNode(n) {
	return !!n && n.__is_VNode;
};

var _isElement = function _isElement(n) {
	return isVNode(n) && n.type == 1;
};

var _isAttribute = function _isAttribute(n) {
	return isVNode(n) && n.type == 2;
};

var _isText = function _isText(n) {
	return isVNode(n) && n.type == 3;
};

//const _isList = n => isVNode(n) && n.type == 5;

//const _isMap = n => isVNode(n) && n.type == 6;

var _isLiteral = function _isLiteral(n) {
	return isVNode(n) && n.type == 12;
};

function cxFilter(iterable, f) {
	return (0, _transducers.filter)(iterable, function (v, k, i) {
		if (!(0, _seq.isSeq)(v) && !isVNode(v)) v = (0, _seq.seq)(v);
		v.__cx = [k, i];
		return f(v, k, i);
	});
}

var position = exports.position = function position(n) {
	return n.__cx ? n.__cx[0] + 1 : n.indexInParent;
};

var last = exports.last = function last(n) {
	return n.__cx ? n.__cx[1].size : n.parent ? n.parent.size : 1;
};

// TODO convert qname to integer when parent is array
function _nodeTest(type, qname) {
	var f;
	if (qname === undefined) {
		f = type;
	} else {
		var hasWildcard = /\*/.test(qname);
		if (hasWildcard) {
			var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
			f = function f(n) {
				return type(n) && regex.test(n.name);
			};
		} else {
			//return _seq.seq(_get(qname, 1), _transducers.filter(_isElement));
			f = function f(n) {
				return n.name === qname && type(n);
			};
			f.__Accessor = qname;
		}
	}
	f.__is_NodeTypeTest = true;
	return f;
}

function element(qname) {
	return _nodeTest(_isElement, qname);
}

function _attrGet(key, node) {
	var entries;
	if (key !== null) {
		var val = node.attr(key);
		if (!val) return [];
		entries = [[key, val]];
	} else {
		entries = node.attrEntries();
	}
	return (0, _transducers.into)(entries, function (kv) {
		return node.vnode(node.ivalue(2, kv[0], kv[1]), node.parent, node.depth + 1, node.indexInParent);
	}, (0, _seq.seq)())[Symbol.iterator]();
}

// TODO make axis default, process node here, return seq(VNodeIterator)
// TODO maybe have Axis receive post-process func/seq
function attribute(qname) {
	var hasWildcard = /\*/.test(qname);
	// getter of attributes / pre-processor of attributes
	// TODO iterator!
	// filter of attributes
	var f;
	if (hasWildcard) {
		var regex = new RegExp(qname.replace(/\*/, "(\\w[\\w0-9-_]*)"));
		//	attrEntries returns tuples
		f = function f(n) {
			return _isAttribute(n) && regex.test(n.name);
		};
		// no direct access
		qname = null;
	} else {
		// name check provided by directAccess
		f = function f(n) {
			return _isAttribute(n);
		};
	}
	return Axis(_attrGet.bind(null, qname), (0, _transducers.filter)(f), 2);
}

function text() {
	var f = function f(n) {
		return _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return f;
}

function node() {
	var f = function f(n) {
		return _isElement(n) || _isText(n) && !!n.value;
	};
	f.__is_NodeTypeTest = true;
	return f;
}

// TODO create axis functions that return a function
// child(element(qname))
// works like a filter: filter(children(node|nodelist),n => element(qname,n))
// nextSibling(element()): filter(nextSibling(node|nodelist),n => element(undefined,n))
// filterOrGet: when f is called, and null or wildcard match was supplied as its qname parameter, call filter
// else call get
// if it is a seq, apply the function iteratively:
// we don't want to filter all elements from a seq, we want to retrieve all elements from elements in a seq
// final edge case: when node is of type array, and name is not an integer: filter
function Axis(g, f, type) {
	return {
		__is_Axis: true,
		__type: type || 1,
		f: f,
		g: g
	};
}
function child(f) {
	if (f.__is_NodeTypeTest) {
		// this means it's a predicate, and the actual function should become a filter
		if (f.__Accessor) {
			// TODO this means we can try direct access on a node
		}
		f = (0, _transducers.filter)(f);
	}
	return Axis(function (node) {
		return node[Symbol.iterator]();
	}, f);
}

var _isSiblingIterator = function _isSiblingIterator(n) {
	return !!n && n.__is_SiblingIterator;
};

var isVNodeIterator = function isVNodeIterator(n) {
	return !!n && n.__is_VNodeIterator;
};

function SiblingIterator(inode, parent, depth, indexInParent, dir) {
	this.inode = inode;
	this.parent = parent;
	this.depth = depth;
	this.indexInParent = indexInParent;
	this.dir = dir;
	this.__is_SiblingIterator = true;
}

SiblingIterator.prototype.next = function () {
	var v = this.dir.call(this.parent.inode, this.name, this.inode);
	this.index++;
	if (!v) return DONE;
	this.inode = v;
	return { value: this.parent.vnode(v, this.parent, this.depth, this.indexInParent) };
};

SiblingIterator.prototype[Symbol.iterator] = function () {
	return this;
};

function followingSibling(node) {
	if (arguments.length === 0) return Axis(followingSibling);
	node = _doc.ensureDoc.bind(this)(node);
	return (0, _seq.seq)(new SiblingIterator(node.inode, node.parent, node.depth, node.indexInParent));
}

/*function* _combinedIter(iters, f) {
	for(var x of iters) {
		var next;
		// expect everything to be a faux iterator
		while(next = f(x).next(), !next.done) {
			yield next.value;
		}
	}
}*/

function CombinedIterator(iters, f) {
	this.iter = f(iters.shift());
	this.iters = iters;
	this.f = f;
	this.index = 0;
}

CombinedIterator.prototype.next = function () {
	if (!this.iter) return DONE;
	var v = this.iter.next();
	if (!v || v.done) {
		if (this.iters.length) {
			this.iter = this.f(this.iters.shift());
			return this.next();
		}
		return DONE;
	}
	return v;
};

function _combinedIter(iters, f) {
	return new CombinedIterator(iters, f);
}

// make sure all paths are transducer-funcs
function select(node) {
	// usually we have a sequence
	// TODO make lazy:
	// - combine iterators for each node seq to one iterator
	// - bind the composed function to the combined iterator
	// - combine the combined iterator
	var cur = node;
	var bed = _doc.ensureDoc.bind(this);

	for (var _len = arguments.length, paths = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		paths[_key - 1] = arguments[_key];
	}

	var _loop = function _loop() {
		var path = paths.shift();
		path = _axify(path);
		// TODO skip self
		skipCompare = path.__type == 2 || path.__type == 3;
		f = path.f;
		// rebind step function to the context

		bound = function bound(n) {
			return path.g(bed(n));
		};

		if (!skipCompare) f = (0, _transducers.compose)(f, (0, _transducers.filter)(_comparer()));
		x = (0, _seq.isSeq)(cur) ? _combinedIter(cur.toArray(), bound) : bound(cur);

		cur = (0, _transducers.into)(x, f, (0, _seq.seq)());
	};

	while (paths.length > 0) {
		var skipCompare;
		var f;
		var bound;
		var x;

		_loop();
	}
	return cur;
}

function _comparer() {
	// dirty preserve state on function
	var f = function f(node) {
		var has = f._checked.has(node);
		if (!has) f._checked.set(node, true);
		return !has;
	};
	f._checked = new WeakMap();
	return f;
}

/*
export function* select2(node,...paths) {
	// TODO
	// 1: node (or seq) is iterable, so get first as current context
	// 2: each function is a filter (either a node is returned or the process stops)
	// 3: pass each single result to a filter function, yielding a result for each
	var bed = ensureDoc.bind(this);
	var next = bed(node);
	var cx = next;
	if(next) {
		next = nextNode(next);
		while(next){
			for(var i=0,l=paths.length,path=paths[i]; i<l; i++){
				if(!isSeq(path)) path = seq(path);
				// process strings (can this be combined?)
				path = transform(path,compose(forEach(function(path){
					if(typeof path == "string") {
						var at = /^@/.test(path);
						if(at) path = path.substring(1);
						return at ? attribute(path) : element(path);
					}
					return [path];
				}),cat));
				var composed = compose.apply(null,path.toArray());
				let ret = composed.call(cx,next);
				if(node) {
					yield ret;
				} else {
					break;
				}
			}
		}
	}
}
*/
function _axify(path) {
	if (!path.__is_Axis) {
		// process strings (can this be combined?)
		if (typeof path == "string") {
			var at = /^@/.test(path);
			if (at) path = path.substring(1);
			return at ? attribute(path) : child(element(path));
		} else if (typeof path == "function") {
			return self(path);
		} else {
			// TODO throw error
		}
	}
	return path;
}

function isEmptyNode(node) {
	node = _doc.ensureDoc.bind(this)(node);
	if (!isVNode(node)) return false;
	if (_isText(node) || _isLiteral(node) || _isAttribute(node)) return node.value === undefined;
	return !node.count();
}

function name($a) {
	if ((0, _seq.isSeq)($a)) return (0, _transducers.forEach)($a, name);
	if (!isVNode($a)) throw new Error("This is not a node");
	return $a.name;
}

},{"./doc":40,"./pretty":48,"./seq":50,"./transducers":51}],40:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ensureDoc = ensureDoc;
exports.d = d;

var _inode = require("./inode");

var inode = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ensureDoc(node) {
	if (!node) return;
	var cx = this && this.vnode ? this : inode;
	if (!node.inode) {
		if (cx.getType(node) == 9) {
			var root = cx.first(node);
			return cx.vnode(root, cx.vnode(node), 1, 0);
		} else {
			var doc = d.bind(cx)();
			var _root = cx.vnode(node, doc, 1, 0);
			doc = doc.push(_root);
			return _root;
		}
	}
	if (typeof node.inode === "function") {
		node = node.inode(d.bind(cx)());
	}
	return node;
}

function d() {
	var uri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	var doctype = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

	var attrs = {};
	var cx = this.vnode ? this : inode;
	if (uri) {
		attrs["xmlns" + (prefix ? ":" + prefix : "")] = uri;
	}
	if (doctype) {
		attrs.DOCTYPE = doctype;
	}
	return cx.vnode(cx.emptyINode(9, "#document", 0, cx.emptyAttrMap(attrs)));
}

},{"./inode":45}],41:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ready = ready;
exports.byId = byId;
exports.query = query;
exports.on = on;
exports.click = click;
exports.hasClass = hasClass;
exports.removeClass = removeClass;
exports.toggleClass = toggleClass;
exports.removeAttr = removeAttr;
exports.toggle = toggle;
exports.hide = hide;
exports.elem = elem;
exports.attr = attr;
exports.text = text;
exports.empty = empty;
exports.remove = remove;
exports.placeAt = placeAt;
exports.placeAfter = placeAfter;
exports.placeBefore = placeBefore;
exports.matchAncestorOrSelf = matchAncestorOrSelf;

var _access = require("./access");

var _seq = require("./seq");

var _transducers = require("./transducers");

function domify(n) {
    // render
} /**
   * DOM util module
   * @module dom-util
   */

function ready() {
    return new Promise(function (resolve, reject) {
        function completed() {
            document.removeEventListener("DOMContentLoaded", completed, false);
            window.removeEventListener("load", completed, false);
            resolve();
        }

        if (document.readyState === "complete") {
            // Handle it asynchronously to allow scripts the opportunity to delay ready
            setTimeout(callback);
        } else {

            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", completed, false);

            // A fallback to window.onload, that will always work
            window.addEventListener("load", completed, false);
        }
    });
}

function byId(id) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return doc.getElementById(id);
}

function query(query) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    return doc.querySelectorAll(query);
}

function on(elm, type, fn) {
    var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : document;

    if (!elm) {
        console.error("TypeError: You're trying to bind an event, but the element is null");
        return;
    }
    try {
        if (elm instanceof NodeList || (0, _seq.isSeq)(elm)) {
            var handles = [];
            (0, _transducers.forEach)(elm, function (_) {
                handles.push(on(_, type, fn));
            });
            return function () {
                handles.forEach(function (_) {
                    _();
                });
            };
        }
        if (typeof elm == "string") {
            return on(query(elm, context), type, fn);
        }
        if ((0, _access.isVNode)(elm)) elm = elm._domNode || domify(elm);
        elm.addEventListener(type, fn);
        return function () {
            elm.removeEventListener(type, fn);
        };
    } catch (e) {
        console.error(e);
    }
}

function click(elm) {
    if (elm instanceof NodeList) return (0, _transducers.forEach)(elm, click);
    var clk = elm.onclick || elm.click;
    if (typeof clk == "function") {
        clk.apply(elm);
    }
}

function hasClass(elm, name) {
    if (elm instanceof NodeList) {
        return (0, _transducers.foldLeft)(elm, false, function (pre, _) {
            return pre || hasClass(_, name);
        });
    }
    return !!elm.className.match(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"));
}

function removeClass(elm, name) {
    //elm.classList.remove(name);
    if (elm instanceof NodeList) {
        (0, _transducers.forEach)(elm, function (_) {
            removeClass(_, name);
        });
    } else {
        elm.className = elm.className.replace(new RegExp("(^|\\s?)" + name + "($|\\s?)", "g"), "");
    }
}

function toggleClass(elm, name) {
    var state = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var hasc = hasClass(elm, name);
    if (state === false || state === null && hasc) {
        removeClass(elm, name);
    } else if (!hasc) {
        elm.className += " " + name;
    }
}

function removeAttr(elm, name) {
    if (elm instanceof NodeList) {
        (0, _transducers.forEach)(elm, function (_) {
            _.removeAttribute(name);
        });
    } else {
        elm.removeAttribute(name);
    }
}

function toggle(elm) {
    // TODO move to CSS checked state
    var cur = elm.style.display;
    elm.style.display = cur.match(/^(none)?$/) ? "block" : "none";
}

function hide(elm) {
    elm.style.display = "none";
}

function place(node, target, position) {
    if ((0, _access.isVNode)(node)) node = node._domNode || domify(node);
    if ((0, _access.isVNode)(target)) target = target._domNode || domify(target);
    if (position == 1) {
        empty(target);
    }
    if (position > 1) {
        var parent = target.parentNode;
        if (position == 2) {
            parent.insertBefore(node, target.nextSibling);
        } else {
            parent.insertBefore(node, target);
        }
    } else {
        target.appendChild(node);
    }
    return node;
}

function elem(name) {
    var children = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var node = document.createElement(name);
    children.forEach(function (c) {
        if (c) {
            if (c.nodeType == 2) {
                node.setAttributeNode(c);
            } else {
                node.appendChild(c);
            }
        }
    });
    return node;
}

function attr(name, value) {
    var ns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var node = document.createAttribute(name);
    node.value = value;
    return node;
}

function text(value) {
    return document.createTextNode(value);
}

function empty(node) {
    if ((0, _access.isVNode)(node)) node = node._domNode;
    if (!node) return;
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function remove(node) {
    empty(node);
    node.parentNode.removeChild(node);
}

function placeAt(node, target) {
    var replace = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return place(node, target, replace ? 1 : 0);
}
function placeAfter(node, target) {
    return place(node, target, 2);
}
function placeBefore(node, target) {
    return place(node, target, 3);
}

/**
 * Match a DOM Node to a selector, or, if it doesn't match,
 * try matching up the ancestor tree
 * @param  {Node} elem The base element (self)
 * @param  {String} selector The selector to match
 * @return {HTMLElement|null} Null if no match
 */
function matchAncestorOrSelf(elem, selector) {
    var node = elem;
    if (node.matches(selector)) return node;
    while (node.parentNode) {
        node = node.parentNode;
        if (!!(node && node.matches(selector))) return node;
    }
}

},{"./access":39,"./seq":50,"./transducers":51}],42:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.error = error;

var _errors = require("../errors.json");

var codes = _interopRequireWildcard(_errors);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function error(qname, message) {
	// TODO handle QName
	var code = typeof qname == "string" ? qname.replace(/^[^:]*:/, "") : qname; //.getLocalPart();
	if (!message) message = codes[code];
	var err = new Error(message);
	// remove self
	//var stack = err.stack.split(/\n/g);
	//stack.splice(1,1);
	//console.error(stack.join("\n"));
	//return err;
	// TODO let implementor catch errors
	throw err;
}

},{"../errors.json":37}],43:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.process = process;

var _doc = require("./doc");

var _access = require("./access");

// iter form and replace fieldset types
function process(node) {
	_access.iter.bind(this)(node, function (node) {
		if (node.type == 6) {
			// this is mutative
			if (node.inode.dataset.appearance == "hidden") {
				node.inode.disabled = true;
				node.inode.hidden = true;
			}
		}
	});
	return _doc.ensureDoc.bind(this)(node);
}

},{"./access":39,"./doc":40}],44:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.count = count;
exports.keys = keys;
exports.cached = cached;
exports.first = first;
exports.next = next;
exports.get = get;
exports.getType = getType;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.push = push;
exports.getAttribute = getAttribute;

var _vnode = require("./vnode");

var _transducers = require("./transducers");

var _iform = require("./iform");

var cx = _interopRequireWildcard(_iform);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _inferType(node) {
	var t = node.dataType;
	if (t) {
		switch (t) {
			case "string":
				return 3;
			case "boolean":
			case "number":
				return 12;
			case "array":
				return 5;
			case "object":
				return 6;
		}
	}
	var nodeName = node.nodeName.toUpperCase();
	if (nodeName == "FIELDSET" || nodeName == "FORM") return 6;
	if (node.type == "number" || node.type == "checkbox") return 12;
	return 3;
}
function ivalue(type, name, value) {
	return value;
}

function vnode(inode, parent, depth, indexInParent) {
	var type = _inferType(inode);
	var format = inode.type;
	var val = inode.value;
	if (type == 12 && typeof val == "string") {
		if (format == "checkbox") {
			val = inode.checked;
		} else if (format == "number") {
			val = parseFloat(inode.value);
		}
	}
	return new _vnode.VNode(cx, inode, type, inode.name, val, parent, depth, indexInParent);
}

function _inFieldset(node, parent) {
	while (node = node.parentNode, !!node && node != parent) {
		if (node.type == "fieldset") {
			return true;
		}
	}
}

function count(inode, type, cache) {
	// filter out elements that are in form, but also in fieldset...
	var elems = inode.elements;
	if (!elems) return 0;
	if (type == 6) {
		if (!cache) cache = cached(inode, type);
		elems = cache.values();
	}
	return elems.length;
}

function keys(inode, type, cache) {
	// TODO cached
	return inode.elements ? (0, _transducers.forEach)(inode.elements, function (n) {
		return n.name;
	}) : [];
}

function Cache(elems) {
	this.elements = elems;
}

Cache.prototype.values = function () {
	return this.elements;
};

function cached(inode, type) {
	if (type == 6) {
		return new Cache(Array.prototype.filter.call(inode.elements, function (e) {
			return !_inFieldset(e, inode);
		}));
	}
}

function first(inode, type, cache) {
	// detect / filter fieldset elements
	var elems = inode.elements;
	if (elems) {
		if (type == 6) {
			if (!cache) cache = cached(inode, type);
			elems = cache.values();
		}
		return elems[0];
	}
}

function next(inode, node, type, cache) {
	//type = type || _inferType(type);
	var idx = node.indexInParent;
	// detect fieldset elements
	var elems = inode.elements;
	if (elems) {
		if (type == 6) {
			if (!cache) cache = cached(inode, type);
			elems = cache.values();
		}
		return elems[idx + 1];
	}
}

function get(inode, idx) {
	return inode[idx];
}

function getType(inode) {
	// probably only used for empty root
	return 9;
}

function emptyINode(type, name, depth, attrs) {}

function emptyAttrMap() {
	// probably only used for empty root
}

function push() {}

function getAttribute(inode) {
	return inode.attributes[inode];
}

},{"./iform":44,"./transducers":51,"./vnode":53}],45:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getType = undefined;
exports.ivalue = ivalue;
exports.vnode = vnode;
exports.emptyINode = emptyINode;
exports.emptyAttrMap = emptyAttrMap;
exports.next = next;
exports.push = push;
exports.set = set;
exports.removeChild = removeChild;
exports.cached = cached;
exports.keys = keys;
exports.values = values;
exports.finalize = finalize;
exports.setAttribute = setAttribute;
exports.getAttribute = getAttribute;
exports.count = count;
exports.first = first;
exports.last = last;
exports.attrEntries = attrEntries;
exports.modify = modify;
exports.stringify = stringify;

var _vnode = require("./vnode");

var _qname = require("./qname");

var _pretty = require("./pretty");

var _transducers = require("./transducers");

var _multimap = require("./multimap");

var multimap = _interopRequireWildcard(_multimap);

var _inode = require("./inode");

var cx = _interopRequireWildcard(_inode);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// helpers ---------------
if (!Object.values) {
	var objUtil = function objUtil(obj, f) {
		var keys = Object.keys(obj);
		var entries = [];
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			entries.push(f(key));
		}
		return entries;
	};
	Object.values = function (o) {
		return objUtil(o, function (key) {
			return o[key];
		});
	};
	Object.entries = function (o) {
		return objUtil(o, function (key) {
			return [key, o[key]];
		});
	};
}

// import self!

function _inferType(inode) {
	if (inode === null) return 12;
	var cc = inode.constructor;
	if (cc == Array) {
		return 5;
	} else if (cc == Object) {
		if (inode.$children) {
			return inode.$name == "#document" ? 9 : 1;
		} else if (inode.$value) {
			return 2;
		} else if (inode.$comment) {
			return 8;
		} else {
			return 6;
		}
	} else if (cc == Number || cc == Boolean) {
		return 12;
	}
	return 3;
}

/*
function* _get(children, idx) {
	let len = children.length;
	for (let i = 0; i < len; i++) {
		if ((children[i].$name || i + 1) == idx) {
			yield children[i];
		}
	}
}
*/
function _last(a) {
	return (0, _transducers.drop)(a, a.length - 1);
}

function _elemToString(e) {
	var attrFunc = function attrFunc(z, kv) {
		return z += " " + kv[0] + "=\"" + kv[1] + "\"";
	};
	var str = "<" + e.$name;
	var ns = e.$ns;
	if (ns) str += " xmlns" + (ns.prefix ? ":" + ns.prefix : "") + "=\"" + ns.uri + "\"";
	str = (0, _transducers.foldLeft)(Object.entries(e.$attrs), str, attrFunc);
	if (e.$children.length > 0) {
		str += ">";
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = e.$children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var c = _step.value;

				str += stringify(c);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		str += "</" + e.$name + ">";
	} else {
		str += "/>";
	}
	return str;
}

// -----------------------

function ivalue(type, name, value) {
	if (type == 2) {
		return { $name: name, $value: value };
	} else if (type == 8) {
		return { $comment: value };
	}
	return value;
}

function vnode(inode, parent, depth, indexInParent, type) {
	type = type || _inferType(inode);
	var name, value;
	if (type == 1 || type == 9) {
		name = inode.$name;
	} else if (type == 2) {
		name = inode.$name;
		value = inode.$value;
	} else if (type == 5) {
		name = parent ? parent.keys()[indexInParent] : "#";
	} else if (type == 6) {
		name = parent ? parent.keys()[indexInParent] : "#";
	} else if (type == 8) {
		value = inode.$comment;
	} else if (type == 3 || type == 12) {
		value = inode;
		name = parent ? parent.keys()[indexInParent] : "#";
	}
	// return vnode
	return new _vnode.VNode(cx, inode, type, inode && inode.$ns ? (0, _qname.q)(inode.$ns.uri, name) : name, value, parent, depth, indexInParent);
}

function emptyINode(type, name, attrs, ns) {
	var inode = type == 5 ? [] : {};
	if (type == 1 || type == 9) {
		inode.$name = name;
		inode.$attrs = attrs;
		inode.$ns = ns;
		inode.$children = [];
	}
	return inode;
}

function emptyAttrMap(init) {
	return init || {};
}

/*
export function get(inode,idx,type,cache){
	type = type || _inferType(inode);
	if(type == 1 || type == 9){
		if(cache) return cache[idx];
		return _get(inode.$children,idx);
	}
	return inode[idx];
}
*/
function next(inode, node, type) {
	type = type || _inferType(inode);
	var idx = node.indexInParent;
	if (type == 1 || type == 9) {
		return inode.$children[idx + 1];
	}
	if (type == 5) return inode[idx + 1];
	if (type == 6) {
		var vals = Object.values(inode);
		return vals[idx + 1];
	}
}

function push(inode, val, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		inode.$children.push(val[1]);
	} else if (type == 5) {
		inode.push(val);
	} else if (type == 6) {
		inode[val[0]] = val[1];
	}
	return inode;
}

function set(inode /*,key,val,type*/) {
	// used to restore immutable parents, never modifies mutable
	return inode;
}

function removeChild(inode, child, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		inode.$children.splice(child.indexInParent, 1);
	} else if (type == 5) {
		inode.splice(child.indexInParent, 1);
	} else if (type == 6) {
		delete inode[child.name];
	}
	return inode;
}

function cached(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    cache = multimap.default();
		for (var i = 0; i < len; i++) {
			cache.push([children[i].$name || i + 1, children[i]]);
		}
		return cache;
	}
	if (type == 5) {
		return {
			keys: function keys() {
				return (0, _transducers.range)(inode.length).toArray();
			}
		};
	}
	if (type == 6) {
		return {
			keys: function keys() {
				return Object.keys(inode);
			}
		};
	}
}

function keys(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		var children = inode.$children,
		    len = children.length,
		    _keys = [];
		for (var i = 0; i < len; i++) {
			_keys[i] = children[i].$name || i + 1;
		}
		return _keys;
	}
	if (type == 5) return (0, _transducers.range)(inode.length).toArray();
	if (type == 6) return Object.keys(inode);
	return [];
}

function values(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) return inode.$children;
	if (type == 2) return [[inode.$name, inode.$value]];
	if (type == 6) return Object.values(inode);
	if (type == 8) return [inode.$comment];
	return inode;
}

function finalize(inode) {
	return inode;
}

function setAttribute(inode, key, val) {
	if (inode.$attrs) inode.$attrs[key] = val;
	return inode;
}

function getAttribute(inode, key) {
	if (inode.$attrs) return inode.$attrs[key];
}

function count(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		return inode.$children.length;
	} else if (type == 5) {
		return inode.length;
	} else if (type == 6) {
		return Object.keys(inode).length;
	}
	return 0;
}

function first(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		return inode.$children[0];
	} else if (type == 5) {
		return inode[0];
	} else if (type == 6) {
		return Object.values(inode)[0];
	}
}

function last(inode, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) return _last(inode.$children);
	if (type == 5) return _last(inode);
	if (type == 6) {
		return _last(Object.values(inode));
	}
}

function attrEntries(inode) {
	if (inode.$attrs) return Object.entries(inode.$attrs);
	return [];
}

function modify(inode, node, ref, type) {
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		if (ref !== undefined) {
			inode.$children.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.$children.push(node.inode);
		}
	} else if (type == 5) {
		if (ref !== undefined) {
			inode.splice(ref.indexInParent, 0, node.inode);
		} else {
			inode.push(node.inode);
		}
	} else if (type == 6) {
		inode[node.name] = node.inode;
	}
	return inode;
}

function stringify(inode, type) {
	var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
	var key = arguments[3];

	var str = "";
	type = type || _inferType(inode);
	if (type == 1 || type == 9) {
		str += _elemToString(inode);
	} else if (type == 5) {
		var val = (0, _transducers.forEach)(inode, function (c) {
			return stringify(c);
		}).join("");
		if (key) {
			str += "<" + key + " json:type=\"array\"" + (val ? ">" + val + "</" + key + ">" : "/>");
		} else {
			str += "<json:array" + (val ? ">" + val + "</json:array>" : "/>");
		}
	} else if (type == 6) {
		var _val = (0, _transducers.forEach)(Object.entries(inode), function (c) {
			return stringify(c[1], null, false, c[0]);
		}).join("");
		if (key) {
			str += "<" + key + " json:type=\"map\"" + (_val ? ">" + _val + "</" + key + ">" : "/>");
		} else {
			str += "<json:map" + (_val ? ">" + _val + "</json:map>" : "/>");
		}
	} else {
		var _val2 = inode === null ? "null" : inode.toString();
		if (key) {
			str += "<" + key + (type == 12 ? " json:type=\"literal\"" : "") + (_val2 ? ">" + _val2 + "</" + key + ">" : "/>");
		} else {
			str += type == 12 ? "<json:literal>" + _val2 + "</json:literal>" : _val2;
		}
	}
	return root ? (0, _pretty.prettyXML)(str) : str;
}

var getType = exports.getType = _inferType;

},{"./inode":45,"./multimap":47,"./pretty":48,"./qname":49,"./transducers":51,"./vnode":53}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.process = exports.validate = exports.select = exports.lastChild = exports.firstChild = exports.d = exports.ensureDoc = undefined;

var _transducers = require("../transducers");

Object.keys(_transducers).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _transducers[key];
    }
  });
});

var _domUtil = require("../dom-util");

Object.keys(_domUtil).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _domUtil[key];
    }
  });
});

var _iform = require("../iform");

var inode = _interopRequireWildcard(_iform);

var _doc = require("../doc");

var dc = _interopRequireWildcard(_doc);

var _access = require("../access");

var ac = _interopRequireWildcard(_access);

var _validate = require("../validate");

var va = _interopRequireWildcard(_validate);

var _formUtil = require("../form-util");

var fu = _interopRequireWildcard(_formUtil);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var ensureDoc = exports.ensureDoc = dc.ensureDoc.bind(inode);

var d = exports.d = dc.d.bind(inode);

var firstChild = exports.firstChild = ac.firstChild.bind(inode);

var lastChild = exports.lastChild = ac.lastChild.bind(inode);

var select = exports.select = ac.select.bind(inode);

var validate = exports.validate = va.validate.bind(inode);

var process = exports.process = fu.process.bind(inode);

},{"../access":39,"../doc":40,"../dom-util":41,"../form-util":43,"../iform":44,"../transducers":51,"../validate":52}],47:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = multimap;
function MultiMap() {
	this._buckets = {};
	this._size = 0;
	this.__is_MultiMap = true;
}

MultiMap.prototype.push = function (entry) {
	var key = entry[0];
	var bucket = this._buckets[key];
	entry[2] = this._size++;
	if (bucket && bucket.__is_Bucket) {
		bucket.push(entry);
	} else {
		this._buckets[key] = new Bucket(entry);
	}
	return this;
};

MultiMap.prototype.get = function (key) {
	var bucket = this._buckets[key];
	if (bucket && bucket.__is_Bucket) {
		var vals = bucket._values,
		    len = vals.length;
		if (len === 0) return;
		if (len == 1) return vals[0][1];
		// TODO fix order if needed
		var out = new Array(len);
		for (var i = 0; i < len; i++) {
			out[i] = vals[i][1];
		}return out;
	}
};

MultiMap.prototype.keys = function () {
	// retain key types
	var keys = [];
	for (var i = 0, l = this._buckets.length; i < l; i++) {
		keys[i] = this._buckets[i][0];
	}
	return keys;
};

function Bucket(val) {
	this._values = [val];
	this.__is_Bucket = true;
}

Bucket.prototype.push = function (val) {
	this._values.push(val);
	return this;
};

function multimap() {
	return new MultiMap();
}

},{}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.prettyXML = prettyXML;
function prettyXML(text) {
	var shift = ['\n']; // array of shifts
	var step = '  '; // 2 spaces
	var maxdeep = 100; // nesting level

	// initialize array with shifts //
	for (var _ix = 0; _ix < maxdeep; _ix++) {
		shift.push(shift[_ix] + step);
	}
	var ar = text.replace(/>\s{0,}</g, "><").replace(/</g, "~::~<").replace(/xmlns\:/g, "~::~xmlns:").replace(/xmlns\=/g, "~::~xmlns=").split('~::~'),
	    len = ar.length,
	    inComment = false,
	    deep = 0,
	    str = '',
	    ix = 0;

	for (ix = 0; ix < len; ix++) {
		// start comment or <![CDATA[...]]> or <!DOCTYPE //
		if (ar[ix].search(/<!/) > -1) {
			str += shift[deep] + ar[ix];
			inComment = true;
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1 || ar[ix].search(/!DOCTYPE/) > -1) {
				inComment = false;
			}
		} else
			// end comment  or <![CDATA[...]]> //
			if (ar[ix].search(/-->/) > -1 || ar[ix].search(/\]>/) > -1) {
				str += ar[ix];
				inComment = false;
			} else
				// <elm></elm> //
				if (/^<\w/.exec(ar[ix - 1]) && /^<\/\w/.exec(ar[ix]) && /^<[\w:\-\.\,]+/.exec(ar[ix - 1]) == /^<\/[\w:\-\.\,]+/.exec(ar[ix])[0].replace('/', '')) {
					str += ar[ix];
					if (!inComment) deep--;
				} else
					// <elm> //
					if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) == -1 && ar[ix].search(/\/>/) == -1) {
						str = !inComment ? str += shift[deep++] + ar[ix] : str += ar[ix];
					} else
						// <elm>...</elm> //
						if (ar[ix].search(/<\w/) > -1 && ar[ix].search(/<\//) > -1) {
							str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
						} else
							// </elm> //
							if (ar[ix].search(/<\//) > -1) {
								str = !inComment ? str += shift[--deep] + ar[ix] : str += ar[ix];
							} else
								// <elm/> //
								if (ar[ix].search(/\/>/) > -1) {
									str = !inComment ? str += shift[deep] + ar[ix] : str += ar[ix];
								} else
									// <? xml ... ?> //
									if (ar[ix].search(/<\?/) > -1) {
										str += shift[deep] + ar[ix];
									} else
										// xmlns //
										if (ar[ix].search(/xmlns\:/) > -1 || ar[ix].search(/xmlns\=/) > -1) {
											str += shift[deep] + ar[ix];
										} else {
											str += ar[ix];
										}
	}

	return str[0] == '\n' ? str.slice(1) : str;
}

},{}],49:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isQName = isQName;
exports.QName = QName;
function isQName(maybe) {
  return !!(maybe && maybe.__is_QName);
}

function QName(uri, name) {
  var prefix = /:/.test(name) ? name.replace(/:.+$/, "") : null;
  return {
    __is_QName: true,
    name: name,
    prefix: prefix,
    uri: uri
  };
}

var q = exports.q = QName;

},{}],50:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.first = exports.Seq = undefined;
exports.LazySeq = LazySeq;
exports.when = when;
exports.seq = seq;
exports.isSeq = isSeq;
exports.empty = empty;
exports.exists = exists;
exports.count = count;
exports.insertBefore = insertBefore;
exports.zeroOrOne = zeroOrOne;
exports.oneOrMore = oneOrMore;
exports.exactlyOne = exactlyOne;

var _Observable = require("rxjs/Observable");

var _transducers = require("./transducers");

var _error = require("./error");

require("rxjs/add/observable/from");

require("rxjs/add/operator/reduce");

require("rxjs/add/operator/map");

require("rxjs/add/operator/filter");

function LazySeq(iterable) {
	this.iterable = isSeq(iterable) ? iterable.iterable : iterable || [];
}

/*function _asyncIteratorToObservable(asyncIter) {
	const forEach = (ai, fn, cb) => {
		return ai.next().then(function (r) {
			if (!r.done) {
				try {
					fn(r.value);
				} catch(err) {
					cb(err);
				}
				return forEach(ai, fn, cb);
			} else {
				cb();
			}
		}, cb);
	};
	return new Observable(sink => {
		forEach(asyncIter,x => sink.next(x), err => {
			if(err) return sink.error(err);
			sink.complete();
		});
	});
}*/

// TODO create seq containing iterator, partially iterated
// we need this for transducers, because LazySeq is immutable
LazySeq.prototype["@@transducer/step"] = function (s, v) {
	return s.concat(v);
};

LazySeq.prototype["@@transducer/result"] = function (s) {
	return s;
};

LazySeq.prototype.__is_Seq = true;

LazySeq.prototype.concat = function () {
	// TODO lazy concat
	var ret = _isArray(this.iterable) ? this.iterable : Array.from(this.iterable);

	for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
		a[_key] = arguments[_key];
	}

	for (var i = 0, l = a.length; i < l; i++) {
		var x = a[i];
		if (_isArray(x)) {
			//  assume flat
			ret = ret.concat(x);
		} else if (isSeq(x)) {
			ret = ret.concat(x.toArray());
		} else {
			ret.push(x);
		}
	}
	return new LazySeq(ret);
};

LazySeq.prototype.toString = function () {
	return "Seq [" + this.iterable + "]";
};

LazySeq.prototype.toObservable = function () {
	var iterable = this.iterable;
	return (0, _transducers.isObservable)(iterable) ? iterable : _Observable.Observable.from(iterable);
};

LazySeq.prototype.asObservable = function () {
	return new LazySeq(this.toObservable());
};

LazySeq.prototype.toArray = function () {
	var iterable = this.iterable;
	if ((0, _transducers.isObservable)(iterable)) return iterable.reduce(function (a, x) {
		a.push(x);
		return a;
	}, []);
	return Array.from(iterable);
};

LazySeq.prototype.asArray = function () {
	return new LazySeq(this.toArray());
};

LazySeq.prototype.transform = function (xf) {
	return new LazySeq((0, _transducers.transform)(this.iterable, xf));
};

LazySeq.prototype.count = function () {
	var iter = this.iterable;
	return _isArray(iter) ? iter.length : Infinity;
};

// just resolve a seq of promises, like Promise.all
function when(s, rs, rj) {
	var a = _isArray(s.iterable) ? s.iterable : Array.from(s.iterable);
	//console.log(ret)
	return Promise.all(a).then(function (res) {
		var ret = seq();
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = res[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var x = _step.value;

				ret = ret.concat(x);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return rs(ret);
	}, rj);
}

Object.defineProperty(LazySeq.prototype, "size", {
	get: function get() {
		return this.count();
	}
});

function SeqIterator(iterable) {
	this.iter = _isIter(iterable) ? iterable : iterable[Symbol.iterator]();
}

var DONE = {
	done: true
};

SeqIterator.prototype.next = function () {
	var v = this.iter.next();
	if (v.done) return DONE;
	return v;
};

LazySeq.prototype[Symbol.iterator] = function () {
	return new SeqIterator(this.iterable);
};

// durty stuff
LazySeq.prototype.subscribe = function (o) {
	return new LazySeq(this.toObservable().subscribe(o));
};

LazySeq.prototype.reduce = function (f, z) {
	var o = this.toObservable();
	return new LazySeq(arguments.length == 1 ? o.reduce(f) : o.reduce(f, z));
};

LazySeq.prototype.map = function (f) {
	return new LazySeq(this.toObservable().map(f));
};

function _isArray(a) {
	return a && a.constructor == Array;
}

function _isIter(a) {
	return a && typeof a.next == "function";
}

function _isObservable(a) {
	return a && a instanceof _Observable.Observable;
}

function seq() {
	for (var _len2 = arguments.length, a = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
		a[_key2] = arguments[_key2];
	}

	if (a.length == 1) {
		var x = a[0];
		if (isSeq(x)) return x;
		if (_isArray(x) || _isIter(x) || _isObservable(x)) return new LazySeq(x);
	}
	var s = new LazySeq();
	if (a.length === 0) return s;
	return s.concat.apply(s, a);
}

function isSeq(a) {
	return !!(a && a.__is_Seq);
}

var Seq = exports.Seq = LazySeq;

function _first(iter) {
	var next = iter.next();
	if (!next.done) return next.value;
}

var first = exports.first = function first(s) {
	if (!isSeq(s)) return s;
	var i = s.iterable;
	return _isArray(i) ? i[0] : _isIter(i) ? _first(i) : i;
};

var undef = function undef(s) {
	return s === undefined || s === null;
};

function empty(s) {
	return isSeq(s) ? !s.count() : undef(s);
}

function exists(s) {
	return isSeq(s) ? !!s.count() : !undef(s);
}

function count(s) {
	return empty(s) ? 0 : isSeq(s) ? s.count() : undef(s) ? 0 : 1;
}

function insertBefore(s, pos, ins) {
	pos = first(pos);
	pos = pos === 0 ? 1 : pos - 1;
	var a = s.toArray();
	var n = a.slice(0, pos);
	if (isSeq(ins)) {
		n = n.concat(ins.toArray());
	} else {
		n.push(ins);
	}
	return seq(n.concat(a.slice(pos)));
}

/**
 * [zeroOrOne returns arg OR error if arg not zero or one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}     [Process Error in implementation]
 */
function zeroOrOne($arg) {
	if ($arg === undefined) return seq();
	if (!isSeq($arg)) return $arg;
	if ($arg.size > 1) return (0, _error.error)("FORG0003");
	return $arg;
}
/**
 * [oneOrMore returns arg OR error if arg not one or more]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function oneOrMore($arg) {
	if ($arg === undefined) return (0, _error.error)("FORG0004");
	if (!isSeq($arg)) return $arg;
	if ($arg.size === 0) return (0, _error.error)("FORG0004");
	return $arg;
}
/**
 * [exactlyOne returns arg OR error if arg not exactly one]
 * @param  {Seq} $arg [Sequence to test]
 * @return {Seq|Error}      [Process Error in implementation]
 */
function exactlyOne($arg) {
	if ($arg === undefined) return (0, _error.error)("FORG0005");
	if (!isSeq($arg)) return $arg;
	if ($arg.size != 1) return (0, _error.error)("FORG0005");
	return $arg;
}

},{"./error":42,"./transducers":51,"rxjs/Observable":2,"rxjs/add/observable/from":6,"rxjs/add/operator/filter":7,"rxjs/add/operator/map":8,"rxjs/add/operator/reduce":9}],51:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isObservable = isObservable;
exports.compose = compose;
exports.filter = filter;
exports.erase = erase;
exports.keep = keep;
exports.dedupe = dedupe;
exports.takeWhile = takeWhile;
exports.take = take;
exports.drop = drop;
exports.dropWhile = dropWhile;
exports.partition = partition;
exports.partitionBy = partitionBy;
exports.interpose = interpose;
exports.repeat = repeat;
exports.takeNth = takeNth;
exports.cat = cat;
exports.concatMap = concatMap;
exports.transform = transform;
exports.into = into;
exports.forEach = forEach;
exports.foldLeft = foldLeft;
exports.range = range;

var _seq = require("./seq");

var _RangeObservable = require("rxjs/observable/RangeObservable");

var _Observable = require("rxjs/Observable");

// basic protocol helpers
var symbolExists = typeof Symbol !== "undefined"; /**
                                                   * @file Transducers.js
                                                   * @copyright 2014, James Long All rights reserved.
                                                   * @copyright 2017 W.S. Hager, slightly modified + extended version /w basic Observable interop and XQuery nomenclature
                                                  */

// "seq" is reserved for Frink sequences


var protocols = {
	iterator: symbolExists ? Symbol.iterator : "@@iterator"
};

function throwProtocolError(name, coll) {
	throw new Error("don't know how to " + name + " collection: " + coll);
}

function fulfillsProtocol(obj, name) {
	if (name === "iterator") {
		// Accept ill-formed iterators that don"t conform to the
		// protocol by accepting just next()
		return obj[protocols.iterator] || obj.next;
	}

	return obj[protocols[name]];
}

function getProtocolProperty(obj, name) {
	return obj[protocols[name]];
}

function iterator(coll) {
	var iter = getProtocolProperty(coll, "iterator");
	if (iter) {
		return iter.call(coll);
	} else if (coll.next) {
		// Basic duck typing to accept an ill-formed iterator that doesn"t
		// conform to the iterator protocol (all iterators should have the
		// @@iterator method and return themselves, but some engines don"t
		// have that on generators like older v8)
		return coll;
	} else if (isArray(coll)) {
		return new ArrayIterator(coll);
	} else if (isObject(coll)) {
		return new ObjectIterator(coll);
	}
}

function ArrayIterator(arr) {
	this.arr = arr;
	this.index = 0;
}

ArrayIterator.prototype.next = function () {
	if (this.index < this.arr.length) {
		return {
			value: this.arr[this.index++],
			done: false
		};
	}
	return {
		done: true
	};
};

function ObjectIterator(obj) {
	this.obj = obj;
	this.keys = Object.keys(obj);
	this.index = 0;
}

ObjectIterator.prototype.next = function () {
	if (this.index < this.keys.length) {
		var k = this.keys[this.index++];
		return {
			value: [k, this.obj[k]],
			done: false
		};
	}
	return {
		done: true
	};
};

// helpers

var toString = Object.prototype.toString;
var isArray = typeof Array.isArray === "function" ? Array.isArray : function (obj) {
	return toString.call(obj) == "[object Array]";
};

function isFunction(x) {
	return typeof x === "function";
}

function isObject(x) {
	return x instanceof Object && Object.getPrototypeOf(x) === Object.getPrototypeOf({});
}

function isNumber(x) {
	return typeof x === "number";
}

function Reduced(value) {
	this["@@transducer/reduced"] = true;
	this["@@transducer/value"] = value;
}

function isReduced(x) {
	return x instanceof Reduced || x && x["@@transducer/reduced"];
}

function deref(x) {
	return x["@@transducer/value"];
}

/**
 * This is for transforms that may call their nested transforms before
 * Reduced-wrapping the result (e.g. "take"), to avoid nested Reduced.
 */
function ensureReduced(val) {
	if (isReduced(val)) {
		return val;
	} else {
		return new Reduced(val);
	}
}

/**
 * This is for tranforms that call their nested transforms when
 * performing completion (like "partition"), to avoid signaling
 * termination after already completing.
 */
function ensureUnreduced(v) {
	if (isReduced(v)) {
		return deref(v);
	} else {
		return v;
	}
}

function isObservable(a) {
	return a && a instanceof _Observable.Observable;
}

function TransduceObserver(o, xform) {
	this._o = o;
	this._xform = xform;
}

TransduceObserver.prototype.next = function (x) {
	this._xform["@@transducer/step"].call(this._xform, this._o, x);
};

TransduceObserver.prototype.error = function (e) {
	this._o.error(e);
};

TransduceObserver.prototype.complete = function () {
	this._xform["@@transducer/result"](this._o);
};

function transformForObserver(o) {
	return {
		"@@transducer/init": function transducerInit() {
			return o;
		},
		"@@transducer/step": function transducerStep(obs, input) {
			return obs.next(input);
		},
		"@@transducer/result": function transducerResult(obs) {
			return obs.complete();
		}
	};
}

/**
 * Executes a transducer to transform the observable sequence
 * @param {Transducer} transducer A transducer to execute
 * @returns {Observable} An Observable sequence containing the results from the transducer.
 */
function transduceObservable(source, xform) {
	return new _Observable.Observable(function (o) {
		return source.subscribe(new TransduceObserver(o, xform(transformForObserver(o))));
	}, source);
}

function reduce(coll, xform, init) {
	var uninit = arguments.length == 2;
	if (isArray(coll)) {
		var index = uninit ? 0 : -1;
		var result = uninit ? coll[index] : init;
		var len = coll.length;
		while (++index < len) {
			result = xform["@@transducer/step"](result, coll[index]);
			if (isReduced(result)) {
				result = deref(result);
				break;
			}
		}
		return xform["@@transducer/result"](result);
	} else if (isObject(coll) || fulfillsProtocol(coll, "iterator")) {
		var iter = iterator(coll);
		var val = iter.next();
		var _result = !val.done && uninit ? val.value : init;
		if (!val.done && uninit) val = iter.next();
		while (!val.done) {
			_result = xform["@@transducer/step"](_result, val.value);
			if (isReduced(_result)) {
				_result = deref(_result);
				break;
			}
			val = iter.next();
		}
		return xform["@@transducer/result"](_result);
	} else if (isObservable(coll)) {
		var _result2 = init;
		coll.subscribe({
			next: function next(cur) {
				xform["@@transducer/step"](_result2, cur);
			},
			complete: function complete() {
				_result2 = xform["@@transducer/result"](_result2);
			}
		});
		return _result2;
	}
	throwProtocolError("iterate", coll);
}

function transduce(coll, xform, reducer, init) {
	xform = xform(reducer);
	if (init === undefined) {
		init = xform["@@transducer/init"]();
	}
	return reduce(coll, xform, init);
}

function compose() {
	var l = arguments.length;
	var funcs = new Array(l);
	for (var i = 0; i < l; ++i) {
		funcs[i] = arguments[i];
	}
	return function (r) {
		var value = r;
		for (var i = l - 1; i >= 0; i--) {
			value = funcs[i](value);
		}
		return value;
	};
}

// transformations
function transformer(f) {
	var t = {};
	t["@@transducer/init"] = function () {
		throw new Error("init value unavailable");
	};
	t["@@transducer/result"] = function (v) {
		return v;
	};
	t["@@transducer/step"] = f;
	return t;
}

function bound(f, ctx, count) {
	count = count != null ? count : 1;

	if (!ctx) {
		return f;
	} else {
		switch (count) {
			case 1:
				return function (x) {
					return f.call(ctx, x);
				};
			case 2:
				return function (x, y) {
					return f.call(ctx, x, y);
				};
			default:
				return f.bind(ctx);
		}
	}
}

function arrayMap(arr, f, ctx) {
	var index = -1;
	var length = arr.length;
	var result = Array(length);
	f = bound(f, ctx, 2);

	while (++index < length) {
		result[index] = f(arr[index], index);
	}
	return result;
}

function arrayFilter(arr, f, ctx) {
	var len = arr.length;
	var result = [];
	f = bound(f, ctx, 2);

	for (var i = 0; i < len; i++) {
		if (f(arr[i], i)) {
			result.push(arr[i]);
		}
	}
	return result;
}

function Map(f, xform) {
	this.xform = xform;
	this.f = f;
}

Map.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Map.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Map.prototype["@@transducer/step"] = function (res, input) {
	return this.xform["@@transducer/step"](res, this.f(input));
};

function map(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);

	if (coll) {
		if (isArray(coll)) {
			return arrayMap(coll, f, ctx);
		}
		return transform(coll, map(f));
	}

	return function (xform) {
		return new Map(f, xform);
	};
}

function Filter(f, xform) {
	this.xform = xform;
	this.f = f;
}

Filter.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Filter.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Filter.prototype["@@transducer/step"] = function (res, input) {
	if (this.f(input)) {
		return this.xform["@@transducer/step"](res, input);
	}
	return res;
};

function filter(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);

	if (coll) {
		if (isArray(coll)) {
			return arrayFilter(coll, f, ctx);
		}
		return transform(coll, filter(f));
	}

	return function (xform) {
		return new Filter(f, xform);
	};
}

function erase(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);
	return filter(coll, function (x) {
		return !f(x);
	});
}

function keep(coll) {
	return filter(coll, function (x) {
		return x != null;
	});
}

function Dedupe(xform) {
	this.xform = xform;
	this.last = undefined;
}

Dedupe.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Dedupe.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Dedupe.prototype["@@transducer/step"] = function (result, input) {
	if (input !== this.last) {
		this.last = input;
		return this.xform["@@transducer/step"](result, input);
	}
	return result;
};

function dedupe(coll) {
	if (coll) {
		return transform(coll, dedupe());
	}

	return function (xform) {
		return new Dedupe(xform);
	};
}

function TakeWhile(f, xform) {
	this.xform = xform;
	this.f = f;
}

TakeWhile.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

TakeWhile.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

TakeWhile.prototype["@@transducer/step"] = function (result, input) {
	if (this.f(input)) {
		return this.xform["@@transducer/step"](result, input);
	}
	return new Reduced(result);
};

function takeWhile(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);

	if (coll) {
		return transform(coll, takeWhile(f));
	}

	return function (xform) {
		return new TakeWhile(f, xform);
	};
}

function Take(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
}

Take.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Take.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Take.prototype["@@transducer/step"] = function (result, input) {
	if (this.i < this.n) {
		result = this.xform["@@transducer/step"](result, input);
		if (this.i + 1 >= this.n) {
			// Finish reducing on the same step as the final value. TODO:
			// double-check that this doesn"t break any semantics
			result = ensureReduced(result);
		}
	}
	this.i++;
	return result;
};

function take(coll, n) {
	if (isNumber(coll)) {
		n = coll;coll = null;
	}

	if (coll) {
		return transform(coll, take(n));
	}

	return function (xform) {
		return new Take(n, xform);
	};
}

function Drop(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
}

Drop.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Drop.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Drop.prototype["@@transducer/step"] = function (result, input) {
	if (this.i++ < this.n) {
		return result;
	}
	return this.xform["@@transducer/step"](result, input);
};

function drop(coll, n) {
	if (isNumber(coll)) {
		n = coll;coll = null;
	}

	if (coll) {
		return transform(coll, drop(n));
	}

	return function (xform) {
		return new Drop(n, xform);
	};
}

function DropWhile(f, xform) {
	this.xform = xform;
	this.f = f;
	this.dropping = true;
}

DropWhile.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

DropWhile.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

DropWhile.prototype["@@transducer/step"] = function (result, input) {
	if (this.dropping) {
		if (this.f(input)) {
			return result;
		} else {
			this.dropping = false;
		}
	}
	return this.xform["@@transducer/step"](result, input);
};

function dropWhile(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);

	if (coll) {
		return transform(coll, dropWhile(f));
	}

	return function (xform) {
		return new DropWhile(f, xform);
	};
}

function Partition(n, xform) {
	this.n = n;
	this.i = 0;
	this.xform = xform;
	this.part = new Array(n);
}

Partition.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Partition.prototype["@@transducer/result"] = function (v) {
	if (this.i > 0) {
		return ensureUnreduced(this.xform["@@transducer/step"](v, this.part.slice(0, this.i)));
	}
	return this.xform["@@transducer/result"](v);
};

Partition.prototype["@@transducer/step"] = function (result, input) {
	this.part[this.i] = input;
	this.i += 1;
	if (this.i === this.n) {
		var out = this.part.slice(0, this.n);
		this.part = new Array(this.n);
		this.i = 0;
		return this.xform["@@transducer/step"](result, out);
	}
	return result;
};

function partition(coll, n) {
	if (isNumber(coll)) {
		n = coll;coll = null;
	}

	if (coll) {
		return transform(coll, partition(n));
	}

	return function (xform) {
		return new Partition(n, xform);
	};
}

var NOTHING = {};

function PartitionBy(f, xform) {
	// TODO: take an "opts" object that allows the user to specify
	// equality
	this.f = f;
	this.xform = xform;
	this.part = [];
	this.last = NOTHING;
}

PartitionBy.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

PartitionBy.prototype["@@transducer/result"] = function (v) {
	var l = this.part.length;
	if (l > 0) {
		return ensureUnreduced(this.xform["@@transducer/step"](v, this.part.slice(0, l)));
	}
	return this.xform["@@transducer/result"](v);
};

PartitionBy.prototype["@@transducer/step"] = function (result, input) {
	var current = this.f(input);
	if (current === this.last || this.last === NOTHING) {
		this.part.push(input);
	} else {
		result = this.xform["@@transducer/step"](result, this.part);
		this.part = [input];
	}
	this.last = current;
	return result;
};

function partitionBy(coll, f, ctx) {
	if (isFunction(coll)) {
		ctx = f;f = coll;coll = null;
	}
	f = bound(f, ctx);

	if (coll) {
		return transform(coll, partitionBy(f));
	}

	return function (xform) {
		return new PartitionBy(f, xform);
	};
}

function Interpose(sep, xform) {
	this.sep = sep;
	this.xform = xform;
	this.started = false;
}

Interpose.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Interpose.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Interpose.prototype["@@transducer/step"] = function (result, input) {
	if (this.started) {
		var withSep = this.xform["@@transducer/step"](result, this.sep);
		if (isReduced(withSep)) {
			return withSep;
		} else {
			return this.xform["@@transducer/step"](withSep, input);
		}
	} else {
		this.started = true;
		return this.xform["@@transducer/step"](result, input);
	}
};

/**
 * Returns a new collection containing elements of the given
 * collection, separated by the specified separator. Returns a
 * transducer if a collection is not provided.
 */
function interpose(coll, separator) {
	if (arguments.length === 1) {
		separator = coll;
		return function (xform) {
			return new Interpose(separator, xform);
		};
	}
	return transform(coll, interpose(separator));
}

function Repeat(n, xform) {
	this.xform = xform;
	this.n = n;
}

Repeat.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Repeat.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Repeat.prototype["@@transducer/step"] = function (result, input) {
	var n = this.n;
	var r = result;
	for (var i = 0; i < n; i++) {
		r = this.xform["@@transducer/step"](r, input);
		if (isReduced(r)) {
			break;
		}
	}
	return r;
};

/**
 * Returns a new collection containing elements of the given
 * collection, each repeated n times. Returns a transducer if a
 * collection is not provided.
 */
function repeat(coll, n) {
	if (arguments.length === 1) {
		n = coll;
		return function (xform) {
			return new Repeat(n, xform);
		};
	}
	return transform(coll, repeat(n));
}

function TakeNth(n, xform) {
	this.xform = xform;
	this.n = n;
	this.i = -1;
}

TakeNth.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

TakeNth.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

TakeNth.prototype["@@transducer/step"] = function (result, input) {
	this.i += 1;
	if (this.i % this.n === 0) {
		return this.xform["@@transducer/step"](result, input);
	}
	return result;
};

/**
 * Returns a new collection of every nth element of the given
 * collection. Returns a transducer if a collection is not provided.
 */
function takeNth(coll, nth) {
	if (arguments.length === 1) {
		nth = coll;
		return function (xform) {
			return new TakeNth(nth, xform);
		};
	}
	return transform(coll, takeNth(nth));
}

// pure transducers (cannot take collections)

function Cat(xform) {
	this.xform = xform;
}

Cat.prototype["@@transducer/init"] = function () {
	return this.xform["@@transducer/init"]();
};

Cat.prototype["@@transducer/result"] = function (v) {
	return this.xform["@@transducer/result"](v);
};

Cat.prototype["@@transducer/step"] = function (result, input) {
	var xform = this.xform;
	var newxform = {};
	newxform["@@transducer/init"] = function () {
		return xform["@@transducer/init"]();
	};
	newxform["@@transducer/result"] = function (v) {
		return v;
	};
	newxform["@@transducer/step"] = function (result, input) {
		var val = xform["@@transducer/step"](result, input);
		return isReduced(val) ? deref(val) : val;
	};
	return reduce(input, newxform, result);
};

function cat(xform) {
	return new Cat(xform);
}

function concatMap(f, ctx) {
	f = bound(f, ctx);
	return compose(map(f), cat);
}

// collection helpers

function push(arr, x) {
	arr.push(x);
	return arr;
}

function merge(obj, x) {
	if (isArray(x) && x.length === 2) {
		obj[x[0]] = x[1];
	} else {
		var keys = Object.keys(x);
		var len = keys.length;
		for (var i = 0; i < len; i++) {
			obj[keys[i]] = x[keys[i]];
		}
	}
	return obj;
}

var arrayReducer = {};
arrayReducer["@@transducer/init"] = function () {
	return [];
};
arrayReducer["@@transducer/result"] = function (v) {
	return v;
};
arrayReducer["@@transducer/step"] = push;

var objReducer = {};
objReducer["@@transducer/init"] = function () {
	return {};
};
objReducer["@@transducer/result"] = function (v) {
	return v;
};
objReducer["@@transducer/step"] = merge;

// building new collections
/*
function toArray(coll, xform) {
	if(!xform) {
		return reduce(coll, arrayReducer, []);
	}
	return transduce(coll, xform, arrayReducer, []);
}

function toObj(coll, xform) {
	if(!xform) {
		return reduce(coll, objReducer, {});
	}
	return transduce(coll, xform, objReducer, {});
}

function toIter(coll, xform) {
	if(!xform) {
		return iterator(coll);
	}
	return new LazyTransformer(xform, coll);
}
*/
// renamed to transform
function transform(coll, xform) {
	if (isArray(coll)) {
		return transduce(coll, xform, arrayReducer, []);
	} else if (isObject(coll)) {
		return transduce(coll, xform, objReducer, {});
	} else if (coll["@@transducer/step"]) {
		var init;
		if (coll["@@transducer/init"]) {
			init = coll["@@transducer/init"]();
		} else {
			init = new coll.constructor();
		}
		return transduce(coll, xform, coll, init);
	} else if (fulfillsProtocol(coll, "iterator")) {
		return new LazyTransformer(xform, coll);
	} else if (isObservable(coll)) {
		return transduceObservable(coll, xform);
	}
	throwProtocolError("transform", coll);
}

// from and to are reversed
function into(from, xform, to) {
	if (isArray(to)) {
		return transduce(from, xform, arrayReducer, to);
	} else if (isObject(to)) {
		return transduce(from, xform, objReducer, to);
	} else if (to["@@transducer/step"]) {
		return transduce(from, xform, to, to);
	}
	throwProtocolError("into", to);
}

// laziness

var stepper = {};
stepper["@@transducer/result"] = function (v) {
	return isReduced(v) ? deref(v) : v;
};
stepper["@@transducer/step"] = function (lt, x) {
	lt.items.push(x);
	return lt.rest;
};

function Stepper(xform, iter) {
	this.xform = xform(stepper);
	this.iter = iter;
}

Stepper.prototype["@@transducer/step"] = function (lt) {
	var len = lt.items.length;
	while (lt.items.length === len) {
		var n = this.iter.next();
		if (n.done || isReduced(n.value)) {
			// finalize
			this.xform["@@transducer/result"](this);
			break;
		}

		// step
		this.xform["@@transducer/step"](lt, n.value);
	}
};

function LazyTransformer(xform, coll) {
	this.iter = iterator(coll);
	this.items = [];
	this.stepper = new Stepper(xform, iterator(coll));
}

LazyTransformer.prototype[protocols.iterator] = function () {
	return this;
};

LazyTransformer.prototype.next = function () {
	this["@@transducer/step"]();

	if (this.items.length) {
		return {
			value: this.items.pop(),
			done: false
		};
	} else {
		return { done: true };
	}
};

LazyTransformer.prototype["@@transducer/step"] = function () {
	if (!this.items.length) {
		this.stepper["@@transducer/step"](this);
	}
};

function forEach(iterable, f) {
	if (arguments.length == 1) return map(iterable);
	return transform(iterable, map(f));
}
/*
export function distinctCat(iterable, f) {
	if (arguments.length < 2) return distinctCat$1(iterable || _contains);
	return _iterate(iterable, distinctCat$1(f), _new(iterable));
}
*/
// non-composable
function foldLeft(iterable, z, f) {
	if (isFunction(iterable.reduce)) {
		return arguments.length == 2 ? iterable.reduce(z) : iterable.reduce(f, z);
	}
	return arguments.length == 2 ? reduce(iterable, transformer(z)) : reduce(iterable, transformer(f), z);
}

function range(n) {
	var s = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

	return (0, _seq.seq)(new _RangeObservable.RangeObservable(s, n));
}

},{"./seq":50,"rxjs/Observable":2,"rxjs/observable/RangeObservable":16}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.validate = validate;
exports.validation = validation;

var _doc = require("./doc");

var _access = require("./access");

var _transducers = require("./transducers");

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(obj, prop) {
	if (obj.hasOwnProperty(prop)) return obj[prop];
}

function ucs2length(string) {
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			var extra = string.charCodeAt(counter);
			if ((extra & 0xFC00) == 0xDC00) counter++; // Low surrogate.
		}
	}
	return counter;
}

function _formAttrNameToKey(k) {
	if (k == "data-type") return "type";
	if (k == "type") return "format";
	if (k == "min") return "minimum";
	if (k == "max") return "maximum";
	if (k == "maxlength") return "maxLength";
	return k;
}

function _formNodeToSchema(node) {
	var inode = node.inode;
	var attrs = inode.attributes;
	if (attrs.hidden || attrs.disabled) return;
	var s = {};
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = attrs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var a = _step.value;

			var k = _formAttrNameToKey(a.name);
			if (validator[k]) {
				s[k] = a.value;
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	if (inode.type == "select-one") {
		s.enum = (0, _transducers.into)(inode.options, (0, _transducers.forEach)(function (o) {
			return o.value;
		}), []);
	}
	return s;
}

/**
 * Validate a doc against a schema
 * @param {INode|VNode} doc The doc or VNode to validate
 * @param {any} schema A JSON schema with XML extension
 * @return {VNode} A document containing errors
 */
function validate(node, schema) {
	var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	node = node.inode ? node : _doc.ensureDoc.bind(this)(node);
	var depth = node.depth,
	    entries = [],
	    err = [],
	    index = "#",
	    path = "";
	if (params.form) {
		index = node.name;
		path = node.parent ? node.parent.name : path;
		schema = node.schema = _formNodeToSchema(node);
	}
	var entry = validation(schema, params, index, path, err);
	entry[0].call(null, node);
	//var errCount = [err.length];
	while (node) {
		node = (0, _access.nextNode)(node);
		if (!node) return err;
		if (params.form) {
			if (node.type == 17) continue;
			// prevent child schema if no parent schema
			node.schema = node.parent.schema && _formNodeToSchema(node);
			entry = validation(node.schema, params, node.name, path, err);
			if (entry) entry[0].call(null, node);
		} else {
			if (node.type == 17) {
				depth--;
				entry = entries[depth];
			} else if (node.depth == depth + 1) {
				entries[depth] = entry;
				depth++;
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1](node);
				if (entry) entry[0].call(null, node);
			} else if (node.depth == depth) {
				entry = entries[depth - 1];
				if (!entry[1]) {
					console.log("skipping", node.name);
					continue;
				}
				entry = entry[1].call(null, node);
				if (entry) entry[0].call(null, node);
			}
		}
	}
	return err;
}

function compose(funcs) {
	var len = funcs.length;
	return function (node) {
		var entries = [[], []];
		for (var i = 0; i < len; i++) {
			if (!funcs[i]) continue;
			var ret = funcs[i].call(null, node);
			if (ret && ret.length) {
				entries[0].push(ret[0]);
				entries[1].push(ret[1]);
			}
		}
		return [compose(entries[0]), compose(entries[1])];
	};
}

function validation(schema, params, index, path, err) {
	if (!schema) return;
	var sc = schema.constructor;
	var entry;
	if (sc === Object) {
		var keys = Object.keys(schema);
		var funcs = [];
		// TODO compose a function that will contain all rules for a level
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var k = _step2.value;

				if (!/properties|patternProperties|items/.test(k)) {
					if (!validator[k]) {
						console.log("Unsupported " + k);
						continue;
					}
					funcs.push(validator[k].bind(null, schema, k, params, index, path, err));
				}
			}
			// TODO what if there are more?
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var childFuncs = [];
		var _arr = ["properties", "patternProperties", "items"];
		for (var _i = 0; _i < _arr.length; _i++) {
			var _k = _arr[_i];
			var childSchema = get(schema, _k);
			if (childSchema) childFuncs.push(validator[_k].bind(null, schema, _k, params, index, path, err));
		}
		entry = [compose(funcs), compose(childFuncs)];
	} else if (sc === Array) {
		// an array of schemas to validate against, meaning at least one of the must match
		var _funcs = [];
		var _childFuncs = [];
		for (var i = 0, len = schema.length; i < len; i++) {
			var _entry = validation(schema[i], params, index, path, err);
			_funcs.push(_entry[0]);
			_childFuncs.push(_entry[1]);
		}
		entry = [compose(_funcs), compose(_childFuncs)];
	} else if (sc === String) {
		entry = [validator.type.bind(null, { type: schema }, "type", params, index, path, err)];
	}
	return entry;
}

function X(schema, key, path, validationMessage, faults) {
	this.schema = schema;
	this.key = key;
	this.path = path;
	this.validationMessage = validationMessage;
	this.faults = faults;
}

function x(schema, key, params, path, node, faults) {
	var validationMessage = params.form ? node.attr("validationMessage") : "";
	return new X(schema, key, path, validationMessage, faults);
}

// TODO types are functions, so allow adding custom functions
// TODO use XVType, coersion
var types = {
	null: function _null(node) {
		return node.type == 12 && node.value === null;
	},
	string: function string(node) {
		return node.type == 3;
	},
	number: function number(node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	double: function double(node) {
		return node.type == 12 && typeof node.value == "number" && !isNaN(node.value);
	},
	boolean: function boolean(node) {
		return node.type == 12 && typeof node.value == "boolean";
	},
	integer: function integer(node) {
		var val = node.value;
		if (val === null || val === undefined) return false;
		var ret = false;
		try {
			if (val.constructor != _big2.default) val = new _big2.default(val);
			ret = (node.type == 3 || node.type == 12) && val.c.length - val.e === 1;
		} catch (err) {
			console.log(val, err);
		}
		return ret;
	},
	element: function element(node) {
		return node.type == 1;
	},
	array: function array(node) {
		return node.type == 5;
	},
	object: function object(node) {
		return node.type == 6;
	},
	map: function map(node) {
		return node.type == 6;
	}
};

var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;
//var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[a-f0-9]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
//var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[a-f0-9]{2})*@)?(?:\[(?:(?:(?:(?:[a-f0-9]{1,4}:){6}|::(?:[a-f0-9]{1,4}:){5}|(?:[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){4}|(?:(?:[a-f0-9]{1,4}:){0,1}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){3}|(?:(?:[a-f0-9]{1,4}:){0,2}[a-f0-9]{1,4})?::(?:[a-f0-9]{1,4}:){2}|(?:(?:[a-f0-9]{1,4}:){0,3}[a-f0-9]{1,4})?::[a-f0-9]{1,4}:|(?:(?:[a-f0-9]{1,4}:){0,4}[a-f0-9]{1,4})?::)(?:[a-f0-9]{1,4}:[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[a-f0-9]{1,4}:){0,5}[a-f0-9]{1,4})?::[a-f0-9]{1,4}|(?:(?:[a-f0-9]{1,4}:){0,6}[a-f0-9]{1,4})?::)|[Vv][a-f0-9]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[a-f0-9]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[a-f0-9]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'"()*+,;=:@\/?]|%[a-f0-9]{2})*)?$/i;
// uri-template: https://tools.ietf.org/html/rfc6570
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[a-f0-9]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[a-f0-9]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[a-f0-9]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
// For the source: https://gist.github.com/dperini/729294
// For test cases: https://mathiasbynens.be/demo/url-regex
// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
var UUID = /^(?:urn:uuid:)?[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$|^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[a-f0-9]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;

var formats = {
	// date: http://tools.ietf.org/html/rfc3339#section-5.6
	date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
	// date-time: http://tools.ietf.org/html/rfc3339#section-5.6
	time: /^[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i,
	"date-time": /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
	// uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
	uri: /^(?:[a-z][a-z0-9+-.]*)(?::|\/)\/?[^\s]*$/i,
	"uri-reference": /^(?:(?:[a-z][a-z0-9+-.]*:)?\/\/)?[^\s]*$/i,
	"uri-template": URITEMPLATE,
	url: URL,
	// email (sources from jsen validator):
	// http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
	// http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
	email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
	hostname: HOSTNAME,
	// optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
	ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
	// optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
	ipv6: /^\s*(?:(?:(?:[a-f0-9]{1,4}:){7}(?:[a-f0-9]{1,4}|:))|(?:(?:[a-f0-9]{1,4}:){6}(?::[a-f0-9]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){5}(?:(?:(?::[a-f0-9]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[a-f0-9]{1,4}:){4}(?:(?:(?::[a-f0-9]{1,4}){1,3})|(?:(?::[a-f0-9]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){3}(?:(?:(?::[a-f0-9]{1,4}){1,4})|(?:(?::[a-f0-9]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){2}(?:(?:(?::[a-f0-9]{1,4}){1,5})|(?:(?::[a-f0-9]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[a-f0-9]{1,4}:){1}(?:(?:(?::[a-f0-9]{1,4}){1,6})|(?:(?::[a-f0-9]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[a-f0-9]{1,4}){1,7})|(?:(?::[a-f0-9]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
	regex: regex,
	// uuid: http://tools.ietf.org/html/rfc4122
	uuid: UUID,
	// JSON-pointer: https://tools.ietf.org/html/rfc6901
	// uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
	"json-pointer": JSON_POINTER,
	// relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
	"relative-json-pointer": RELATIVE_JSON_POINTER
};

var Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
	if (Z_ANCHOR.test(str)) return false;
	try {
		new RegExp(str);
		return true;
	} catch (e) {
		return false;
	}
}

var validator = {
	value: function value(schema, key, params, index, path, err, node) {
		if (params.form) {
			if (!node.inode.checkValidity()) {
				err.push(x(schema, key, params, path + "/" + index, node));
			}
		}
	},
	type: function type(schema, key, params, index, path, err, node) {
		var type = schema[key];
		var ret;
		if (type instanceof Array) {
			ret = (0, _transducers.foldLeft)((0, _transducers.forEach)(type, function (t) {
				return types[t](node);
			}), false, function (r, z) {
				return r || z;
			});
		} else {
			ret = types[type](node);
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	format: function format(schema, key, params, index, path, err, node) {
		var name = schema[key];
		var format = params.formats ? params.formats[name] : formats[name];
		if (!format) {
			console.log("Unknown format " + name);
		} else {
			var fn = typeof format == "function" ? format : function (v) {
				return !!v.match(format);
			};
			if (!fn(node.value)) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	required: function required(schema, key, params, index, path, err, node) {
		// for forms:
		if (params.form) {
			if (!node.value) err.push(x(schema, key, params, path + "/" + index, node));
		}
	},
	properties: function properties(schema, key, params, index, path, err, node) {
		// default is allErrors=true, so all children should be validated
		// this function will be passed to the children matching key + schema
		// when applied, the function uses the matching prop and updated path
		var props = schema[key];
		schema = get(props, node.name);
		if (schema) return validation(schema, params, node.name, path + "/" + index, err);
	},
	patternProperties: function patternProperties(schema, key, params, index, path, err, node) {
		var pattProps = get(schema, key);
		var patterns;
		if (pattProps) {
			patterns = get(schema, "patternPropertiesREGEXP");
			if (!patterns) {
				patterns = {};
				for (var k in pattProps) {
					patterns[k] = new RegExp(k);
				}
				schema.patternPropertiesREGEXP = patterns;
			}
		}
		var patternMatcher = function patternMatcher(key) {
			var ret = [];
			for (var k in patterns) {
				if (patterns[k].test(key)) ret.push(pattProps[k]);
			}
			return ret;
		};
		var newpath = path + "/" + index;
		var schemas = patternMatcher(node.name);
		if (schemas.length) return validation(schemas, params, node.name, newpath, err);
	},
	additionalProperties: function additionalProperties(schema, key, params, index, path, err, node) {
		var additionalProps = get(schema, key);
		if (additionalProps === false) {
			var props = get(schema, "properties");
			var pattProps = get(schema, "patternProperties");
			var patterns;
			if (pattProps) {
				patterns = get(schema, "patternPropertiesREGEXP");
				if (!patterns) {
					patterns = {};
					for (var k in pattProps) {
						patterns[k] = new RegExp(k);
					}
					schema.patternPropertiesREGEXP = patterns;
				}
			}
			var patternMatcher = function patternMatcher(key) {
				for (var k in patterns) {
					if (patterns[k].test(key)) return true;
				}
				return false;
			};
			var faults = [];
			var newpath = path + "/" + index;
			var keys = node.keys();
			var len = node.count();
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _k2 = _step3.value;

					if (props[_k2] || patternMatcher(_k2)) {
						len--;
					} else {
						faults.push(_k2);
					}
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}

			if (len > 0) err.push(x(schema, key, params, newpath, node, faults));
		}
	},
	items: function items(schema, key, params, index, path, err, node) {
		var schemas = schema[key];
		var newpath = path + "/" + index;
		schema = schemas[node.indexInParent];
		if (schema) return validation(schema, params, node.name, newpath, err);
	},
	additionalItems: function additionalItems(schema, key, params, index, path, err, node) {
		//var additionalItems = schema[key];
		var items = schema.items;
		if (items.length !== node.count()) err.push(x(schema, key, params, path + "/" + index, node));
	},
	minimum: function minimum(schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.gte(test);
		} else {
			ret = node.value >= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maximum: function maximum(schema, key, params, index, path, err, node) {
		var test = schema[key];
		var ret = false;
		if (node.value && node.value.constructor == _big2.default) {
			ret = node.value.lte(test);
		} else {
			ret = node.value <= test;
		}
		if (!ret) err.push(x(schema, key, params, path + "/" + index, node));
	},
	minLength: function minLength(schema, key, params, index, path, err, node) {
		var test = schema[key];
		if (!node.value) return;
		if (ucs2length(node.value) < test) err.push(x(schema, key, params, path + "/" + index, node));
	},
	maxLength: function maxLength(schema, key, params, index, path, err, node) {
		var test = schema[key];
		if (!node.value) return;
		if (ucs2length(node.value) > test) err.push(x(schema, key, params, path + "/" + index, node));
	}
};

},{"./access":39,"./doc":40,"./transducers":51,"big.js":38}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.VNode = VNode;

var _access = require("./access");

function VNode(cx, inode, type, name, value, parent, depth, indexInParent, cache) {
	this.cx = cx;
	this.inode = inode;
	this.type = type;
	this.name = name;
	this.value = value;
	this.parent = parent;
	this.depth = depth | 0;
	this.indexInParent = indexInParent;
	this.cache = cache;
}

VNode.prototype.__is_VNode = true;

VNode.prototype.toString = function () {
	return this.cx.stringify(this.inode);
};

VNode.prototype.count = function () {
	if (typeof this.inode == "function") return 0;
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.count(this.inode, this.type, this.cache);
};

VNode.prototype.keys = function () {
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.keys(this.inode, this.type, this.cache);
};

VNode.prototype.values = function () {
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.values(this.inode, this.type, this.cache);
};

VNode.prototype.first = function () {
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.first(this.inode, this.type, this.cache);
};

VNode.prototype.last = function () {
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.last(this.inode, this.type, this.cache);
};

VNode.prototype.next = function (node) {
	if (!this.cache) this.cache = this.cx.cached(this.inode, this.type);
	return this.cx.next(this.inode, node, this.type, this.cache);
};

// TODO cache invalidation
VNode.prototype.push = function (child) {
	this.inode = this.cx.push(this.inode, [child.name, child.inode], this.type);
	return this;
};

VNode.prototype.set = function (key, val) {
	this.inode = this.cx.set(this.inode, key, val, this.type);
	return this;
};

VNode.prototype.removeChild = function (child) {
	this.inode = this.cx.removeChild(this.inode, child, this.type);
	return this;
};

VNode.prototype.finalize = function () {
	this.inode = this.cx.finalize(this.inode);
	return this;
};

VNode.prototype.attrEntries = function () {
	return this.cx.attrEntries(this.inode);
};

VNode.prototype.attr = function (k, v) {
	if (arguments.length == 1) return this.cx.getAttribute(this.inode, k);
	if (arguments.length === 0) {
		this.inode = this.cx.clearAttributes(this.inode);
	} else {
		this.inode = this.cx.setAttribute(this.inode, k, v);
	}
	return this;
};

VNode.prototype.modify = function (node, ref) {
	this.inode = this.cx.modify(this.inode, node, ref, this.type);
	return this;
};

// hitch this on VNode for reuse
VNode.prototype.vnode = function (inode, parent, depth, indexInParent) {
	return this.cx.vnode(inode, parent, depth, indexInParent);
};

VNode.prototype.ivalue = function (type, name, value) {
	return this.cx.ivalue(type, name, value);
};

VNode.prototype.emptyINode = function (type, name, attrs, ns) {
	return this.cx.emptyINode(type, name, attrs, ns);
};

VNode.prototype.emptyAttrMap = function (init) {
	return this.cx.emptyAttrMap(init);
};

// TODO create iterator that yields a node seq
// position() should overwrite get(), but the check should be name or indexInParent
VNode.prototype[Symbol.iterator] = function () {
	var values = this.type == 2 ? [this.inode][Symbol.iterator]() : this.values()[Symbol.iterator]();
	return new _access.VNodeIterator(values, this, this.cx.vnode);
};

VNode.prototype.get = function (idx) {
	var val = this.cx.get(this.inode, idx, this.type, this.cache);
	if (!val) return [];
	//val = val.next || val.constructor == Array ? val : [val];
	//console.log(val[Symbol.iterator]());
	return new _access.VNodeIterator(val.next ? val : val[Symbol.iterator](), this, this.cx.vnode);
};

},{"./access":39}]},{},[46])(46)
});