import { Insight } from 'insight-explorer'

import URLExplorer from './URLExplorer.js'

const default_coins = {
	bitcoin: {
		usd: {
			insight: "https://insight.bitpay.com/api",
			transform: function(response){
				if (response && response.data && response.data.bitstamp){
					return response.data.bitstamp
				}

				return
			}
		}
	},
	litecoin: {
		usd: {
			url: "https://api.coinmarketcap.com/v1/ticker/litecoin/",
			transform: function(response){
				if (response && response[0] && response[0].price_usd){
					return parseFloat(response[0].price_usd)
				}

				return
			}
		}
	},
	flo: {
		usd: {
			insight: "https://livenet.flocha.in/api",
			transform: function(response){
				if (response && response.data && response.data.bitstamp){
					return response.data.bitstamp
				}

				return
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
 * 	'bitcoin': {
 * 		'usd': {
 * 			'url': "https://api.coinmarketcap.com/v2/ticker/1/",
 * 			'transform': function(data){
 * 				if (data && data.data && data.data.quotes && data.data.quotes.USD && data.data.quotes.USD.price)
 * 					return data.data.quotes.USD.price
 *
 * 				return
 * 			}
 * 		}
 * 	}
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
 * 	'usd': {
 * 		'url': "https://api.coinmarketcap.com/v2/ticker/1/",
 * 		'transform': function(data){
 * 			if (data && data.data && data.data.quotes && data.data.quotes.USD && data.data.quotes.USD.price)
 * 				return data.data.quotes.USD.price
 *
 * 			return
 * 		}
 * 	}
 * }
 */

const DEFAULT_TRANSFORM_FUNCTION = function(response){ return response }

const aliases = {
	bitcoin: "btc",
	litecoin: "ltc"
}

/** Calculate Exchange rates for Cryptocurrencies */
class Exchange {
	/**
	 * Create a new Exchange Rate checker
	 * ##### Example
	 * ```
	 * import Exchange from 'oip-exchange-rate';
	 * 
	 * var exchange = new Exchange();
	 * ```
	 * @param  {CoinObject} coins - Object containing CoinsObjects
	 */
	constructor(coins){
		if (coins && typeof coins === "object") {
			// If we are defined, attempt to merge
			this.coins = Object.assign({}, default_coins, coins);
		} else {
			this.coins = default_coins
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
	 * var exchange = new Exchange();
	 *
	 * exchange.getExchangeRate("bitcoin", "usd").then((rate) => {
	 * 	console.log(rate);
	 * })
	 */
	async getExchangeRate(coin, fiat){
		var matchedTransform = DEFAULT_TRANSFORM_FUNCTION;

		if (coin === fiat){
			return 1
		}

		for (var c in this.coins){
			if (c === coin || coin === aliases[c]){
				for (var fiat_type in this.coins[c]){
					if (fiat_type === fiat){
						if (!this.explorers[c])
							this.explorers[c] = {}

						if (!this.explorers[c][fiat_type]){
							if (this.coins[c][fiat_type].insight){
								this.explorers[c][fiat_type] = new Insight(this.coins[c][fiat_type].insight)
							} else if (this.coins[c][fiat_type].url) {
								this.explorers[c][fiat_type] = new URLExplorer(this.coins[c][fiat_type].url, this.coins[c][fiat_type].transform)
							}
						}

						if (this.explorers[c][fiat_type]){
							matchedTransform = this.coins[c][fiat_type].transform;
							
							let info = await this.explorers[c][fiat_type].getExchangeRate()
							let rate = info

							if (this.coins[c][fiat_type].transform){
								rate = matchedTransform(info);
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