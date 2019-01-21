(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.returnExports = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @file Tests if ES6 @@toStringTag is supported.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 * @version 1.4.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */

'use strict';

/**
 * Indicates if `Symbol.toStringTag`exists and is the correct type.
 * `true`, if it exists and is the correct type, otherwise `false`.
 *
 * @type boolean
 */
module.exports = _dereq_('has-symbol-support-x') && typeof Symbol.toStringTag === 'symbol';

},{"has-symbol-support-x":2}],2:[function(_dereq_,module,exports){
/**
 * @file Tests if ES6 Symbol is supported.
 * @version 1.4.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

'use strict';

/**
 * Indicates if `Symbol`exists and creates the correct type.
 * `true`, if it exists and creates the correct type, otherwise `false`.
 *
 * @type boolean
 */
module.exports = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';

},{}]},{},[1])(1)
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        'use strict';

module.exports = function runSymbolTests(t) {
	t.equal(typeof Symbol, 'function', 'global Symbol is a function');

	if (typeof Symbol !== 'function') { return false };

	t.notEqual(Symbol(), Symbol(), 'two symbols are not equal');

	/*
	t.equal(
		Symbol.prototype.toString.call(Symbol('foo')),
		Symbol.prototype.toString.call(Symbol('foo')),
		'two symbols with the same description stringify the same'
	);
	*/

	var foo = Symbol('foo');

	/*
	t.notEqual(
		String(foo),
		String(Symbol('bar')),
		'two symbols with different descriptions do not stringify the same'
	);
	*/

	t.equal(typeof Symbol.prototype.toString, 'function', 'Symbol#toString is a function');
	// t.equal(String(foo), Symbol.prototype.toString.call(foo), 'Symbol#toString equals String of the same symbol');

	t.equal(typeof Object.getOwnPropertySymbols, 'function', 'Object.getOwnPropertySymbols is a function');

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	t.notEqual(typeof sym, 'string', 'Symbol is not a string');
	t.equal(Object.prototype.toString.call(sym), '[object Symbol]', 'symbol primitive Object#toStrings properly');
	t.equal(Object.prototype.toString.call(symObj), '[object Symbol]', 'symbol primitive Object#toStrings properly');

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { t.fail('symbol property key was found in for..in of object'); }

	t.deepEqual(Object.keys(obj), [], 'no enumerable own keys on symbol-valued object');
	t.deepEqual(Object.getOwnPropertyNames(obj), [], 'no own names on symbol-valued object');
	t.deepEqual(Object.getOwnPropertySymbols(obj), [sym], 'one own symbol on symbol-valued object');
	t.equal(Object.prototype.propertyIsEnumerable.call(obj, sym), true, 'symbol is enumerable');
	t.deepEqual(Object.getOwnPropertyDescriptor(obj, sym), {
		configurable: true,
		enumerable: true,
		value: 42,
		writable: true
	}, 'property descriptor is correct');
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               