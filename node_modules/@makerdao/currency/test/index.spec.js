import {
  Currency,
  createCurrency,
  createCurrencyRatio,
  createGetCurrency
} from '../src';

const DAI = createCurrency('DAI');
const MKR = createCurrency('MKR');
const ETH = createCurrency('ETH');
const PETH = createCurrency('PETH');
const WETH = createCurrency('WETH');
const USD = createCurrency('USD');
const USD_DAI = createCurrencyRatio(USD, DAI);

test('short syntax', () => {
  expect(ETH(1).toString()).toBe('1.00 ETH');
  expect(PETH(2).toString()).toBe('2.00 PETH');
  expect(WETH(3).toString()).toBe('3.00 WETH');
  expect(DAI(4).toString()).toBe('4.00 DAI');
  expect(MKR(5).toString()).toBe('5.00 MKR');
});

test('optional shift argument', () => {
  expect(ETH(100, -2).toString()).toBe('1.00 ETH');
});

test('short syntax for wei (1e18) amounts', () => {
  const n = MKR.wei('2110000000000000000');
  expect(n).toEqual(MKR(2.11));
});

test('short syntax for ray (1e27) amounts', () => {
  const n = PETH.ray('5130000000000000000000000000');
  expect(n).toEqual(PETH(5.13));
});

test('short syntax for rad (1e45) amounts', () => {
  const n = PETH.rad('1470000000000000000000000000000000000000000000');
  expect(n).toEqual(PETH(1.47));
});

test('toString prints the specified number of decimals', () => {
  const n = MKR('1000.5447123');
  expect(n.toString(3)).toBe('1000.545 MKR');
});

test('basic math', () => {
  const a = MKR('1.2');
  const b = MKR('3.4');
  expect(a.plus(b).toString()).toBe('4.60 MKR');
});

test('comparisons', () => {
  const a = MKR('1.2');
  const b = MKR('3.4');
  expect(a.lt(b)).toBe(true);
  expect(a.gt(b)).toBe(false);
});

test('prevent math on mismatched types', () => {
  expect(() => {
    MKR(1).plus(DAI(1));
  }).toThrow('Invalid operation: MKR plus DAI');

  expect(() => {
    USD(1).times(USD_DAI(2));
  }).toThrow('Invalid operation: USD times USD/DAI');

  expect(() => {
    DAI(4).div(USD_DAI(2));
  }).toThrow('Invalid operation: DAI div USD/DAI');
});

test('equality of different instances', () => {
  expect(MKR('2').isEqual(MKR('2'))).toBeTruthy();
  expect(MKR(2)).toEqual(MKR('2'));
  expect(MKR('2')).not.toEqual(MKR('2.1'));
  expect(MKR('2')).not.toEqual(DAI('2'));
});

test('convert to fixed-point string with optional shifting', () => {
  expect(DAI(500).toFixed()).toEqual('500');
  expect(DAI(500).toFixed(2)).toEqual('50000');
  expect(DAI(5).toFixed('wei')).toEqual('5000000000000000000');
  expect(DAI(5).toFixed('ray')).toEqual('5000000000000000000000000000');
  expect(DAI(5).toFixed('rad')).toEqual(
    '5000000000000000000000000000000000000000000000'
  );

  // always round down amounts smaller than 1 wei
  expect(DAI.wei(1.5).toFixed('wei')).toEqual('1');
});

test('wrap some BigNumber methods', () => {
  expect(DAI(4).shiftedBy(2)).toEqual(DAI(400));
});

test('toNumber', () => {
  expect(ETH(5).toNumber()).toEqual(5);
});

test('ratios', () => {
  const value = USD_DAI(14);
  expect(value.toString()).toEqual('14.00 USD/DAI');
});

test('multiplying by a ratio', () => {
  const value1 = DAI(20);
  const value2 = USD_DAI(4);
  expect(value1.times(value2)).toEqual(USD(80));
});

test('dividing by a ratio', () => {
  const value1 = USD(20);
  const value2 = USD_DAI(4);
  expect(value1.div(value2)).toEqual(DAI(5));
});

test('creating a ratio from division', () => {
  const value1 = USD(4);
  const value2 = DAI(20);
  expect(value1.div(value2)).toEqual(USD_DAI(0.2));
});

test('instanceof Currency', () => {
  expect(ETH(5) instanceof Currency).toBeTruthy();
});

test('isInstance', () => {
  expect(DAI.isInstance(DAI(1))).toBeTruthy();
  expect(DAI.isInstance(MKR(1))).toBeFalsy();

  expect(USD_DAI.isInstance(USD_DAI(1))).toBeTruthy();
  expect(USD_DAI.isInstance(PETH(1))).toBeFalsy();
});

test('instance.type = short syntax creator', () => {
  const val = ETH(1);
  const val2 = val.type(1);
  expect(val2).toEqual(val);
});

describe('getCurrency', () => {
  let getCurrency;

  beforeAll(() => {
    getCurrency = createGetCurrency({ DAI, MKR, ETH, PETH, WETH, USD });
  });

  test('passes through Currency instance', () => {
    const val = ETH(5);
    expect(getCurrency(val)).toEqual(val);
  });

  test('parses an amount and currency symbol', () => {
    expect(getCurrency(1, 'dai').toString()).toBe('1.00 DAI');
    expect(getCurrency(1, 'mkr').toString()).toBe('1.00 MKR');
    expect(getCurrency(1, 'weth').toString()).toBe('1.00 WETH');
    expect(getCurrency(1, 'peth').toString()).toBe('1.00 PETH');
    expect(getCurrency(1, 'eth').toString()).toBe('1.00 ETH');
  });

  test('parses an amount + currency class', () => {
    expect(getCurrency(1, ETH).toString()).toBe('1.00 ETH');
    expect(getCurrency(1, PETH).toString()).toBe('1.00 PETH');
    expect(getCurrency(1, WETH).toString()).toBe('1.00 WETH');
    expect(getCurrency(1, DAI).toString()).toBe('1.00 DAI');
    expect(getCurrency(1, MKR).toString()).toBe('1.00 MKR');
  });

  test('parses an amount + currency as wei', () => {
    const val = 10000000000000000;
    expect(getCurrency(val, ETH.wei).toString()).toBe('0.01 ETH');
    expect(getCurrency(val, PETH.wei).toString()).toBe('0.01 PETH');
    expect(getCurrency(val, WETH.wei).toString()).toBe('0.01 WETH');
    expect(getCurrency(val, DAI.wei).toString()).toBe('0.01 DAI');
    expect(getCurrency(val, MKR.wei).toString()).toBe('0.01 MKR');
  });

  test('parses an amount + currency as ray', () => {
    const val = 10000000000000000000000000;
    expect(getCurrency(val, ETH.ray).toString()).toBe('0.01 ETH');
    expect(getCurrency(val, PETH.ray).toString()).toBe('0.01 PETH');
    expect(getCurrency(val, WETH.ray).toString()).toBe('0.01 WETH');
    expect(getCurrency(val, DAI.ray).toString()).toBe('0.01 DAI');
    expect(getCurrency(val, MKR.ray).toString()).toBe('0.01 MKR');
  });

  test('throws an error if there is no unit', () => {
    expect(() => {
      getCurrency(1);
    }).toThrowError('Amount is not a Currency');
  });

  test('throws an error if amount is negative', () => {
    expect(() => {
      getCurrency('-1', 'eth');
    }).toThrowError('amount cannot be negative');
  });

  test('throws an error if symbol is unrecognized', () => {
    expect(() => {
      getCurrency(1, 'foo');
    }).toThrowError('Couldn\'t find currency for "FOO"');
  });
});
