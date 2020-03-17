import axios from 'axios'

module.exports =
  class URLExplorer {
    constructor (url) {
      this.url = url
    }

    getExchangeRate () {
      return new Promise((resolve, reject) => {
        axios.get(this.url).then((response) => {
          resolve(response.data)
        })
      })
    }
  }
