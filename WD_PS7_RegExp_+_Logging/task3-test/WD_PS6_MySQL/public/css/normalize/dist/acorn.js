 @see {@link subscribe}\n *\n * @param {Observer|function} [nextOrObserver] A normal Observer object or a\n * callback for `next`.\n * @param {function} [error] Callback for errors in the source.\n * @param {function} [complete] Callback for the completion of the source.\n * @return {Observable} An Observable identical to the source, but runs the\n * specified Observer or callback(s) for each item.\n * @name tap\n */\nexport function tap<T>(nextOrObserver?: PartialObserver<T> | ((x: T) => void),\n                       error?: (e: any) => void,\n                       complete?: () => void): MonoTypeOperatorFunction<T> {\n  return function tapOperatorFunction(source: Observable<T>): Observable<T> {\n    return source.lift(new DoOperator(nextOrObserver, error, complete));\n  };\n}\n\nclass DoOperator<T> implements Operator<T, T> {\n  constructor(private nextOrObserver?: PartialObserver<T> | ((x: T) => void),\n              private error?: (e: any) => void,\n              private complete?: () => void) {\n  }\n  call(subscriber: Subscriber<T>, source: any): TeardownLogic {\n    return source.subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));\n  }\n}\n\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nclass DoSubscriber<T> extends Subscriber<T> {\n\n  private safeSubscriber: Subscriber<T>;\n\n  constructor(destination: Subscriber<T>,\n              nextOrObserver?: PartialObserver<T> | ((x: T) => void),\n              error?: (e: any) => void,\n              complete?: () => void) {\n    super(destination);\n\n    const safeSubscriber = new Subscriber<T>(nextOrObserver, error, complete);\n    safeSubscriber.syncErrorThrowable = true;\n    this.add(safeSubscriber);\n    this.safeSubscriber = safeSubscriber;\n  }\n\n  protected _next(value: T): void {\n    const { safeSubscriber } = this;\n    safeSubscriber.next(value);\n    if (safeSubscriber.syncErrorThrown) {\n      this.destination.error(safeSubscriber.syncErrorValue);\n    } else {\n      this.destination.next(value);\n    }\n  }\n\n  protected _error(err: any): void {\n    const { safeSubscriber } = this;\n    safeSubscriber.error(err);\n    if (safeSubscriber.syncErrorThrown) {\n      this.destination.error(safeSubscriber.syncErrorValue);\n    } else {\n      this.destination.error(err);\n    }\n  }\n\n  protected _complete(): void {\n    const { safeSubscriber } = this;\n    safeSubscriber.complete();\n    if (safeSubscriber.syncErrorThrown) {\n      this.destination.error(safeSubscriber.syncErrorValue);\n    } else {\n      this.destination.complete();\n    }\n  }\n}\n"]}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              "use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
exports.defaultThrottleConfig = {
    leading: true,
    trailing: false
};
/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for a duration determined by another Observable, then repeats this
 * process.
 *
 * <span class="informal">It's like {@link throttleTime}, but the silencing
 * duration is determined by a second Observable.</span>
 *
 * <img src="./img/throttle.png" width="100%">
 *
 * `throttle` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled by calling the `durationSelector` function with the source value,
 * which returns the "duration" Observable. When the duration Observable emits a
 * value or completes, the timer is disabled, and this process repeats for the
 * next source value.
 *
 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.throttle(ev => Rx.Observable.interval(1000));
 * result.subscribe(x => console.log(x));
 *
 * @see {@link audit}
 * @see {@link debounce}
 * @see {@link delayWhen}
 * @see {@link sample}
 * @see {@link throttleTime}
 *
 * @param {function(value: T): SubscribableOrPromise} durationSelector A function
 * that receives a value from the source Observable, for computing the silencing
 * duration for each source value, returned as an Observable or a Promise.
 * @param {Object} config a configuration object to define `leading` and `trailing` behavior. Defaults
 * to `{ leading: true, trailing: false }`.
 * @return {Observable<T>} An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 * @method throttle
 * @owner Observable
 */
function throttle(durationSelector, config) {
    if (config === void 0) { config = exports.defaultThrottleConfig; }
    return function (source) { return source.lift(new ThrottleOperator(durationSelector, config.leading, config.trailing)); };
}
exports.throttle = throttle;
var ThrottleOperator = (function () {
    function ThrottleOperator(durationSelector, leading, trailing) {
        this.durationSelector = durationSelector;
        this.leading = leading;
        this.trailing = trailing;
    }
    ThrottleOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing));
    };
    return ThrottleOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc
 * @ignore
 * @extends {Ignored}
 */
