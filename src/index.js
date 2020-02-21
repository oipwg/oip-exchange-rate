import { Insight } from '@oipwg/insight-explorer'

import URLExplorer from './URLExplorer.js'

const defaultCoins = {
  bitcoin: {
    usd: {
      insight: 'https://insight.bitpay.com/api',
      transform: function (response) {
        if (response && response.data && response.data.bitstamp) {
          return response.data.bitstamp
        }
      }
    }
  },
  litecoin: {
    usd: {
      url: 'https://api.coinmarketcap.com/v1/ticker/litecoin/',
      transform: function (response) {
        if (response && response[0] && response[0].price_usd) {
          return parseFloat(response[0].price_usd)
        }
      }
    }
  },
  flo: {
    usd: {
      insight: 'https://livenet.flocha.in/api',
      transform: function (response) {
        if (response && response.data && response.data.bitstamp) {
          return response.data.bitstamp
        }
      }
    }
  },
  raven: {
    usd: {
      url: 'https://api.coinmarketcap.com/v1/ticker/ravencoin/',
      transform: function (response) {
        if (response && response[0] && response[0].price_usd) {
          return parseFloat(response[0].price_usd)
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
 *       'url': "https://api.coinmarketcap.com/v2/ticker/1/",
 *       'transform': function(data){
 *         if (data && data.data && data.data.quotes && data.data.quotes.USD && data.data.quotes.USD.price)
 *           return data.data.quotes.USD.price
 *
 *         return
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
 *     'url': "https://api.coinmarketcap.com/v2/ticker/1/",
 *     'transform': function(data){
 *       if (data && data.data && data.data.quotes && data.data.quotes.USD && data.data.quotes.USD.price)
 *         return data.data.quotes.USD.price
 *
 *       return
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
