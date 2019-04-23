import Eth2DaiDirectService from './Eth2DaiDirectService';

export default {
  addConfig: function(config) {
    return {
      ...config,
      additionalServices: ['exchange'],
      exchange: [Eth2DaiDirectService]
    }
  }
}