var Explorer = require("../lib");

test("Can get exchange rate for coin: btc | fiat: usd", (done) => {
	var e = new Explorer();
	e.getExchangeRate("btc", "usd").then((rate) => {
		expect(rate).toBeGreaterThan(0)
		done()
	})
})

test("Can get exchange rate for coin: bitcoin | fiat: usd", (done) => {
	var e = new Explorer();
	e.getExchangeRate("bitcoin", "usd").then((rate) => {
		expect(rate).toBeGreaterThan(0)
		done()
	})
})

test("Can get exchange rate for coin: ltc | fiat: usd", (done) => {
	var e = new Explorer();
	e.getExchangeRate("ltc", "usd").then((rate) => {
		expect(rate).toBeGreaterThan(0)
		done()
	})
})

test("Can get exchange rate for coin: litecoin | fiat: usd", (done) => {
	var e = new Explorer();
	e.getExchangeRate("litecoin", "usd").then((rate) => {
		expect(rate).toBeGreaterThan(0)
		done()
	})
})

test("Can get exchange rate for coin: flo | fiat: usd", (done) => {
	var e = new Explorer();
	e.getExchangeRate("flo", "usd").then((rate) => {
		expect(rate).toBeGreaterThan(0)
		done()
	})
})