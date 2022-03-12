const cfg = require('dotenv').config({ path: './config' }).parsed //load config file
const logger = require('./process/logger').log4js
const alert = require('./process/alert')
const server = require('./process/server')
const rpc = require('./process/rpc')
const telegramBot = require('./process/telegram_bot')
const CronJob = require('cron').CronJob

// global variable
let memAlertCnt = 0
let cpuAlertCnt = 0
let diskAlertCnt = 0
let botStatusFlag = false
let executeCnt = 0
let blockCheck = [] // block check height array

const botJob = new CronJob(`*/10 * * * * *`, async function () {
	let mem = await server.getMemoryUsage()
	let cpu = await server.getCpuUsage()
	let disk = await server.getDiskUsage()
	let blockHeight = await server.getBlockHeight(cfg.PROJECT_NAME)
	let rpcHeight = await rpc.getRpcHeight(cfg.PROJECT_NAME)
	let checkDialPort = await server.checkDialPort()
	
	telegramBot.setVariables({
		mem : mem,
		cpu : cpu,
		disk : disk,
		blockHeight : blockHeight,
		rpcHeight : rpcHeight
	})
	
	// memory check
	if(mem > parseFloat(cfg.SERVER_ALERT_MEMORY)) {
		if(memAlertCnt == 0){
			alert.sendMSG(`ALERT! Memory usesage is ${mem}% (${cfg.SERVER_ALERT_MEMORY}%)`)
		} 
		
		memAlertCnt = memAlertCnt < cfg.SERVER_ALERT_MEMORY_WAIT ? memAlertCnt + 1 : 0 
//		logger.info(`memAlertCnt : ${memAlertCnt}`)
	}
	
	// cpu check
	if(cpu > parseFloat(cfg.SERVER_ALERT_CPU)) {
		if(cpuAlertCnt == 0){
			alert.sendMSG(`ALERT! Cpu usesage is ${cpu}% (${cfg.SERVER_ALERT_CPU}%)`)
		} 
		
		cpuAlertCnt = cpuAlertCnt < cfg.SERVER_ALERT_CPU_WAIT ? cpuAlertCnt + 1 : 0 
//		logger.info(`cpuAlertCnt : ${cpuAlertCnt}`)
	}
	
	// disk check
	if(disk > parseFloat(cfg.SERVER_ALERT_DISK)) {
		if(diskAlertCnt == 0){
			alert.sendMSG(`ALERT! Disk usesage is ${disk}% (${cfg.SERVER_ALERT_DISK}%)`)
		} 
		
		diskAlertCnt = diskAlertCnt < cfg.SERVER_ALERT_DISK_WAIT ? diskAlertCnt + 1 : 0 
//		logger.info(`diskAlertCnt : ${diskAlertCnt}`)
	}
	
	// block height check
	if(checkDialPort) {
		let heightDiff = rpcHeight-blockHeight
		if(heightDiff > cfg.SERVER_ALERT_BLOCK_ERROR_RANGE){
			alert.sendMSG(`ALERT! Server height is abnormal.\n${cfg.EXTERN_RPC_URL}/status\nExtern=${rpcHeight.toLocaleString()}\nheightDiff=${heightDiff.toLocaleString()}`)			
		}
//		blockCheck[executeCnt] = blockHeight
//		let heightDiff = blockCheck[executeCnt] - blockCheck[executeCnt-1]
//	
//	//	logger.info(`executeCnt:${executeCnt}`)
//	//	logger.info(`blockCheck.length:${blockCheck.length}`)
//	
//		if(blockCheck.length > 1){ //need history
//			if(heightDiff > cfg.SERVER_ALERT_BLOCK_ERROR_RANGE){ // server block height is abnormal
//				//block height smaller than extern block height
//				if(blockCheck[executeCnt] < rpcHeight -1 ){
//					alert.sendMSG(`ALERT! Server height is abnormal.\n${cfg.EXTERN_RPC_URL}/status\nExtern=${rpcHeight.toLocaleString()}\nDiff=${heightDiff.toLocaleString()}\nCurrentblockheight=${blockCheck[executeCnt].toLocaleString()}\nPreblockheight=${blockCheck[executeCnt-1].toLocaleString()}`)
//				}
//			} else {
//				if(blockCheck[executeCnt] === blockCheck[executeCnt-1] === blockCheck[executeCnt-2] === blockCheck[executeCnt-3] === blockCheck[executeCnt-4]){ //chain is stop
//					alert.sendMSG(`ALERT! Maybe chain is down.\n${cfg.EXTERN_RPC_URL}/status\nExtern=${rpcHeight.toLocaleString()}\nDiff=${heightDiff.toLocaleString()}\nCurrentblockheight=${blockCheck[executeCnt].toLocaleString()}\nPreblockheight=${blockCheck[executeCnt-1].toLocaleString()}`)
//				}
//			}
//		}
	} else {
		alert.sendMSG(`ALERT! Dialingport is not opened.`)
	}

		
	//	console.log('====================================')
	//	
	//	console.log(`mem : ${mem}`)
	//	console.log(`cpu : ${cpu}`)
	//	console.log(`disk : ${disk}`)
	//	console.log(`peer : ${peer}`)
	//	console.log(`blockHeight : ${blockHeight}`)
	//	console.log(`rpcHeight : ${rpcHeight}`)
	//	console.log(`checkDialPort : ${checkDialPort}`)
	//	
	//	console.log('====================================\n\n')
		
	executeCnt = executeCnt < 5 ? executeCnt + 1 : 0 //execute count history limit 5   
})//.start()

const botStart = (() => {
	botJob.start()
	botStatusFlag = true
})

const botStop = (() => {
	botJob.stop()
	botStatusFlag = false
})

const botStatus = (() => {
	return botStatusFlag
})

module.exports = {
	botStart : botStart,
	botStop : botStop,
	botStatus : botStatus
}