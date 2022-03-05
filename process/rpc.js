const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const exec = require('child_process').execSync

// block height
const getRpcHeight = (async (coin) => {
	let cmd = ``
	switch (coin){
		case "eth" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' ${cfg.EXTERN_RPC_URL} | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "polygon" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' ${cfg.EXTERN_RPC_URL} | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "fantom" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' ${cfg.EXTERN_RPC_URL} | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "moonbeam" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' ${cfg.EXTERN_RPC_URL} | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "avax" :
			cmd = `height=$(curl --location --request POST '${cfg.EXTERN_RPC_URL}' --header 'Content-Type: application/json' --data-raw '{ "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1}' | jq .result | tr -d '"') && printf '%d\n' $height`
			break			
	}
	let res = await exec(cmd)
	let blockHeight = parseInt(res.toString())
	return blockHeight
})

//convert object to array
const getArrayFromJsonObject = ((json) => {
	let arr = []
	
	for(item in json){
		arr[item] = json[item]
	}
	return arr
})

module.exports = {
	getRpcHeight : getRpcHeight
} 