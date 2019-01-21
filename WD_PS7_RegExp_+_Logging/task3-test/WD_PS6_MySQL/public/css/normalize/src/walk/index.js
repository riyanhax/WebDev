'use strict';
var Buffer = require('../../').Buffer;


var assert = require('assert');

var util = require('util');

var buffer = require('../../');

buffer.INSPECT_MAX_BYTES = 2;

var b = Buffer.allocUnsafe(4);
b.fill('1234');

var s = buffer.SlowBuffer(4);
s.fill('1234');

var expected = '<Buffer 31 32 ... >';

assert.strictEqual(util.inspect(b), expected);
assert.strictEqual(util.inspect(s), expected);

b = Buffer.allocUnsafe(2);
b.fill('12');

s = buffer.SlowBuffer(2);
s.fill('12');

expected = '<Buffer 31 32>';

assert.strictEqual(util.inspect(b), expected);
assert.strictEqual(util.inspect(s), expected);

buffer.INSPECT_MAX_BYTES = Infinity;

assert.doesNotThrow(function() {
  assert.strictEqual(util.inspect(b), expected);
  assert.strictEqual(util.inspect(s), expected);
});

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        INDX( 	 D�=c           (   �  �        o                   ]�     ` J     M�     '��t��Ju��Ju���&�jM1�                       a j a x       �     h R     M�     ��u�� �8�m��6)u������)�       �              i n d e x . j s       &�     p Z     M�     �"u�� �8�m�)2u��sz���)�       �	              i n d e x . j s . m a p       &�     p Z     M�     �"u�� �8�m�)2u��sz���)�       �	              I N D E X J ~ 1 . M A P       ��     h R     M�     _2hu��?ȩy��?ȩy��[kM1�                       i n t e r n a l - c o ;�     � n     M�     ��(u��JD`u��JD`u��[kM1�                       i n t e r n a l - c o m p a t i b i l i t y   ;�     h R     M�     ��(u��JD`u��JD`u��[kM1�                       I N T E R N ~ 1       ��     h X     M�     �z�� �8�m���z��e]���)� 0      8+              L I C E N S E . t x t ��     h T     M�     ��z��Cz��Cz��[kM1�                       	o p e r a t  r s     ��     h R     M�     ��z��Cz��Cz��[kM1�                       O P E R A T ~ 1       Ѹ     p `     M�     �>z�� �8�m��i"z��9���)� �      A�              p a t h - m a p p i n g . j s Ѹ     h X     M�     �>z�� �8�m��i"z��9���)� �      A�              P A T H - M ~ 1 . J S �     h T     M�     �z�� �8�m�q�$z��ɪ��)�        h              	R E A D M E . m d     ��     ` P     M�     ��"z���&z���&z��[kM1�                      t e s t i n g �     h T     M�     ��(z��@�+z��@�+z��[kM1�                       	w e b S o c k e t     �     h R     M�     ��(z��@�+z��@�+z��[kM1�                       W E B S O C ~ 1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                var constant = require('./constant'),
    defineProperty = require('./_defineProperty'),
    identity = require('./identity');

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               