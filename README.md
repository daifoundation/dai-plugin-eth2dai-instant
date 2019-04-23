<h1 align="center">
Eth2Dai Direct Plugin
</h1>

This plugin can be injected into [dai.js](https://github.com/makerdao/dai.js) to execute atomic trades on [Eth2Dai](https://eth2dai.com/). It uses the contract FKA [Oasis Direct Proxy](https://github.com/makerdao/oasis-direct-proxy) to interact with the underlying [Maker OTC](https://github.com/makerdao/maker-otc) contract.

___
## Usage

The `Eth2DaiDirectService` normalizes the syntax across different types of trades, so the main functionality is represented simply by `sell` and `buy`. The difference between these two functions is the value you're defining explicitly; for example, a user might want to `sell` one hundred Dai for however much ETH it can buy (or vice versa).

**The valid token symbols for either side of the trade are `'ETH'`, `'WETH'`, `'PETH'`, and `'DAI'`.**

Please refer to the [dai.js documentation](https://github.com/makerdao/dai.js/wiki) for more details on how to configure this plugin with the SDK.

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

The service can also query the OTC contract for the buy amount for a supplied pay amount and the pay amount for a supplied buy amount. If the value of the exchange deviates from this estimate by more than a configurable `slippage limit`, the trade will be reverted.

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

## Development

```
$ git clone https://github.com/makerdao/dai-plugin-eth2dai-direct.git
$ yarn
$ git submodule update --init --recursive
```

* Run tests with `yarn test`
* Run testnet with `yarn test:net`. This will run by default with `yarn test`, but can also run independently
* Build for publication with `yarn build`