var ThrottleSubscriber = (function (_super) {
    __extends(ThrottleSubscriber, _super);
    function ThrottleSubscriber(destination, durationSelector, _leading, _trailing) {
        _super.call(this, destination);
        this.destination = destination;
        this.durationSelector = durationSelector;
        this._leading = _leading;
        this._trailing = _trailing;
        this._hasTrailingValue = false;
    }
    ThrottleSubscriber.prototype._next = function (value) {
        if (this.throttled) {
            if (this._trailing) {
                this._hasTrailingValue = true;
                this._trailingValue = value;
            }
        }
        else {
            var duration = this.tryDurationSelector(value);
            if (duration) {
                this.add(this.throttled = subscribeToResult_1.subscribeToResult(this, duration));
            }
            if (this._leading) {
                this.destination.next(value);
                if (this._trailing) {
                    this._hasTrailingValue = true;
                    this._trailingValue = value;
                }
            }
        }
    };
    ThrottleSubscriber.prototype.tryDurationSelector = function (value) {
        try {
            return this.durationSelector(value);
        }
        catch (err) {
            this.destination.error(err);
            return null;
        }
    };
    /** @deprecated internal use only */ ThrottleSubscriber.prototype._unsubscribe = function () {
        var _a = this, throttled = _a.throttled, _trailingValue = _a._trailingValue, _hasTrailingValue = _a._hasTrailingValue, _trailing = _a._trailing;
        this._trailingValue = null;
        this._hasTrailingValue = false;
        if (throttled) {
            this.remove(throttled);
            this.throttled = null;
            throttled.unsubscribe();
        }
    };
    ThrottleSubscriber.prototype._sendTrailing = function () {
        var _a = this, destination = _a.destination, throttled = _a.throttled, _trailing = _a._trailing, _trailingValue = _a._trailingValue, _hasTrailingValue = _a._hasTrailingValue;
        if (throttled && _trailing && _hasTrailingValue) {
            destination.next(_trailingValue);
            this._trailingValue = null;
            this._hasTrailingValue = false;
        }
    };
    ThrottleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this._sendTrailing();
        this._unsubscribe();
    };
    ThrottleSubscriber.prototype.notifyComplete = function () {
        this._sendTrailing();
        this._unsubscribe();
    };
    return ThrottleSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
//# sourceMappingURL=throttle.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   {"version":3,"file":"throttle.js","sourceRoot":"","sources":["../../src/operators/throttle.ts"],"names":[],"mappings":"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","sourcesContent":["import { Operator } from '../Operator';\nimport { Observable, SubscribableOrPromise } from '../Observable';\nimport { Subscriber } from '../Subscriber';\nimport { Subscription, TeardownLogic } from '../Subscription';\n\nimport { OuterSubscriber } from '../OuterSubscriber';\nimport { InnerSubscriber } from '../InnerSubscriber';\nimport { subscribeToResult } from '../util/subscribeToResult';\n\nimport { MonoTypeOperatorFunction } from '../interfaces';\n\nexport interface ThrottleConfig {\n  leading?: boolean;\n  trailing?: boolean;\n}\n\nexport const defaultThrottleConfig: ThrottleConfig = {\n  leading: true,\n  trailing: false\n};\n\n/**\n * Emits a value from the source Observable, then ignores subsequent source\n * values for a duration determined by another Observable, then repeats this\n * process.\n *\n * <span class=\"informal\">It's like {@link throttleTime}, but the silencing\n * duration is determined by a second Observable.</span>\n *\n * <img src=\"./img/throttle.png\" width=\"100%\">\n *\n * `throttle` emits the source Observable values on the output Observable\n * when its internal timer is disabled, and ignores source values when the timer\n * is enabled. Initially, the timer is disabled. As soon as the first source\n * value arrives, it is forwarded to the output Observable, and then the timer\n * is enabled by calling the `durationSelector` function with the source value,\n * which returns the \"duration\" Observable. When the duration Observable emits a\n * value or completes, the timer is disabled, and this process repeats for the\n * next source value.\n *\n * @example <caption>Emit clicks at a rate of at most one click per second</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.throttle(ev => Rx.Observable.interval(1000));\n * result.subscribe(x => console.log(x));\n *\n * @see {@link audit}\n * @see {@link debounce}\n * @see {@link delayWhen}\n * @see {@link sample}\n * @see {@link throttleTime}\n *\n * @param {function(value: T): SubscribableOrPromise} durationSelector A function\n * that receives a value from the source Observable, for computing the silencing\n * duration for each source value, returned as an Observable or a Promise.\n * @param {Object} config a configuration object to define `leading` and `trailing` behavior. Defaults\n * to `{ leading: true, trailing: false }`.\n * @return {Observable<T>} An Observable that performs the throttle operation to\n * limit the rate of emissions from the source.\n * @method throttle\n * @owner Observable\n */\nexport function throttle<T>(durationSelector: (value: T) => SubscribableOrPromise<number>,\n                            config: ThrottleConfig = defaultThrottleConfig): MonoTypeOperatorFunction<T> {\n  return (source: Observable<T>) => source.lift(new ThrottleOperator(durationSelector, config.leading, config.trailing));\n}\n\nclass ThrottleOperator<T> implements Operator<T, T> {\n  constructor(private durationSelector: (value: T) => SubscribableOrPromise<number>,\n              private leading: boolean,\n              private trailing: boolean) {\n  }\n\n  call(subscriber: Subscriber<T>, source: any): TeardownLogic {\n    return source.subscribe(\n      new ThrottleSubscriber(subscriber, this.durationSelector, this.leading, this.trailing)\n    );\n  }\n}\n\n/**\n * We need this JSDoc comment for affecting ESDoc\n * @ignore\n * @extends {Ignored}\n */\nclass ThrottleSubscriber<T, R> extends OuterSubscriber<T, R> {\n  private throttled: Subscription;\n  private _trailingValue: T;\n  private _hasTrailingValue = false;\n\n  constructor(protected destination: Subscriber<T>,\n              private durationSelector: (value: T) => SubscribableOrPromise<number>,\n              private _leading: boolean,\n              private _trailing: boolean) {\n    super(destination);\n  }\n\n  protected _next(value: T): void {\n    if (this.throttled) {\n      if (this._trailing) {\n        this._hasTrailingValue = true;\n        this._trailingValue = value;\n      }\n    } else {\n      const duration = this.tryDurationSelector(value);\n      if (duration) {\n        this.add(this.throttled = subscribeToResult(this, duration));\n      }\n      if (this._leading) {\n        this.destination.next(value);\n        if (this._trailing) {\n          this._hasTrailingValue = true;\n          this._trailingValue = value;\n        }\n      }\n    }\n  }\n\n  private tryDurationSelector(value: T): SubscribableOrPromise<any> {\n    try {\n      return this.durationSelector(value);\n    } catch (err) {\n      this.destination.error(err);\n      return null;\n    }\n  }\n\n  /** @deprecated internal use only */ _unsubscribe() {\n    const { throttled, _trailingValue, _hasTrailingValue, _trailing } = this;\n\n    this._trailingValue = null;\n    this._hasTrailingValue = false;\n\n    if (throttled) {\n      this.remove(throttled);\n      this.throttled = null;\n      throttled.unsubscribe();\n    }\n  }\n\n  private _sendTrailing() {\n    const { destination, throttled, _trailing, _trailingValue, _hasTrailingValue } = this;\n    if (throttled && _trailing && _hasTrailingValue) {\n      destination.next(_trailingValue);\n      this._trailingValue = null;\n      this._hasTrailingValue = false;\n    }\n  }\n\n  notifyNext(outerValue: T, innerValue: R,\n             outerIndex: number, innerIndex: number,\n             innerSub: InnerSubscriber<T, R>): void {\n    this._sendTrailing();\n    this._unsubscribe();\n  }\n\n  notifyComplete(): void {\n    this._sendTrailing();\n    this._unsubscribe();\n  }\n}\n"]}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       "use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var async_1 = require('../scheduler/async');
var throttle_1 = require('./throttle');
/**
 * Emits a value from the source Observable, then ignores subsequent source
 * values for `duration` milliseconds, then repeats this process.
 *
 * <span class="informal">Lets a value pass, then ignores source values for the
 * next `duration` milliseconds.</span>
 *
 * <img src="./img/throttleTime.png" width="100%">
 *
 * `throttleTime` emits the source Observable values on the output Observable
 * when its internal timer is disabled, and ignores source values when the timer
 * is enabled. Initially, the timer is disabled. As soon as the first source
 * value arrives, it is forwarded to the output Observable, and then the timer
 * is enabled. After `duration` milliseconds (or the time unit determined
 * internally by the optional `scheduler`) has passed, the timer is disabled,
 * and this process repeats for the next source value. Optionally takes a
 * {@link IScheduler} for managing timers.
 *
 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * var result = clicks.throttleTime(1000);
 * result.subscribe(x => console.log(x));
 *
 * @see {@link auditTime}
 * @see {@link debounceTime}
 * @see {@link delay}
 * @see {@link sampleTime}
 * @see {@link throttle}
 *
 * @param {number} duration Time to wait before emitting another value after
 * emitting the last value, measured in milliseconds or the time unit determined
 * internally by the optional `scheduler`.
 * @param {Scheduler} [scheduler=async] The {@link IScheduler} to use for
 * managing the timers that handle the throttling.
 * @return {Observable<T>} An Observable that performs the throttle operation to
 * limit the rate of emissions from the source.
 * @method throttleTime
 * @owner Observable
 */
function throttleTime(duration, scheduler, config) {
    if (scheduler === void 0) { scheduler = async_1.async; }
    if (config === void 0) { config = throttle_1.defaultThrottleConfig; }
    return function (source) { return source.lift(new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing)); };
}
exports.throttleTime = throttleTime;
var ThrottleTimeOperator = (function () {
    function ThrottleTimeOperator(duration, scheduler, leading, trailing) {
        this.duration = duration;
        this.scheduler = scheduler;
        this.leading = leading;
        this.trailing = trailing;
    }
    ThrottleTimeOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing));
    };
    return ThrottleTimeOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var ThrottleTimeSubscriber = (function (_super) {
    __extends(ThrottleTimeSubscriber, _super);
    function ThrottleTimeSubscriber(destination, duration, scheduler, leading, trailing) {
        _super.call(this, destination);
        this.duration = duration;
        this.scheduler = scheduler;
        this.leading = leading;
        this.trailing = trailing;
        this._hasTrailingValue = false;
        this._trailingValue = null;
    }
    ThrottleTimeSubscriber.prototype._next = function (value) {
        if (this.throttled) {
            if (this.trailing) {
                this._trailingValue = value;
                this._hasTrailingValue = true;
            }
        }
        else {
            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));
            if (this.leading) {
                this.destination.next(value);
            }
        }
    };
    ThrottleTimeSubscriber.prototype.clearThrottle = function () {
        var throttled = this.throttled;
        if (throttled) {
            if (this.trailing && this._hasTrailingValue) {
                this.destination.next(this._trailingValue);
                this._trailingValue = null;
                this._hasTrailingValue = false;
            }
            throttled.unsubscribe();
            this.remove(throttled);
            this.throttled = null;
        }
    };
    return ThrottleTimeSubscriber;
}(Subscriber_1.Subscriber));
function dispatchNext(arg) {
    var subscriber = arg.subscriber;
    subscriber.clearThrottle();
}
//# sourceMappingURL=throttleTime.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {"version":3,"file":"throttleTime.js","sourceRoot":"","sources":["../../src/operators/throttleTime.ts"],"names":[],"mappings":"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","sourcesContent":["import { Operator } from '../Operator';\nimport { Subscriber } from '../Subscriber';\nimport { IScheduler } from '../Scheduler';\nimport { Subscription, TeardownLogic } from '../Subscription';\nimport { async } from '../scheduler/async';\nimport { Observable } from '../Observable';\nimport { ThrottleConfig, defaultThrottleConfig } from './throttle';\nimport { MonoTypeOperatorFunction } from '../interfaces';\n\n/**\n * Emits a value from the source Observable, then ignores subsequent source\n * values for `duration` milliseconds, then repeats this process.\n *\n * <span class=\"informal\">Lets a value pass, then ignores source values for the\n * next `duration` milliseconds.</span>\n *\n * <img src=\"./img/throttleTime.png\" width=\"100%\">\n *\n * `throttleTime` emits the source Observable values on the output Observable\n * when its internal timer is disabled, and ignores source values when the timer\n * is enabled. Initially, the timer is disabled. As soon as the first source\n * value arrives, it is forwarded to the output Observable, and then the timer\n * is enabled. After `duration` milliseconds (or the time unit determined\n * internally by the optional `scheduler`) has passed, the timer is disabled,\n * and this process repeats for the next source value. Optionally takes a\n * {@link IScheduler} for managing timers.\n *\n * @example <caption>Emit clicks at a rate of at most one click per second</caption>\n * var clicks = Rx.Observable.fromEvent(document, 'click');\n * var result = clicks.throttleTime(1000);\n * result.subscribe(x => console.log(x));\n *\n * @see {@link auditTime}\n * @see {@link debounceTime}\n * @see {@link delay}\n * @see {@link sampleTime}\n * @see {@link throttle}\n *\n * @param {number} duration Time to wait before emitting another value after\n * emitting the last value, measured in milliseconds or the time unit determined\n * internally by the optional `scheduler`.\n * @param {Scheduler} [scheduler=async] The {@link IScheduler} to use for\n * managing the timers that handle the throttling.\n * @return {Observable<T>} An Observable that performs the throttle operation to\n * limit the rate of emissions from the source.\n * @method throttleTime\n * @owner Observable\n */\nexport function throttleTime<T>(duration: number,\n                                scheduler: IScheduler = async,\n                                config: ThrottleConfig = defaultThrottleConfig): MonoTypeOperatorFunction<T> {\n  return (source: Observable<T>) => source.lift(new ThrottleTimeOperator(duration, scheduler, config.leading, config.trailing));\n}\n\nclass ThrottleTimeOperator<T> implements Operator<T, T> {\n  constructor(private duration: number,\n              private scheduler: IScheduler,\n              private leading: boolean,\n              private trailing: boolean) {\n  }\n\n  call(subscriber: Subscriber<T>, source: any): TeardownLogic {\n    return source.subscribe(\n      new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler, this.leading, this.trailing)\n    );\n  }\n}\n\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nclass ThrottleTimeSubscriber<T> extends Subscriber<T> {\n  private throttled: Subscription;\n  private _hasTrailingValue: boolean = false;\n  private _trailingValue: T = null;\n\n  constructor(destination: Subscriber<T>,\n              private duration: number,\n              private scheduler: IScheduler,\n              private leading: boolean,\n              private trailing: boolean) {\n    super(destination);\n  }\n\n  protected _next(value: T) {\n    if (this.throttled) {\n      if (this.trailing) {\n        this._trailingValue = value;\n        this._hasTrailingValue = true;\n      }\n    } else {\n      this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));\n      if (this.leading) {\n        this.destination.next(value);\n      }\n    }\n  }\n\n  clearThrottle() {\n    const throttled = this.throttled;\n    if (throttled) {\n      if (this.trailing && this._hasTrailingValue) {\n        this.destination.next(this._trailingValue);\n        this._trailingValue = null;\n        this._hasTrailingValue = false;\n      }\n      throttled.unsubscribe();\n      this.remove(throttled);\n      this.throttled = null;\n    }\n  }\n}\n\ninterface DispatchArg<T> {\n  subscriber: ThrottleTimeSubscriber<T>;\n}\n\nfunction dispatchNext<T>(arg: DispatchArg<T>) {\n  const { subscriber } = arg;\n  subscriber.clearThrottle();\n}\n"]}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  "use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async_1 = require('../scheduler/async');
var isDate_1 = require('../util/isDate');
var Subscriber_1 = require('../Subscriber');
var TimeoutError_1 = require('../util/TimeoutError');
/**
 *
 * Errors if Observable does not emit a value in given time span.
 *
 * <span class="informal">Timeouts on Observable that doesn't emit values fast enough.</span>
 *
 * <img src="./img/timeout.png" width="100%">
 *
 * `timeout` operator accepts as an argument either a number or a Date.
 *
 * If number was provided, it returns an Observable that behaves like a source
 * Observable, unless there is a period of time where there is no value emitted.
 * So if you provide `100` as argument and first value comes after 50ms from
 * the moment of subscription, this value will be simply re-emitted by the resulting
 * Observable. If however after that 100ms passes without a second value being emitted,
 * stream will end with an error and source Observable will be unsubscribed.
 * These checks are performed throughout whole lifecycle of Observable - from the moment
 * it was subscribed to, until it completes or errors itself. Thus every value must be
 * emitted within specified period since previous value.
 *
 * If provided argument was Date, returned Observable behaves differently. It throws
 * if Observable did not complete before provided Date. This means that periods between
 * emission of particular values do not matter in this case. If Observable did not complete
 * before provided Date, source Observable will be unsubscribed. Other than that, resulting
 * stream behaves just as source Observable.
 *
 * `timeout` accepts also a Scheduler as a second parameter. It is used to schedule moment (or moments)
 * when returned Observable will check if source stream emitted value or completed.
 *
 * @example <caption>Check if ticks are emitted within certain timespan</caption>
 * const seconds = Rx.Observable.interval(1000);
 *
 * seconds.timeout(1100) // Let's use bigger timespan to be safe,
 *                       // since `interval` might fire a bit later then scheduled.
 * .subscribe(
 *     value => console.log(value), // Will emit numbers just as regular `interval` would.
 *     err => console.log(err) // Will never be called.
 * );
 *
 * seconds.timeout(900).subscribe(
 *     value => console.log(value), // Will never be called.
 *     err => console.log(err) // Will emit error before even first value is emitted,
 *                             // since it did not arrive within 900ms period.
 * );
 *
 * @example <caption>Use Date to check if Observable completed</caption>
 * const seconds = Rx.Observable.interval(1000);
 *
 * seconds.timeout(new Date("December 17, 2020 03:24:00"))
 * .subscribe(
 *     value => console.log(value), // Will emit values as regular `interval` would
 *                                  // until December 17, 2020 at 03:24:00.
 *     err => console.log(err) // On December 17, 2020 at 03:24:00 it will emit an error,
 *                             // since Observable did not complete by then.
 * );
 *
 * @see {@link timeoutWith}
 *
 * @param {number|Date} due Number specifying period within which Observable must emit values
 *                          or Date specifying before when Observable should complete
 * @param {Scheduler} [scheduler] Scheduler controlling when timeout checks occur.
 * @return {Observable<T>} Observable that mirrors behaviour of source, unless timeout checks fail.
 * @method timeout
 * @owner Observable
 */
