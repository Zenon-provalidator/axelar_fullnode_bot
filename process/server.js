const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const exec = require('child_process').execSync
const logger = require('./logger').log4js


//*********daemon ***********
// start
const startDaemon = (async () => {
        let cmd = cfg.START_DAEMON_CMD
        let res = await exec(cmd)
        return res.toString()
})
// stop
const stopDaemon = (async () => {
		let cmd = cfg.STOP_DAEMON_CMD
        let res = await exec(cmd)
        return res.toString()
})
// restart
const restartDaemon = (async () => {
		let cmd = cfg.RESTART_DAEMON_CMD
        let res = await exec(cmd)
        return res.toString()
})

// *********server check**********
// memory
const getMemoryUsage = (async () => {
	let cmd1 = `free -m | tail -n 2| head -n 1 | awk '{print $2}'`
	let cmd2 = `free -m | tail -n 2| head -n 1 | awk '{print $3}'`
	let total = await exec(cmd1)	
	let used = await exec(cmd2)
	let memoryUsage = parseFloat((used / total) * 100).toFixed(2)
	return memoryUsage
})

// cpu
const getCpuUsage = (async () => {
	let cmd = `grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100/($2+$4+$5)} END {print usage}'`
	let res = await exec(cmd)
	let cpuUsage = parseFloat(res.toString()).toFixed(2)
	return cpuUsage
})

// disk
const getDiskUsage = (async () => {
	let cmd = `df -h | grep ${cfg.PROJECT_DISK_NAME} | wc -l`
	let res = await exec(cmd)
	let isVg = parseInt(res.toString()) > 0 ? true : false
			
	if(isVg){
		let cmd = `df -h | grep ${cfg.PROJECT_DISK_NAME} | awk '{print $5}' | tr -d '%'`
//		logger.info(`cmd : ${cmd}`)
		let res = await exec(cmd)
		let diskUsage = parseFloat(res.toString()).toFixed(2)
		return diskUsage
	} else{
		let cmd = `df -h | head -n 4 | tail -n 1 | awk '{print $5}' | tr -d '%'`
		let res = await exec(cmd)
//		logger.info(`cmd : ${cmd}`)
		let diskUsage = parseFloat(res.toString()).toFixed(2)
		return diskUsage
	}
})

// *********project check**********
// project daemon status
const getDeamonStatus = (async () => {
	let cmd = `ps -ef | grep ${cfg.PROJECT_DAEMON_NAME} | grep -v 'grep' | wc -l`
	let res = await exec(cmd)
	let status = parseInt(res.toString()) > 0 ? true : false
	return status
})

// dial port check
const checkDialPort = (async () => {
	let cmd = `netstat -lntp | grep :${cfg.PROJECT_DIAL_PORT} | wc -l`
	let res = await exec(cmd)
	let count = parseInt(res.toString())	
	return count > 0 ? true : false
})

// block height
const getBlockHeight = (async (coin) => {
	let cmd = ``
	switch (coin){
		case "eth" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' localhost:8545 | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "polygon" :
			cmd = `curl  localhost:8545 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0", "id":1, "method":"bor_getSnapshot", "params":[]}' | jq .result.number`
			break
		case "fantom" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' localhost:18545 | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "moonbeam" :
			cmd = `height=$(curl -H "Content-Type: application/json" -d '{"id":1, "jsonrpc":"2.0", "method": "eth_blockNumber", "params":[]}' localhost:9933 | jq .result | tr -d '"') && printf '%d\n' $height`
			break
		case "avax" :
			cmd = `height=$(curl --location --request POST 'http://localhost:9650/ext/bc/C/rpc' --header 'Content-Type: application/json' --data-raw '{ "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1}' | jq .result | tr -d '"') && printf '%d\n' $height`
			break			
	}
	let res = await exec(cmd)
	let blockHeight = parseInt(res.toString())
	return blockHeight
})

module.exports = {
	startDaemon : startDaemon,
	stopDaemon : stopDaemon,
	restartDaemon : restartDaemon,
	getMemoryUsage : getMemoryUsage,
	getCpuUsage : getCpuUsage,
	getDiskUsage : getDiskUsage,
	getBlockHeight : getBlockHeight,
	getDeamonStatus : getDeamonStatus,
	checkDialPort : checkDialPort
}
