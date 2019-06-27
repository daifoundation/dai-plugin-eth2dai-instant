import Eth2DaiInstantService from './Eth2DaiInstantService';

export default {
  addConfig: function(config) {
    return {
      ...config,
      additionalServices: ['exchange'],
      exchange: [Eth2DaiInstantService]
    }
  }
}