function timeout(due, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.async; }
    var absoluteTimeout = isDate_1.isDate(due);
    var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
    return function (source) { return source.lift(new TimeoutOperator(waitFor, absoluteTimeout, scheduler, new TimeoutError_1.TimeoutError())); };
}
exports.timeout = timeout;
var TimeoutOperator = (function () {
    function TimeoutOperator(waitFor, absoluteTimeout, scheduler, errorInstance) {
        this.waitFor = waitFor;
        this.absoluteTimeout = absoluteTimeout;
        this.scheduler = scheduler;
        this.errorInstance = errorInstance;
    }
    TimeoutOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TimeoutSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.scheduler, this.errorInstance));
    };
    return TimeoutOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var TimeoutSubscriber = (function (_super) {
    __extends(TimeoutSubscriber, _super);
    function TimeoutSubscriber(destination, absoluteTimeout, waitFor, scheduler, errorInstance) {
        _super.call(this, destination);
        this.absoluteTimeout = absoluteTimeout;
        this.waitFor = waitFor;
        this.scheduler = scheduler;
        this.errorInstance = errorInstance;
        this.action = null;
        this.scheduleTimeout();
    }
    TimeoutSubscriber.dispatchTimeout = function (subscriber) {
        subscriber.error(subscriber.errorInstance);
    };
    TimeoutSubscriber.prototype.scheduleTimeout = function () {
        var action = this.action;
        if (action) {
            // Recycle the action if we've already scheduled one. All the production
            // Scheduler Actions mutate their state/delay time and return themeselves.
            // VirtualActions are immutable, so they create and return a clone. In this
            // case, we need to set the action reference to the most recent VirtualAction,
            // to ensure that's the one we clone from next time.
            this.action = action.schedule(this, this.waitFor);
        }
        else {
            this.add(this.action = this.scheduler.schedule(TimeoutSubscriber.dispatchTimeout, this.waitFor, this));
        }
    };
    TimeoutSubscriber.prototype._next = function (value) {
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
        _super.prototype._next.call(this, value);
    };
    /** @deprecated internal use only */ TimeoutSubscriber.prototype._unsubscribe = function () {
        this.action = null;
        this.scheduler = null;
        this.errorInstance = null;
    };
    return TimeoutSubscriber;
}(Subscriber_1.Subscriber));
//# sourceMappingURL=timeout.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   {"version":3,"file":"timeout.js","sourceRoot":"","sources":["../../src/operators/timeout.ts"],"names":[],"mappings":"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","sourcesContent":["import { Action } from '../scheduler/Action';\nimport { async } from '../scheduler/async';\nimport { isDate } from '../util/isDate';\nimport { Operator } from '../Operator';\nimport { Subscriber } from '../Subscriber';\nimport { IScheduler } from '../Scheduler';\nimport { Observable } from '../Observable';\nimport { TeardownLogic } from '../Subscription';\nimport { TimeoutError } from '../util/TimeoutError';\nimport { MonoTypeOperatorFunction } from '../interfaces';\n\n/**\n *\n * Errors if Observable does not emit a value in given time span.\n *\n * <span class=\"informal\">Timeouts on Observable that doesn't emit values fast enough.</span>\n *\n * <img src=\"./img/timeout.png\" width=\"100%\">\n *\n * `timeout` operator accepts as an argument either a number or a Date.\n *\n * If number was provided, it returns an Observable that behaves like a source\n * Observable, unless there is a period of time where there is no value emitted.\n * So if you provide `100` as argument and first value comes after 50ms from\n * the moment of subscription, this value will be simply re-emitted by the resulting\n * Observable. If however after that 100ms passes without a second value being emitted,\n * stream will end with an error and source Observable will be unsubscribed.\n * These checks are performed throughout whole lifecycle of Observable - from the moment\n * it was subscribed to, until it completes or errors itself. Thus every value must be\n * emitted within specified period since previous value.\n *\n * If provided argument was Date, returned Observable behaves differently. It throws\n * if Observable did not complete before provided Date. This means that periods between\n * emission of particular values do not matter in this case. If Observable did not complete\n * before provided Date, source Observable will be unsubscribed. Other than that, resulting\n * stream behaves just as source Observable.\n *\n * `timeout` accepts also a Scheduler as a second parameter. It is used to schedule moment (or moments)\n * when returned Observable will check if source stream emitted value or completed.\n *\n * @example <caption>Check if ticks are emitted within certain timespan</caption>\n * const seconds = Rx.Observable.interval(1000);\n *\n * seconds.timeout(1100) // Let's use bigger timespan to be safe,\n *                       // since `interval` might fire a bit later then scheduled.\n * .subscribe(\n *     value => console.log(value), // Will emit numbers just as regular `interval` would.\n *     err => console.log(err) // Will never be called.\n * );\n *\n * seconds.timeout(900).subscribe(\n *     value => console.log(value), // Will never be called.\n *     err => console.log(err) // Will emit error before even first value is emitted,\n *                             // since it did not arrive within 900ms period.\n * );\n *\n * @example <caption>Use Date to check if Observable completed</caption>\n * const seconds = Rx.Observable.interval(1000);\n *\n * seconds.timeout(new Date(\"December 17, 2020 03:24:00\"))\n * .subscribe(\n *     value => console.log(value), // Will emit values as regular `interval` would\n *                                  // until December 17, 2020 at 03:24:00.\n *     err => console.log(err) // On December 17, 2020 at 03:24:00 it will emit an error,\n *                             // since Observable did not complete by then.\n * );\n *\n * @see {@link timeoutWith}\n *\n * @param {number|Date} due Number specifying period within which Observable must emit values\n *                          or Date specifying before when Observable should complete\n * @param {Scheduler} [scheduler] Scheduler controlling when timeout checks occur.\n * @return {Observable<T>} Observable that mirrors behaviour of source, unless timeout checks fail.\n * @method timeout\n * @owner Observable\n */\nexport function timeout<T>(due: number | Date,\n                           scheduler: IScheduler = async): MonoTypeOperatorFunction<T> {\n  const absoluteTimeout = isDate(due);\n  const waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(<number>due);\n  return (source: Observable<T>) => source.lift(new TimeoutOperator(waitFor, absoluteTimeout, scheduler, new TimeoutError()));\n}\n\nclass TimeoutOperator<T> implements Operator<T, T> {\n  constructor(private waitFor: number,\n              private absoluteTimeout: boolean,\n              private scheduler: IScheduler,\n              private errorInstance: TimeoutError) {\n  }\n\n  call(subscriber: Subscriber<T>, source: any): TeardownLogic {\n    return source.subscribe(new TimeoutSubscriber<T>(\n      subscriber, this.absoluteTimeout, this.waitFor, this.scheduler, this.errorInstance\n    ));\n  }\n}\n\n/**\n * We need this JSDoc comment for affecting ESDoc.\n * @ignore\n * @extends {Ignored}\n */\nclass TimeoutSubscriber<T> extends Subscriber<T> {\n\n  private action: Action<TimeoutSubscriber<T>> = null;\n\n  constructor(destination: Subscriber<T>,\n              private absoluteTimeout: boolean,\n              private waitFor: number,\n              private scheduler: IScheduler,\n              private errorInstance: TimeoutError) {\n    super(destination);\n    this.scheduleTimeout();\n  }\n\n  private static dispatchTimeout<T>(subscriber: TimeoutSubscriber<T>): void {\n    subscriber.error(subscriber.errorInstance);\n  }\n\n  private scheduleTimeout(): void {\n    const { action } = this;\n    if (action) {\n      // Recycle the action if we've already scheduled one. All the production\n      // Scheduler Actions mutate their state/delay time and return themeselves.\n      // VirtualActions are immutable, so they create and return a clone. In this\n      // case, we need to set the action reference to the most recent VirtualAction,\n      // to ensure that's the one we clone from next time.\n      this.action = (<Action<TimeoutSubscriber<T>>> action.schedule(this, this.waitFor));\n    } else {\n      this.add(this.action = (<Action<TimeoutSubscriber<T>>> this.scheduler.schedule(\n        TimeoutSubscriber.dispatchTimeout, this.waitFor, this\n      )));\n    }\n  }\n\n  protected _next(value: T): void {\n    if (!this.absoluteTimeout) {\n      this.scheduleTimeout();\n    }\n    super._next(value);\n  }\n\n  /** @deprecated internal use only */ _unsubscribe() {\n    this.action = null;\n    this.scheduler = null;\n    this.errorInstance = null;\n  }\n}\n"]}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       "use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var async_1 = require('../scheduler/async');
var isDate_1 = require('../util/isDate');
var OuterSubscriber_1 = require('../OuterSubscriber');
var subscribeToResult_1 = require('../util/subscribeToResult');
/* tslint:enable:max-line-length */
/**
 *
 * Errors if Observable does not emit a value in given time span, in case of which
 * subscribes to the second Observable.
 *
 * <span class="informal">It's a version of `timeout` operator that let's you specify fallback Observable.</span>
 *
 * <img src="./img/timeoutWith.png" width="100%">
 *
 * `timeoutWith` is a variation of `timeout` operator. It behaves exactly the same,
 * still accepting as a first argument either a number or a Date, which control - respectively -
 * when values of source Observable should be emitted or when it should complete.
 *
 * The only difference is that it accepts a second, required parameter. This parameter
 * should be an Observable which will be subscribed when source Observable fails any timeout check.
 * So whenever regular `timeout` would emit an error, `timeoutWith` will instead start re-emitting
 * values from second Observable. Note that this fallback Observable is not checked for timeouts
 * itself, so it can emit values and complete at arbitrary points in time. From the moment of a second
 * subscription, Observable returned from `timeoutWith` simply mirrors fallback stream. When that
 * stream completes, it completes as well.
 *
 * Scheduler, which in case of `timeout` is provided as as second argument, can be still provided
 * here - as a third, optional parameter. It still is used to schedule timeout checks and -
 * as a consequence - when second Observable will be subscribed, since subscription happens
 * immediately after failing check.
 *
 * @example <caption>Add fallback observable</caption>
 * const seconds = Rx.Observable.interval(1000);
 * const minutes = Rx.Observable.interval(60 * 1000);
 *
 * seconds.timeoutWith(900, minutes)
 *     .subscribe(
 *         value => console.log(value), // After 900ms, will start emitting `minutes`,
 *                                      // since first value of `seconds` will not arrive fast enough.
 *         err => console.log(err) // Would be called after 900ms in case of `timeout`,
 *                                 // but here will never be called.
 *     );
 *
 * @param {number|Date} due Number specifying period within which Observable must emit values
 *                          or Date specifying before when Observable should complete
 * @param {Observable<T>} withObservable Observable which will be subscribed if source fails timeout check.
 * @param {Scheduler} [scheduler] Scheduler controlling when timeout checks occur.
 * @return {Observable<T>} Observable that mirrors behaviour of source or, when timeout check fails, of an Observable
 *                          passed as a second parameter.
 * @method timeoutWith
 * @owner Observable
 */
