import { Insight } from '@oipwg/insight-explorer'

import URLExplorer from './URLExplorer.js'

const defaultCoins = {
  bitcoin: {
    usd: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      transform: function (response) {
        if (response && response.bitcoin && response.bitcoin.usd) {
          return response.bitcoin.usd
        }
      }
    }
  },
  litecoin: {
    usd: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd',
      transform: function (response) {
        if (response && response.litecoin && response.litecoin.usd) {
          return response.litecoin.usd
        }
      }
    }
  },
  flo: {
    usd: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=flo&vs_currencies=usd',
      transform: function (response) {
        if (response && response.flo && response.flo.usd) {
          return response.flo.usd
        }
      }
    }
  },
  raven: {
    usd: {
      url: 'https://api.coingecko.com/api/v3/simple/price?ids=ravencoin&vs_currencies=usd',
      transform: function (response) {
        if (response && response.ravencoin && response.ravencoin.usd) {
          return response.ravencoin.usd
        }
      }
    }
  }
}

/**
 * @typedef {object} CoinObject
 * @property {string} CoinName - The string name for the coin
 * @property {FiatObject} CoinName.Fiat - Information about the Fiat to convert for the specific coin
 * @example
 * {
 *   'bitcoin': {
 *     'usd': {
 *       'url': 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
 *       'transform': function (response) {
 *         if (response && response.bitcoin && response.bitcoin.usd) {
 *           return response.bitcoin.usd
 *         }
 *       }
 *     }
 *   }
 * }
 */

/**
 * @typedef {object} FiatObject
 * @property {string} FiatType - The Fiat Type you are defining (i.e. "usd")
 * @property {string} [FiatType.url] - The URL to scrape for the Coin to Fiat conversion
 * @property {string} [FiatType.insight] - The Insight API server to scrape for the Coin to Fiat conversion
 * @property {function} [FiatType.transform] - A function that transforms the data response from the URL/Insight server to return the float conversion value
 * @example
 * {
 *   'usd': {
 *     'url': 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
 *     'transform': function (response) {
 *       if (response && response.bitcoin && response.bitcoin.usd) {
 *         return response.bitcoin.usd
 *       }
 *     }
 *   }
 * }
 */

const DEFAULT_TRANSFORM_FUNCTION = function (response) { return response }

const aliases = {
  bitcoin: 'btc',
  litecoin: 'ltc',
  raven: 'rvn'
}

/** Calculate Exchange rates for Cryptocurrencies */
class Exchange {
  /**
   * Create a new Exchange Rate checker
   * ##### Example
   * ```
   * import Exchange from 'oip-exchange-rate';
   *
   * let exchange = new Exchange();
   * ```
   * @param  {CoinObject} [coins] - Object containing CoinsObjects
   */
  constructor (coins) {
    if (coins && typeof coins === 'object') {
      // If we are defined, attempt to merge
      this.coins = Object.assign({}, defaultCoins, coins)
    } else {
      this.coins = defaultCoins
    }

    this.explorers = {}
  }

  /**
   * @param  {string} coin - The string coin name (ex. "bitcoin")
   * @param  {string} fiat - The string fiat (ex. "usd")
   * @return {Promise<number>} Returns a Promise that will resolve to the number value of the exchange rate
   * @example <caption>Get the Exchange rate for USD per Bitcoin</caption>
   * import Exchange from 'oip-exchange-rate';
   *
   * let exchange = new Exchange();
   *
   * exchange.getExchangeRate("bitcoin", "usd").then((rate) => {
   *   console.log(rate);
   * })
   */
  async getExchangeRate (coin, fiat) {
    let matchedTransform = DEFAULT_TRANSFORM_FUNCTION

    if (coin === fiat) {
      return 1
    }

    for (const c in this.coins) {
      if (!Object.prototype.hasOwnProperty.call(this.coins, c)) continue
      if (c === coin || coin === aliases[c]) {
        for (const fiatType in this.coins[c]) {
          if (!Object.prototype.hasOwnProperty.call(this.coins[c], fiatType)) continue
          if (fiatType === fiat) {
            if (!this.explorers[c]) { this.explorers[c] = {} }

            if (!this.explorers[c][fiatType]) {
              if (this.coins[c][fiatType].insight) {
                this.explorers[c][fiatType] = new Insight(this.coins[c][fiatType].insight)
              } else if (this.coins[c][fiatType].url) {
                this.explorers[c][fiatType] = new URLExplorer(this.coins[c][fiatType].url, this.coins[c][fiatType].transform)
              }
            }

            if (this.explorers[c][fiatType]) {
              matchedTransform = this.coins[c][fiatType].transform

              const info = await this.explorers[c][fiatType].getExchangeRate()
              let rate = info

              if (this.coins[c][fiatType].transform) {
                rate = matchedTransform(info)
              }

              return rate
            }
          }
        }
      }
    }
  }
}

module.exports = Exchange
