{"version":3,"file":"AsapScheduler.js","sourceRoot":"","sources":["../../src/scheduler/AsapScheduler.ts"],"names":[],"mappings":";;;;;OACO,EAAE,cAAc,EAAE,MAAM,kBAAkB;AAEjD;IAAmC,iCAAc;IAAjD;QAAmC,8BAAc;IA2BjD,CAAC;IA1BQ,6BAAK,GAAZ,UAAa,MAAyB;QAEpC,IAAI,CAAC,MAAM,GAAG,IAAI,CAAC;QACnB,IAAI,CAAC,SAAS,GAAG,SAAS,CAAC;QAEpB,0BAAO,CAAS;QACvB,IAAI,KAAU,CAAC;QACf,IAAI,KAAK,GAAW,CAAC,CAAC,CAAC;QACvB,IAAI,KAAK,GAAW,OAAO,CAAC,MAAM,CAAC;QACnC,MAAM,GAAG,MAAM,IAAI,OAAO,CAAC,KAAK,EAAE,CAAC;QAEnC,GAAG,CAAC;YACF,EAAE,CAAC,CAAC,KAAK,GAAG,MAAM,CAAC,OAAO,CAAC,MAAM,CAAC,KAAK,EAAE,MAAM,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC;gBACvD,KAAK,CAAC;YACR,CAAC;QACH,CAAC,QAAQ,EAAE,KAAK,GAAG,KAAK,IAAI,CAAC,MAAM,GAAG,OAAO,CAAC,KAAK,EAAE,CAAC,EAAE;QAExD,IAAI,CAAC,MAAM,GAAG,KAAK,CAAC;QAEpB,EAAE,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC;YACV,OAAO,EAAE,KAAK,GAAG,KAAK,IAAI,CAAC,MAAM,GAAG,OAAO,CAAC,KAAK,EAAE,CAAC,EAAE,CAAC;gBACrD,MAAM,CAAC,WAAW,EAAE,CAAC;YACvB,CAAC;YACD,MAAM,KAAK,CAAC;QACd,CAAC;IACH,CAAC;IACH,oBAAC;AAAD,CAAC,AA3BD,CAAmC,cAAc,GA2BhD"}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     /** PURE_IMPORTS_START ._AsyncAction,._AsyncScheduler PURE_IMPORTS_END */
import { AsyncAction } from './AsyncAction';
import { AsyncScheduler } from './AsyncScheduler';
/**
 *
 * Async Scheduler
 *
 * <span class="informal">Schedule task as if you used setTimeout(task, duration)</span>
 *
 * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript
 * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
 * in intervals.
 *
 * If you just want to "defer" task, that is to perform it right after currently
 * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
 * better choice will be the {@link asap} scheduler.
 *
 * @example <caption>Use async scheduler to delay task</caption>
 * const task = () => console.log('it works!');
 *
 * Rx.Scheduler.async.schedule(task, 2000);
 *
 * // After 2 seconds logs:
 * // "it works!"
 *
 *
 * @example <caption>Use async scheduler to repeat task in intervals</caption>
 * function task(state) {
 *   console.log(state);
 *   this.schedule(state + 1, 1000); // `this` references currently executing Action,
 *                                   // which we reschedule with new state and delay
 * }
 *
 * Rx.Scheduler.async.schedule(task, 3000, 0);
 *
 * // Logs:
 * // 0 after 3s
 * // 1 after 4s
 * // 2 after 5s
 * // 3 after 6s
 *
 * @static true
 * @name async
 * @owner Scheduler
 */
export var async = /*@__PURE__*/ new AsyncScheduler(AsyncAction);
//# sourceMappingURL=async.js.map
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         {"version":3,"file":"AsyncAction.js","sourceRoot":"","sources":["../../src/scheduler/AsyncAction.ts"],"names":[],"mappings":"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"}                                                                                                                                                                                                                                                                                                                                                                                                                /** PURE_IMPORTS_START .._Scheduler PURE_IMPORTS_END */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Scheduler } from '../Scheduler';
export var AsyncScheduler = /*@__PURE__*/ (/*@__PURE__*/ function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler() {
        _super.apply(this, arguments);
        this.actions = [];
        /**
         * A flag to indicate whether the Scheduler is currently executing a batch of
         * queued actions.
         * @type {boolean}
         */
        this.active = false;
        /**
         * An internal ID used to track the latest asynchronous task such as those
         * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
         * others.
         * @type {any}
         */
        this.scheduled = undefined;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this.active) {
            actions.push(action);
            return;
        }
        var error;
        this.active = true;
        do {
            if (error = action.execute(action.state, action.delay)) {
                break;
            }
        } while (action = actions.shift()); // exhaust the scheduler queue
        this.active = false;
        if (error) {
            while (action = actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));
//# sourceMappingURL=AsyncScheduler.js.map
                                                                                                                                                                                                                                                                                                                                                                                                                       