function timeoutWith(due, withObservable, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.async; }
    return function (source) {
        var absoluteTimeout = isDate_1.isDate(due);
        var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
        return source.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
    };
}
exports.timeoutWith = timeoutWith;
var TimeoutWithOperator = (function () {
    function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
        this.waitFor = waitFor;
        this.absoluteTimeout = absoluteTimeout;
        this.withObservable = withObservable;
        this.scheduler = scheduler;
    }
    TimeoutWithOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
    };
    return TimeoutWithOperator;
}());
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
var TimeoutWithSubscriber = (function (_super) {
    __extends(TimeoutWithSubscriber, _super);
    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
        _super.call(this, destination);
        this.absoluteTimeout = absoluteTimeout;
        this.waitFor = waitFor;
        this.withObservable = withObservable;
        this.scheduler = scheduler;
        this.action = null;
        this.scheduleTimeout();
    }
    TimeoutWithSubscriber.dispatchTimeout = function (subscriber) {
        var withObservable = subscriber.withObservable;
        subscriber._unsubscribeAndRecycle();
        subscriber.add(subscribeToResult_1.subscribeToResult(subscriber, withObservable));
    };
    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
        var action = this.action;
        if (action) {
            // Recycle the action if we've already scheduled one. All the production
            // Scheduler Actions mutate their state/delay time and return themeselves.
            // VirtualActions are immutable, so they create and return a clone. In this
            // case, we need to set the action reference to the most recent VirtualAction,
            // to ensure that's the one we clone from next time.
            this.action = action.schedule(this, this.waitFor);
        }
        else {
            this.add(this.action = this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, this));
        }
    };
    TimeoutWithSubscriber.prototype._next = function (value) {
        if (!this.absoluteTimeout) {
            this.scheduleTimeout();
        }
        _super.prototype._next.call(this, value);
    };
    /** @deprecated internal use only */ TimeoutWithSubscriber.prototype._unsubscribe = function () {
        this.action = null;
        this.scheduler = null;
        this.withObservable = null;
    };
    return TimeoutWithSubscriber;
}(OuterSubscriber_1.OuterSubscriber));
//# sourceMappingURL=timeoutWith.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              /**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/kw", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n === 1)
            return 1;
        if (n === 2)
            return 2;
        return 5;
    }
    exports.default = [
        'kw', [['a.m.', 'p.m.'], u, u], u,
        [
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'], ['Sul', 'Lun', 'Mth', 'Mhr', 'Yow', 'Gwe', 'Sad'],
            ['dy Sul', 'dy Lun', 'dy Meurth', 'dy Merher', 'dy Yow', 'dy Gwener', 'dy Sadorn'],
            ['Sul', 'Lun', 'Mth', 'Mhr', 'Yow', 'Gwe', 'Sad']
        ],
        u,
        [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            ['Gen', 'Hwe', 'Meu', 'Ebr', 'Me', 'Met', 'Gor', 'Est', 'Gwn', 'Hed', 'Du', 'Kev'],
            [
                'mis Genver', 'mis Hwevrer', 'mis Meurth', 'mis Ebrel', 'mis Me', 'mis Metheven',
                'mis Gortheren', 'mis Est', 'mis Gwynngala', 'mis Hedra', 'mis Du', 'mis Kevardhu'
            ]
        ],
        u, [['RC', 'AD'], u, u], 1, [6, 0], ['y-MM-dd', 'y MMM d', 'y MMMM d', 'y MMMM d, EEEE'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤#,##0.00', '#E0'], '£', 'GBP',
        { 'JPY': ['JP¥', '¥'], 'USD': ['US$', '$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9rdy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNqQztZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDdEYsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUM7WUFDbEYsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7U0FDbEQ7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQy9ELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUM7WUFDbEY7Z0JBQ0UsWUFBWSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxjQUFjO2dCQUNoRixlQUFlLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLGNBQWM7YUFDbkY7U0FDRjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQztRQUN4RixDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSztRQUN2RCxFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUMsRUFBRSxNQUFNO0tBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKG4gPT09IDEpIHJldHVybiAxO1xuICBpZiAobiA9PT0gMikgcmV0dXJuIDI7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdrdycsIFtbJ2EubS4nLCAncC5tLiddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsnUycsICdNJywgJ1QnLCAnVycsICdUJywgJ0YnLCAnUyddLCBbJ1N1bCcsICdMdW4nLCAnTXRoJywgJ01ocicsICdZb3cnLCAnR3dlJywgJ1NhZCddLFxuICAgIFsnZHkgU3VsJywgJ2R5IEx1bicsICdkeSBNZXVydGgnLCAnZHkgTWVyaGVyJywgJ2R5IFlvdycsICdkeSBHd2VuZXInLCAnZHkgU2Fkb3JuJ10sXG4gICAgWydTdWwnLCAnTHVuJywgJ010aCcsICdNaHInLCAnWW93JywgJ0d3ZScsICdTYWQnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxuICAgIFsnR2VuJywgJ0h3ZScsICdNZXUnLCAnRWJyJywgJ01lJywgJ01ldCcsICdHb3InLCAnRXN0JywgJ0d3bicsICdIZWQnLCAnRHUnLCAnS2V2J10sXG4gICAgW1xuICAgICAgJ21pcyBHZW52ZXInLCAnbWlzIEh3ZXZyZXInLCAnbWlzIE1ldXJ0aCcsICdtaXMgRWJyZWwnLCAnbWlzIE1lJywgJ21pcyBNZXRoZXZlbicsXG4gICAgICAnbWlzIEdvcnRoZXJlbicsICdtaXMgRXN0JywgJ21pcyBHd3lubmdhbGEnLCAnbWlzIEhlZHJhJywgJ21pcyBEdScsICdtaXMgS2V2YXJkaHUnXG4gICAgXVxuICBdLFxuICB1LCBbWydSQycsICdBRCddLCB1LCB1XSwgMSwgWzYsIDBdLCBbJ3ktTU0tZGQnLCAneSBNTU0gZCcsICd5IE1NTU0gZCcsICd5IE1NTU0gZCwgRUVFRSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLCBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJ8KkIywjIzAuMDAnLCAnI0UwJ10sICfCoycsICdHQlAnLFxuICB7J0pQWSc6IFsnSlDCpScsICfCpSddLCAnVVNEJzogWydVUyQnLCAnJCddfSwgcGx1cmFsXG5dO1xuIl19                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                "use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('./Observable');
var Subscriber_1 = require('./Subscriber');
var Subscription_1 = require('./Subscription');
var ObjectUnsubscribedError_1 = require('./util/ObjectUnsubscribedError');
var SubjectSubscription_1 = require('./SubjectSubscription');
var rxSubscriber_1 = require('./symbol/rxSubscriber');
/**
 * @class SubjectSubscriber<T>
 */
var SubjectSubscriber = (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        _super.call(this, destination);
        this.destination = destination;
    }
    return SubjectSubscriber;
}(Subscriber_1.Subscriber));
exports.SubjectSubscriber = SubjectSubscriber;
/**
 * @class Subject<T>
 */
var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        _super.call(this);
        this.observers = [];
        this.closed = false;
        this.isStopped = false;
        this.hasError = false;
        this.thrownError = null;
    }
    Subject.prototype[rxSubscriber_1.rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    /** @deprecated internal use only */ Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription_1.Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription_1.Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable_1.Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable_1.Observable));
