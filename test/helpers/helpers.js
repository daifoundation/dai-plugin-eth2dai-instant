import fetch from 'isomorphic-fetch';
import accounts from './testAccounts';
import { utils } from 'ethers';
import { DAI, WETH } from '../../src/Currency';

function buildTestContainer(settings = {}) {
  const config = {
    web3: {
      provider: {
        type: 'HTTP',
        url: 'http://localhost:2000'
      },
      pollingInterval: 50
    },
    log: false
  };;

  return new DefaultServiceProvider(merge({}, config, settings));
}

export function buildTestService(name, settings = {}) {
  if (!settings[name]) settings[name] = true;
  return buildTestContainer(settings).service(name);
}

let requestCount = 0;

function callGanache(method, params = []) {
  return fetch('http://localhost:2000', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: requestCount++
    })
  });
}

async function mineBlocks(service, count) {
  if (service.manager().name() !== 'token') {
    service = service.get('token');
  }
  const web3Service = service.get('web3');
  if (!count) count = web3Service.confirmedBlockCount() + 2;

  assert(
    WAIT_AFTER_MINE_CALL > web3Service._pollingInterval * 2,
    'mineBlocks may not work well; pollingInterval is too long'
  );

  const initialNumber = web3Service.blockNumber();

  for (let i = 0; i < count; i++) {
    await callGanache('evm_mine');
    await promiseWait(WAIT_AFTER_MINE_CALL);
  }

  const newNumber = web3Service.blockNumber();
  const expectedNumber = initialNumber + count;
  assert(
    newNumber >= expectedNumber,
    `blockNumber should be >= ${expectedNumber}, is ${newNumber}`
  );
}

export async function createDai(otcService) {
  const cdp = await otcService.get('cdp').openCdp();
  const tx = cdp.lockEth(1);
  mineBlocks(otcService);
  await tx;
  return await cdp.drawDai(10);
}

export async function placeLimitOrder(otcService, sellDai) {
  const wethToken = otcService.get('token').getToken(WETH);
  const wethAddress = wethToken.address();
  const daiToken = otcService.get('token').getToken(DAI);
  const daiAddress = daiToken.address();
  const oasisAddress = otcService
    .get('smartContract')
    .getContractByName('MAKER_OTC').address;
  const sellToken = sellDai ? daiAddress : wethAddress;
  const buyToken = sellDai ? wethAddress : daiAddress;
  const value = sellDai ? utils.parseEther('2.0') : utils.parseEther('10.0');
  const position = sellDai ? 0 : 1;

  await wethToken.deposit('1');
  await wethToken.approveUnlimited(oasisAddress);
  await daiToken.approveUnlimited(oasisAddress);

  return offer(
    otcService,
    utils.parseEther('0.5'),
    sellToken,
    value,
    buyToken,
    position
  );
}

async function offer(
  otcService,
  payAmount,
  payTokenAddress,
  buyAmount,
  buyTokenAddress,
  position
) {
  const oasisContract = otcService
    .get('smartContract')
    .getContractByName('MAKER_OTC');

  const tx = await oasisContract.offer(
    payAmount,
    payTokenAddress,
    buyAmount,
    buyTokenAddress,
    position
  );
  return await tx.mine();
}

export async function getNewAccount(proxyService, index = 20) {
  const account = {
    address: accounts.addresses[index],
    key: accounts.keys[index]
  };
  const proxy = await proxyService.getProxyAddress(account.address);
  if (proxy) return await getNewAccount(proxyService, index + 5);
  return account;
}

export async function setProxyAccount(service, account) {
  const accountService = service
    .get('token')
    .get('web3')
    .get('accounts');
  await accountService.addAccount(account.address, {
    type: 'privateKey',
    key: account.key
  });
  accountService.useAccount(account.address);
}