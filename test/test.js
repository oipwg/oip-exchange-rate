/* eslint-env jest */
const Explorer = require('../src')

test('Can get exchange rate for coin: btc | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('btc', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: bitcoin | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('bitcoin', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: ltc | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('ltc', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: litecoin | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('litecoin', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: flo | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('flo', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: raven | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('raven', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})

test('Can get exchange rate for coin: rvn | fiat: usd', (done) => {
  const e = new Explorer()
  e.getExchangeRate('rvn', 'usd').then((rate) => {
    expect(rate).toBeGreaterThan(0)
    done()
  })
})