exports.Subject = Subject;
/**
 * @class AnonymousSubject<T>
 */
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        _super.call(this);
        this.destination = destination;
        this.source = source;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    /** @deprecated internal use only */ AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription_1.Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));
exports.AnonymousSubject = AnonymousSubject;
//# sourceMappingURL=Subject.js.map                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         {"version":3,"file":"Subject.js","sourceRoot":"","sources":["../src/Subject.ts"],"names":[],"mappings":";;;;;;AAEA,2BAA2B,cAAc,CAAC,CAAA;AAC1C,2BAA2B,cAAc,CAAC,CAAA;AAC1C,6BAA2D,gBAAgB,CAAC,CAAA;AAC5E,wCAAwC,gCAAgC,CAAC,CAAA;AACzE,oCAAoC,uBAAuB,CAAC,CAAA;AAC5D,6BAAmD,uBAAuB,CAAC,CAAA;AAE3E;;GAEG;AACH;IAA0C,qCAAa;IACrD,2BAAsB,WAAuB;QAC3C,kBAAM,WAAW,CAAC,CAAC;QADC,gBAAW,GAAX,WAAW,CAAY;IAE7C,CAAC;IACH,wBAAC;AAAD,CAAC,AAJD,CAA0C,uBAAU,GAInD;AAJY,yBAAiB,oBAI7B,CAAA;AAED;;GAEG;AACH;IAAgC,2BAAa;IAgB3C;QACE,iBAAO,CAAC;QAXV,cAAS,GAAkB,EAAE,CAAC;QAE9B,WAAM,GAAG,KAAK,CAAC;QAEf,cAAS,GAAG,KAAK,CAAC;QAElB,aAAQ,GAAG,KAAK,CAAC;QAEjB,gBAAW,GAAQ,IAAI,CAAC;IAIxB,CAAC;IAhBD,kBAAC,2BAAkB,CAAC,GAApB;QACE,MAAM,CAAC,IAAI,iBAAiB,CAAC,IAAI,CAAC,CAAC;IACrC,CAAC;IAoBD,sBAAI,GAAJ,UAAQ,QAAwB;QAC9B,IAAM,OAAO,GAAG,IAAI,gBAAgB,CAAC,IAAI,EAAE,IAAI,CAAC,CAAC;QACjD,OAAO,CAAC,QAAQ,GAAQ,QAAQ,CAAC;QACjC,MAAM,CAAM,OAAO,CAAC;IACtB,CAAC;IAED,sBAAI,GAAJ,UAAK,KAAS;QACZ,EAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC,CAAC;YAChB,MAAM,IAAI,iDAAuB,EAAE,CAAC;QACtC,CAAC;QACD,EAAE,CAAC,CAAC,CAAC,IAAI,CAAC,SAAS,CAAC,CAAC,CAAC;YACZ,8BAAS,CAAU;YAC3B,IAAM,GAAG,GAAG,SAAS,CAAC,MAAM,CAAC;YAC7B,IAAM,IAAI,GAAG,SAAS,CAAC,KAAK,EAAE,CAAC;YAC/B,GAAG,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,GAAG,EAAE,CAAC,EAAE,EAAE,CAAC;gBAC7B,IAAI,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;YACtB,CAAC;QACH,CAAC;IACH,CAAC;IAED,uBAAK,GAAL,UAAM,GAAQ;QACZ,EAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC,CAAC;YAChB,MAAM,IAAI,iDAAuB,EAAE,CAAC;QACtC,CAAC;QACD,IAAI,CAAC,QAAQ,GAAG,IAAI,CAAC;QACrB,IAAI,CAAC,WAAW,GAAG,GAAG,CAAC;QACvB,IAAI,CAAC,SAAS,GAAG,IAAI,CAAC;QACd,8BAAS,CAAU;QAC3B,IAAM,GAAG,GAAG,SAAS,CAAC,MAAM,CAAC;QAC7B,IAAM,IAAI,GAAG,SAAS,CAAC,KAAK,EAAE,CAAC;QAC/B,GAAG,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,GAAG,EAAE,CAAC,EAAE,EAAE,CAAC;YAC7B,IAAI,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC;QACrB,CAAC;QACD,IAAI,CAAC,SAAS,CAAC,MAAM,GAAG,CAAC,CAAC;IAC5B,CAAC;IAED,0BAAQ,GAAR;QACE,EAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC,CAAC;YAChB,MAAM,IAAI,iDAAuB,EAAE,CAAC;QACtC,CAAC;QACD,IAAI,CAAC,SAAS,GAAG,IAAI,CAAC;QACd,8BAAS,CAAU;QAC3B,IAAM,GAAG,GAAG,SAAS,CAAC,MAAM,CAAC;QAC7B,IAAM,IAAI,GAAG,SAAS,CAAC,KAAK,EAAE,CAAC;QAC/B,GAAG,CAAC,CAAC,IAAI,CAAC,GAAG,CAAC,EAAE,CAAC,GAAG,GAAG,EAAE,CAAC,EAAE,EAAE,CAAC;YAC7B,IAAI,CAAC,CAAC,CAAC,CAAC,QAAQ,EAAE,CAAC;QACrB,CAAC;QACD,IAAI,CAAC,SAAS,CAAC,MAAM,GAAG,CAAC,CAAC;IAC5B,CAAC;IAED,6BAAW,GAAX;QACE,IAAI,CAAC,SAAS,GAAG,IAAI,CAAC;QACtB,IAAI,CAAC,MAAM,GAAG,IAAI,CAAC;QACnB,IAAI,CAAC,SAAS,GAAG,IAAI,CAAC;IACxB,CAAC;IAES,+BAAa,GAAvB,UAAwB,UAAyB;QAC/C,EAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC,CAAC;YAChB,MAAM,IAAI,iDAAuB,EAAE,CAAC;QACtC,CAAC;QAAC,IAAI,CAAC,CAAC;YACN,MAAM,CAAC,gBAAK,CAAC,aAAa,YAAC,UAAU,CAAC,CAAC;QACzC,CAAC;IACH,CAAC;IAED,oCAAoC,CAAC,4BAAU,GAAV,UAAW,UAAyB;QACvE,EAAE,CAAC,CAAC,IAAI,CAAC,MAAM,CAAC,CAAC,CAAC;YAChB,MAAM,IAAI,iDAAuB,EAAE,CAAC;QACtC,CAAC;QAAC,IAAI,CAAC,EAAE,CAAC,CAAC,IAAI,CAAC,QAAQ,CAAC,CAAC,CAAC;YACzB,UAAU,CAAC,KAAK,CAAC,IAAI,CAAC,WAAW,CAAC,CAAC;YACnC,MAAM,CAAC,2BAAY,CAAC,KAAK,CAAC;QAC5B,CAAC;QAAC,IAAI,CAAC,EAAE,CAAC,CAAC,IAAI,CAAC,SAAS,CAAC,CAAC,CAAC;YAC1B,UAAU,CAAC,QAAQ,EAAE,CAAC;YACtB,MAAM,CAAC,2BAAY,CAAC,KAAK,CAAC;QAC5B,CAAC;QAAC,IAAI,CAAC,CAAC;YACN,IAAI,CAAC,SAAS,CAAC,IAAI,CAAC,UAAU,CAAC,CAAC;YAChC,MAAM,CAAC,IAAI,yCAAmB,CAAC,IAAI,EAAE,UAAU,CAAC,CAAC;QACnD,CAAC;IACH,CAAC;IAED,8BAAY,GAAZ;QACE,IAAM,UAAU,GAAG,IAAI,uBAAU,EAAK,CAAC;QACjC,UAAW,CAAC,MAAM,GAAG,IAAI,CAAC;QAChC,MAAM,CAAC,UAAU,CAAC;IACpB,CAAC;IAvFM,cAAM,GAAa,UAAI,WAAwB,EAAE,MAAqB;QAC3E,MAAM,CAAC,IAAI,gBAAgB,CAAI,WAAW,EAAE,MAAM,CAAC,CAAC;IACtD,CAAC,CAAA;IAsFH,cAAC;AAAD,CAAC,AA5GD,CAAgC,uBAAU,GA4GzC;AA5GY,eAAO,UA4GnB,CAAA;AAED;;GAEG;AACH;IAAyC,oCAAU;IACjD,0BAAsB,WAAyB,EAAE,MAAsB;QACrE,iBAAO,CAAC;QADY,gBAAW,GAAX,WAAW,CAAc;QAE7C,IAAI,CAAC,MAAM,GAAG,MAAM,CAAC;IACvB,CAAC;IAED,+BAAI,GAAJ,UAAK,KAAQ;QACH,kCAAW,CAAU;QAC7B,EAAE,CAAC,CAAC,WAAW,IAAI,WAAW,CAAC,IAAI,CAAC,CAAC,CAAC;YACpC,WAAW,CAAC,IAAI,CAAC,KAAK,CAAC,CAAC;QAC1B,CAAC;IACH,CAAC;IAED,gCAAK,GAAL,UAAM,GAAQ;QACJ,kCAAW,CAAU;QAC7B,EAAE,CAAC,CAAC,WAAW,IAAI,WAAW,CAAC,KAAK,CAAC,CAAC,CAAC;YACrC,IAAI,CAAC,WAAW,CAAC,KAAK,CAAC,GAAG,CAAC,CAAC;QAC9B,CAAC;IACH,CAAC;IAED,mCAAQ,GAAR;QACU,kCAAW,CAAU;QAC7B,EAAE,CAAC,CAAC,WAAW,IAAI,WAAW,CAAC,QAAQ,CAAC,CAAC,CAAC;YACxC,IAAI,CAAC,WAAW,CAAC,QAAQ,EAAE,CAAC;QAC9B,CAAC;IACH,CAAC;IAED,oCAAoC,CAAC,qCAAU,GAAV,UAAW,UAAyB;QAC/D,wBAAM,CAAU;QACxB,EAAE,CAAC,CAAC,MAAM,CAAC,CAAC,CAAC;YACX,MAAM,CAAC,IAAI,CAAC,MAAM,CAAC,SAAS,CAAC,UAAU,CAAC,CAAC;QAC3C,CAAC;QAAC,IAAI,CAAC,CAAC;YACN,MAAM,CAAC,2BAAY,CAAC,KAAK,CAAC;QAC5B,CAAC;IACH,CAAC;IACH,uBAAC;AAAD,CAAC,AAnCD,CAAyC,OAAO,GAmC/C;AAnCY,wBAAgB,mBAmC5B,CAAA","sourcesContent":["import { Operator } from './Operator';\nimport { Observer } from './Observer';\nimport { Observable } from './Observable';\nimport { Subscriber } from './Subscriber';\nimport { ISubscription, Subscription, TeardownLogic } from './Subscription';\nimport { ObjectUnsubscribedError } from './util/ObjectUnsubscribedError';\nimport { SubjectSubscription } from './SubjectSubscription';\nimport { rxSubscriber as rxSubscriberSymbol } from './symbol/rxSubscriber';\n\n/**\n * @class SubjectSubscriber<T>\n */\nexport class SubjectSubscriber<T> extends Subscriber<T> {\n  constructor(protected destination: Subject<T>) {\n    super(destination);\n  }\n}\n\n/**\n * @class Subject<T>\n */\nexport class Subject<T> extends Observable<T> implements ISubscription {\n\n  [rxSubscriberSymbol]() {\n    return new SubjectSubscriber(this);\n  }\n\n  observers: Observer<T>[] = [];\n\n  closed = false;\n\n  isStopped = false;\n\n  hasError = false;\n\n  thrownError: any = null;\n\n  constructor() {\n    super();\n  }\n\n  static create: Function = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {\n    return new AnonymousSubject<T>(destination, source);\n  }\n\n  lift<R>(operator: Operator<T, R>): Observable<R> {\n    const subject = new AnonymousSubject(this, this);\n    subject.operator = <any>operator;\n    return <any>subject;\n  }\n\n  next(value?: T) {\n    if (this.closed) {\n      throw new ObjectUnsubscribedError();\n    }\n    if (!this.isStopped) {\n      const { observers } = this;\n      const len = observers.length;\n      const copy = observers.slice();\n      for (let i = 0; i < len; i++) {\n        copy[i].next(value);\n      }\n    }\n  }\n\n  error(err: any) {\n    if (this.closed) {\n      throw new ObjectUnsubscribedError();\n    }\n    this.hasError = true;\n    this.thrownError = err;\n    this.isStopped = true;\n    const { observers } = this;\n    const len = observers.length;\n    const copy = observers.slice();\n    for (let i = 0; i < len; i++) {\n      copy[i].error(err);\n    }\n    this.observers.length = 0;\n  }\n\n  complete() {\n    if (this.closed) {\n      throw new ObjectUnsubscribedError();\n    }\n    this.isStopped = true;\n    const { observers } = this;\n    const len = observers.length;\n    const copy = observers.slice();\n    for (let i = 0; i < len; i++) {\n      copy[i].complete();\n    }\n    this.observers.length = 0;\n  }\n\n  unsubscribe() {\n    this.isStopped = true;\n    this.closed = true;\n    this.observers = null;\n  }\n\n  protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {\n    if (this.closed) {\n      throw new ObjectUnsubscribedError();\n    } else {\n      return super._trySubscribe(subscriber);\n    }\n  }\n\n  /** @deprecated internal use only */ _subscribe(subscriber: Subscriber<T>): Subscription {\n    if (this.closed) {\n      throw new ObjectUnsubscribedError();\n    } else if (this.hasError) {\n      subscriber.error(this.thrownError);\n      return Subscription.EMPTY;\n    } else if (this.isStopped) {\n      subscriber.complete();\n      return Subscription.EMPTY;\n    } else {\n      this.observers.push(subscriber);\n      return new SubjectSubscription(this, subscriber);\n    }\n  }\n\n  asObservable(): Observable<T> {\n    const observable = new Observable<T>();\n    (<any>observable).source = this;\n    return observable;\n  }\n}\n\n/**\n * @class AnonymousSubject<T>\n */\nexport class AnonymousSubject<T> extends Subject<T> {\n  constructor(protected destination?: Observer<T>, source?: Observable<T>) {\n    super();\n    this.source = source;\n  }\n\n  next(value: T) {\n    const { destination } = this;\n    if (destination && destination.next) {\n      destination.next(value);\n    }\n  }\n\n  error(err: any) {\n    const { destination } = this;\n    if (destination && destination.error) {\n      this.destination.error(err);\n    }\n  }\n\n  complete() {\n    const { destination } = this;\n    if (destination && destination.complete) {\n      this.destination.complete();\n    }\n  }\n\n  /** @deprecated internal use only */ _subscribe(subscriber: Subscriber<T>): Subscription {\n    const { source } = this;\n    if (source) {\n      return this.source.subscribe(subscriber);\n    } else {\n      return Subscription.EMPTY;\n    }\n  }\n}\n"]}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 /**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/lag", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (n === 0)
            return 0;
        if ((i === 0 || i === 1) && !(n === 0))
            return 1;
        return 5;
    }
    exports.default = [
        'lag', [['TOO', 'MUU'], u, u], u,
        [
            ['P', 'T', 'E', 'O', 'A', 'I', 'M'],
            ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
            ['Jumapíiri', 'Jumatátu', 'Jumaíne', 'Jumatáano', 'Alamíisi', 'Ijumáa', 'Jumamóosi'],
            ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi']
        ],
        u,
        [
            ['F', 'N', 'K', 'I', 'I', 'I', 'M', 'V', 'S', 'I', 'S', 'S'],
            [
                'Fúngatɨ', 'Naanɨ', 'Keenda', 'Ikúmi', 'Inyambala', 'Idwaata', 'Mʉʉnchɨ', 'Vɨɨrɨ',
                'Saatʉ', 'Inyi', 'Saano', 'Sasatʉ'
            ],
            [
                'Kʉfúngatɨ', 'Kʉnaanɨ', 'Kʉkeenda', 'Kwiikumi', 'Kwiinyambála', 'Kwiidwaata',
                'Kʉmʉʉnchɨ', 'Kʉvɨɨrɨ', 'Kʉsaatʉ', 'Kwiinyi', 'Kʉsaano', 'Kʉsasatʉ'
            ]
        ],
        u, [['KSA', 'KA'], u, ['Kɨrɨsitʉ sɨ anavyaal', 'Kɨrɨsitʉ akavyaalwe']], 1, [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'TSh', 'Shilíingi ya Taansanía',
        { 'JPY': ['JP¥', '¥'], 'TZS': ['TSh'], 'USD': ['US$', '$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2xvY2FsZXMvbGFnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgseUNBQXlDO0lBQ3pDLCtDQUErQztJQUUvQyxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFcEIsZ0JBQWdCLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqRCxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVELGtCQUFlO1FBQ2IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDaEM7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztZQUNuQyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQztZQUN6RCxDQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQztZQUNwRixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQztTQUMxRDtRQUNELENBQUM7UUFDRDtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUM7WUFDNUQ7Z0JBQ0UsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU87Z0JBQ2pGLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVE7YUFDbkM7WUFDRDtnQkFDRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFlBQVk7Z0JBQzVFLFdBQVcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVTthQUNwRTtTQUNGO1FBQ0QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakYsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQztRQUNwRCxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsd0JBQXdCO1FBQzdFLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBQyxFQUFFLE1BQU07S0FDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAobiA9PT0gMCkgcmV0dXJuIDA7XG4gIGlmICgoaSA9PT0gMCB8fCBpID09PSAxKSAmJiAhKG4gPT09IDApKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2xhZycsIFtbJ1RPTycsICdNVVUnXSwgdSwgdV0sIHUsXG4gIFtcbiAgICBbJ1AnLCAnVCcsICdFJywgJ08nLCAnQScsICdJJywgJ00nXSxcbiAgICBbJ1DDrWlsaScsICdUw6FhdHUnLCAnw41uZScsICdUw6Fhbm8nLCAnQWxoJywgJ0lqbScsICdNw7Nvc2knXSxcbiAgICBbJ0p1bWFww61pcmknLCAnSnVtYXTDoXR1JywgJ0p1bWHDrW5lJywgJ0p1bWF0w6Fhbm8nLCAnQWxhbcOtaXNpJywgJ0lqdW3DoWEnLCAnSnVtYW3Ds29zaSddLFxuICAgIFsnUMOtaWxpJywgJ1TDoWF0dScsICfDjW5lJywgJ1TDoWFubycsICdBbGgnLCAnSWptJywgJ03Ds29zaSddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0YnLCAnTicsICdLJywgJ0knLCAnSScsICdJJywgJ00nLCAnVicsICdTJywgJ0knLCAnUycsICdTJ10sXG4gICAgW1xuICAgICAgJ0bDum5nYXTJqCcsICdOYWFuyagnLCAnS2VlbmRhJywgJ0lrw7ptaScsICdJbnlhbWJhbGEnLCAnSWR3YWF0YScsICdNyonKiW5jaMmoJywgJ1bJqMmocsmoJyxcbiAgICAgICdTYWF0yoknLCAnSW55aScsICdTYWFubycsICdTYXNhdMqJJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ0vKiWbDum5nYXTJqCcsICdLyoluYWFuyagnLCAnS8qJa2VlbmRhJywgJ0t3aWlrdW1pJywgJ0t3aWlueWFtYsOhbGEnLCAnS3dpaWR3YWF0YScsXG4gICAgICAnS8qJbcqJyoluY2jJqCcsICdLyol2yajJqHLJqCcsICdLyolzYWF0yoknLCAnS3dpaW55aScsICdLyolzYWFubycsICdLyolzYXNhdMqJJ1xuICAgIF1cbiAgXSxcbiAgdSwgW1snS1NBJywgJ0tBJ10sIHUsIFsnS8mocsmoc2l0yokgc8moIGFuYXZ5YWFsJywgJ0vJqHLJqHNpdMqJIGFrYXZ5YWFsd2UnXV0sIDEsIFs2LCAwXSxcbiAgWydkZC9NTS95JywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSwgZCBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSwgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLicsICcsJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICfCpMKgIywjIzAuMDAnLCAnI0UwJ10sICdUU2gnLCAnU2hpbMOtaW5naSB5YSBUYWFuc2Fuw61hJyxcbiAgeydKUFknOiBbJ0pQwqUnLCAnwqUnXSwgJ1RaUyc6IFsnVFNoJ10sICdVU0QnOiBbJ1VTJCcsICckJ119LCBwbHVyYWxcbl07XG4iXX0=                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              /**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/lg", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'lg', [['AM', 'PM'], u, u], u,
        [
            ['S', 'B', 'L', 'L', 'L', 'L', 'L'], ['Sab', 'Bal', 'Lw2', 'Lw3', 'Lw4', 'Lw5', 'Lw6'],
            ['Sabbiiti', 'Balaza', 'Lwakubiri', 'Lwakusatu', 'Lwakuna', 'Lwakutaano', 'Lwamukaaga'],
            ['Sab', 'Bal', 'Lw2', 'Lw3', 'Lw4', 'Lw5', 'Lw6']
        ],
        u,
        [
            ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
            ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
            [
                'Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito',
                'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'
            ]
        ],
        u, [['BC', 'AD'], u, ['Kulisito nga tannaza', 'Bukya Kulisito Azaal']], 1, [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE, d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', u, u, u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0%', '#,##0.00¤', '#E0'], 'USh', 'Silingi eya Yuganda',
        { 'JPY': ['JP¥', '¥'], 'UGX': ['USh'], 'USD': ['US$', '$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9sZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM3QjtZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDdEYsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUM7WUFDdkYsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7U0FDbEQ7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDcEY7Z0JBQ0UsV0FBVyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVM7Z0JBQ25GLFlBQVksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVM7YUFDL0M7U0FDRjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLHNCQUFzQixFQUFFLHNCQUFzQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pGLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7UUFDcEQsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQzlELENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLHFCQUFxQjtRQUN6RSxFQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUMsRUFBRSxNQUFNO0tBQ25FLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgaWYgKG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnbGcnLCBbWydBTScsICdQTSddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsnUycsICdCJywgJ0wnLCAnTCcsICdMJywgJ0wnLCAnTCddLCBbJ1NhYicsICdCYWwnLCAnTHcyJywgJ0x3MycsICdMdzQnLCAnTHc1JywgJ0x3NiddLFxuICAgIFsnU2FiYmlpdGknLCAnQmFsYXphJywgJ0x3YWt1YmlyaScsICdMd2FrdXNhdHUnLCAnTHdha3VuYScsICdMd2FrdXRhYW5vJywgJ0x3YW11a2FhZ2EnXSxcbiAgICBbJ1NhYicsICdCYWwnLCAnTHcyJywgJ0x3MycsICdMdzQnLCAnTHc1JywgJ0x3NiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0onLCAnRicsICdNJywgJ0EnLCAnTScsICdKJywgJ0onLCAnQScsICdTJywgJ08nLCAnTicsICdEJ10sXG4gICAgWydKYW4nLCAnRmViJywgJ01hcicsICdBcHUnLCAnTWFhJywgJ0p1dScsICdKdWwnLCAnQWd1JywgJ1NlYicsICdPa2knLCAnTm92JywgJ0RlcyddLFxuICAgIFtcbiAgICAgICdKYW53YWxpeW8nLCAnRmVid2FsaXlvJywgJ01hcmlzaScsICdBcHVsaScsICdNYWF5aScsICdKdXVuaScsICdKdWxhYXlpJywgJ0FndXNpdG8nLFxuICAgICAgJ1NlYnV0dGVtYmEnLCAnT2tpdG9iYmEnLCAnTm92ZW1iYScsICdEZXNlbWJhJ1xuICAgIF1cbiAgXSxcbiAgdSwgW1snQkMnLCAnQUQnXSwgdSwgWydLdWxpc2l0byBuZ2EgdGFubmF6YScsICdCdWt5YSBLdWxpc2l0byBBemFhbCddXSwgMSwgWzYsIDBdLFxuICBbJ2RkL01NL3knLCAnZCBNTU0geScsICdkIE1NTU0geScsICdFRUVFLCBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLCBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzAlJywgJyMsIyMwLjAwwqQnLCAnI0UwJ10sICdVU2gnLCAnU2lsaW5naSBleWEgWXVnYW5kYScsXG4gIHsnSlBZJzogWydKUMKlJywgJ8KlJ10sICdVR1gnOiBbJ1VTaCddLCAnVVNEJzogWydVUyQnLCAnJCddfSwgcGx1cmFsXG5dO1xuIl19                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                /**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/mr", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || n === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'mr', [['स', 'सं'], ['म.पू.', 'म.उ.'], u], [['म.पू.', 'म.उ.'], u, u],
        [
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'],
            [
                'रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र',
                'शनि'
            ],
            [
                'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार',
                'गुरुवार', 'शुक्रवार', 'शनिवार'
            ],
            ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श']
        ],
        u,
        [
            [
                'जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ',
                'नो', 'डि'
            ],
            [
                'जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे',
                'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो',
                'नोव्हें', 'डिसें'
            ],
            [
                'जानेवारी', 'फेब्रुवारी', 'मार्च',
                'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट',
                'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर',
                'डिसेंबर'
            ]
        ],
        u,
        [
            ['इ. स. पू.', 'इ. स.'], u,
            ['ईसवीसनपूर्व', 'ईसवीसन']
        ],
        0, [0, 0], ['d/M/yy', 'd MMM, y', 'd MMMM, y', 'EEEE, d MMMM, y'],
        ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
        ['{1}, {0}', u, '{1} रोजी {0}', u],
        ['.', ',', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##,##0.###', '#,##0%', '¤#,##0.00', '[#E0]'], '₹', 'भारतीय रुपया',
        { 'JPY': ['JP¥', '¥'], 'THB': ['฿'], 'TWD': ['NT$'] }, plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9tci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLGdCQUFnQixDQUFTO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDakMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxrQkFBZTtRQUNiLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwRTtZQUNFLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDO1lBQ3hDO2dCQUNFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTztnQkFDNUMsS0FBSzthQUNOO1lBQ0Q7Z0JBQ0UsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUTtnQkFDdkMsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRO2FBQ2hDO1lBQ0QsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7U0FDekM7UUFDRCxDQUFDO1FBQ0Q7WUFDRTtnQkFDRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHO2dCQUN0RCxJQUFJLEVBQUUsSUFBSTthQUNYO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUk7Z0JBQ3hDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPO2dCQUN0QyxTQUFTLEVBQUUsT0FBTzthQUNuQjtZQUNEO2dCQUNFLFVBQVUsRUFBRSxZQUFZLEVBQUUsT0FBTztnQkFDakMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU87Z0JBQ3RDLFVBQVUsRUFBRSxTQUFTLEVBQUUsV0FBVztnQkFDbEMsU0FBUzthQUNWO1NBQ0Y7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ3pCLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQztTQUMxQjtRQUNELENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDO1FBQ2pFLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUM7UUFDeEQsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDbEMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUM5RCxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxjQUFjO1FBQ3JFLEVBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFDLEVBQUUsTUFBTTtLQUM1RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IG4gPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnbXInLCBbWyfgpLgnLCAn4KS44KSCJ10sIFsn4KSuLuCkquClgi4nLCAn4KSuLuCkiS4nXSwgdV0sIFtbJ+Ckri7gpKrgpYIuJywgJ+Ckri7gpIkuJ10sIHUsIHVdLFxuICBbXG4gICAgWyfgpLAnLCAn4KS44KWLJywgJ+CkruCkgicsICfgpKzgpYEnLCAn4KSX4KWBJywgJ+CktuClgScsICfgpLYnXSxcbiAgICBbXG4gICAgICAn4KSw4KS14KS/JywgJ+CkuOCli+CkricsICfgpK7gpILgpJfgpLMnLCAn4KSs4KWB4KSnJywgJ+Ckl+ClgeCksOClgScsICfgpLbgpYHgpJXgpY3gpLAnLFxuICAgICAgJ+CktuCkqOCkvydcbiAgICBdLFxuICAgIFtcbiAgICAgICfgpLDgpLXgpL/gpLXgpL7gpLAnLCAn4KS44KWL4KSu4KS14KS+4KSwJywgJ+CkruCkguCkl+Cks+CkteCkvuCksCcsICfgpKzgpYHgpKfgpLXgpL7gpLAnLFxuICAgICAgJ+Ckl+ClgeCksOClgeCkteCkvuCksCcsICfgpLbgpYHgpJXgpY3gpLDgpLXgpL7gpLAnLCAn4KS24KSo4KS/4KS14KS+4KSwJ1xuICAgIF0sXG4gICAgWyfgpLAnLCAn4KS44KWLJywgJ+CkruCkgicsICfgpKzgpYEnLCAn4KSX4KWBJywgJ+CktuClgScsICfgpLYnXVxuICBdLFxuICB1LFxuICBbXG4gICAgW1xuICAgICAgJ+CknOCkvicsICfgpKvgpYcnLCAn4KSu4KS+JywgJ+CkjycsICfgpK7gpYcnLCAn4KSc4KWCJywgJ+CknOClgScsICfgpJEnLCAn4KS4JywgJ+