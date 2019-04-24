<h1 align="center">
Eth2Dai Direct Plugin
</h1>

This plugin can be injected into [dai.js](https://github.com/makerdao/dai.js) to execute atomic trades on [Eth2Dai](https://eth2dai.com/). It uses the contract FKA [Oasis Direct Proxy](https://github.com/makerdao/oasis-direct-proxy) to interact with the underlying [Maker OTC](https://github.com/makerdao/maker-otc) contract.

[![NPM][npm]][npm-url]
[![Build Status][build]][build-url]
[![GitHub License][license]][license-url]

___
### Usage

To configure the [SDK](https://www.npmjs.com/package/@makerdao/dai) with this plugin:
```
$ yarn add @makerdao/dai
$ yarn add @makerdao/dai-plugin-eth2dai-direct
```
```js
import Maker from '@makerdao/dai';
import Eth2DaiDirect from '@makerdao/dai-plugin-eth2dai-direct';

async function createMakerAndSellEth(amount) {
  const maker = await Maker.create('browser', {
    plugins: [Eth2DaiDirect]
  });
  await maker.authenticate();
  await maker.service('exchange').sell('ETH', 'DAI', amount);
}
```

Note that the `'browser'` preset above is only an example, not a specific requirement of the Eth2Dai Direct plugin. For more information about available presets, configuration options, and additional plugins, check the [dai.js docs](https://github.com/makerdao/dai.js/wiki).

___

The `Eth2DaiDirectService` normalizes the syntax across different types of trades, so the main functionality is represented simply by `sell` and `buy`. The difference between these two functions is the value defined explicitly as a parameter; for example, a user might want to `sell` one hundred Dai for however much ETH that Dai can buy.

**The valid token symbols for either side of any trade are `'ETH'`, `'WETH'`, `'PETH'`, and `'DAI'`.**

___

* `sell` takes three parameters: the `sellToken` (string), the `buyToken` (string), and the `amount` (string or number)

```js
maker.service('exchange').sell('ETH', 'DAI', '1');
```

* `buy` takes three parameters: the `buyToken` (string), the `sellToken` (string), and the `amount` (string or number)

```js
maker.service('exchange').buy('DAI', 'ETH', 150);
```

____

The service can also query the OTC contract for the buy amount for a supplied pay amount and the pay amount for a supplied buy amount. If the price of the exchange deviates from this estimate by more than a configurable `slippage limit`, the trade will be reverted.

___

* `getBuyAmount` takes three parameters: `buyToken` (string), `sellToken` (string), and `sellAmount` (string or number)

```js
const amount = await maker.service('exchange').getBuyAmount('DAI', 'ETH', 150);
```

* `getPayAmount` takes three paramaters: `sellToken` (string), `buyToken` (string), and `buyAmount` (string or number)

```js
const amount = await maker.service('exchange').getPayAmount('ETH', 'DAI', '1');
```

* `setSlippageLimit` takes one parameter: `limit` (float). **The default slippage limit is 0.02, or 2%**.

```js
maker.service('exchange').setSlippageLimit(0.05);
```
___

### Development

```
$ git clone https://github.com/makerdao/dai-plugin-eth2dai-direct.git
$ cd dai-plugin-eth2dai-direct/
$ yarn
$ git submodule update --init --recursive
```

* Run tests with `yarn test`
* Run testnet with `yarn test:net`. This will run by default with `yarn test`, but can also run independently
* Build for publication with `yarn build`

[license]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/makerdao/dai-plugin-eth2dai-direct/blob/master/LICENSE
[build]: https://travis-ci.com/makerdao/dai-plugin-eth2dai-direct.svg?branch=master
[build-url]: https://travis-ci.com/makerdao/dai-plugin-eth2dai-direct
[npm]: https://img.shields.io/npm/v/@makerdao/dai-plugin-eth2dai-direct.svg?style=flat
[npm-url]: https://www.npmjs.com/package/@makerdao/dai-plugin-eth2dai-direct
