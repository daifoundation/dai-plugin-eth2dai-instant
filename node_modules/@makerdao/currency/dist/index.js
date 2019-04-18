'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGetCurrency = exports.Currency = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.createCurrency = createCurrency;
exports.createCurrencyRatio = createCurrencyRatio;

var _Currency2 = require('./Currency');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Currency = exports.Currency = _Currency2.Currency;

function createCurrency(symbol) {
  // This provides short syntax, e.g. ETH(6). We need a wrapper function because
  // you can't call an ES6 class consructor without `new`
  var creatorFn = function creatorFn(amount, shift) {
    return new CurrencyX(amount, shift);
  };

  var CurrencyX = function (_Currency) {
    (0, _inherits3.default)(CurrencyX, _Currency);

    function CurrencyX(amount, shift) {
      (0, _classCallCheck3.default)(this, CurrencyX);

      var _this = (0, _possibleConstructorReturn3.default)(this, (CurrencyX.__proto__ || (0, _getPrototypeOf2.default)(CurrencyX)).call(this, amount, shift));

      _this.symbol = symbol;

      // this.type can be used an alternative to `this.constructor` when you
      // want to use the short syntax, e.g.:
      //
      //   var foo = ETH(1);
      //   var bar = foo.type(2);
      //   assert(foo.plus(bar).eq(ETH(3)));
      //
      _this.type = creatorFn;
      return _this;
    }

    return CurrencyX;
  }(Currency);

  // this changes the name of the class in stack traces


  Object.defineProperty(CurrencyX, 'name', { value: symbol });
  Object.defineProperty(CurrencyX, 'symbol', { value: symbol });

  (0, _assign2.default)(creatorFn, {
    wei: makeShiftedCreatorFn(creatorFn, symbol, 'wei'),
    ray: makeShiftedCreatorFn(creatorFn, symbol, 'ray'),
    rad: makeShiftedCreatorFn(creatorFn, symbol, 'rad'),
    symbol: symbol,
    isInstance: function isInstance(obj) {
      return obj instanceof CurrencyX;
    }
  });

  (0, _assign2.default)(CurrencyX, { wei: creatorFn.wei, ray: creatorFn.ray });
  return creatorFn;
}

function createCurrencyRatio(wrappedNumerator, wrappedDenominator) {
  var numerator = wrappedNumerator(0).constructor;
  var denominator = wrappedDenominator(0).constructor;

  var creatorFn = function creatorFn(amount, shift) {
    return new _Currency2.CurrencyRatio(amount, numerator, denominator, shift);
  };

  var symbol = numerator.symbol + '/' + denominator.symbol;

  (0, _assign2.default)(creatorFn, {
    wei: makeShiftedCreatorFn(creatorFn, symbol, 'wei'),
    ray: makeShiftedCreatorFn(creatorFn, symbol, 'ray'),
    rad: makeShiftedCreatorFn(creatorFn, symbol, 'rad'),
    symbol: symbol,
    isInstance: function isInstance(obj) {
      return obj instanceof _Currency2.CurrencyRatio && obj.symbol === symbol;
    }
  });

  return creatorFn;
}

function makeShiftedCreatorFn(creatorFn, symbol, shift) {
  var fn = function fn(amount) {
    return creatorFn(amount, shift);
  };
  // these two properties are used by getCurrency
  fn.symbol = symbol;
  fn.shift = shift;
  return fn;
}

/*
this factory function produces a function that will check input values against a
whitelist; it's useful if you want to accept a variety of inputs, e.g.:

  foo(ETH(1))
  foo(1, ETH)
  foo(1)      // if you set a default unit argument
  foo('1')    // if you set a default unit argument
*/
var createGetCurrency = exports.createGetCurrency = function createGetCurrency(currencies) {
  return function (amount, unit) {
    if (amount instanceof Currency) return amount;
    if (!unit) throw new Error('Amount is not a Currency');
    var key = typeof unit === 'string' ? unit.toUpperCase() : unit.symbol;
    var ctor = currencies[key];
    if (!ctor) {
      throw new Error('Couldn\'t find currency for "' + key + '"');
    }
    return ctor(amount, unit.shift);
  };
};