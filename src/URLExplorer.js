import axios from 'axios'

const DEFAULT_TRANSFORM_FUNCTION = function(response){ return response }

module.exports =
class URLExplorer {
	constructor(url){
		this.url = url
	}
	getExchangeRate(){
		return new Promise ((resolve, reject) => {
			axios.get(this.url).then((response) => {
				resolve(response.data)
			})
		})
	}
}