'use strict';

var AdmZip = require('adm-zip'),
	fs = require("fs"),
	xml2js = require("xml2js"),
	chalk = require('chalk'),
	path = require('path');
	
	const {
	  convertAll
	} = require('bpmn-to-image');

var iflowInfo = {
	name: null,
	diagrams: []
}
var debug = false

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

function dbg(msg, indexer){
	if (debug){
		if (indexer === undefined){
			console.log(chalk.yellow(msg))
		} else {
			console.log(chalk.yellow(chalk.bold(`${indexer}: `) + msg))
		}
	}
}

function log(msg){
	console.log(msg)
}

function err(msg){
	console.error(chalk.red(msg))
}

function findNode(data, name){
	var objs = []
	Object.entries(data).forEach(([key, value]) => {
		if (key == name){
			objs.push(value)
			return objs
		}
		if (typeof value == "object"){
			var tmp = findNode(value, name)
			if (tmp.length > 0){
				objs = [...objs, ...tmp]
			}
		}
	});
	return objs
}

async function renderDiagram(diagPath, diagName, targetFormats, scaleFactor, outDir){
	await convertAll([
	{
		input: diagPath,
		outputs: targetFormats.map(tf => path.join(outDir,`${diagName}.${tf}`))
	  }
	], {
	  minDimensions: { width: 400, height: 300 },
	  title: false,
	  footer: false,
	  deviceScaleFactor: scaleFactor
	});
	log(chalk.greenBright("Rendered successfully"))
	fs.unlinkSync(diagPath)
}


async function plotIFlow(iFlowZipFile, targetFormats, scaleFactor, outputDir, debugFlag){	
	debug = !(debugFlag === undefined) && debugFlag != false
	dbg(debugFlag, "$debugFlag")
	dbg(debug, "$debug")
	try {
		//Unzip iflow
		log("Unzipping IFlow...")
		const flowFile = new AdmZip(iFlowZipFile);
				
		//Read .project file
		log("Parsing .project file...")
		var pFileContent = flowFile.readAsText(flowFile.getEntry(".project"))	
		xml2js.parseString(pFileContent, function(err, result) {
			if (err) err(err)
			iflowInfo.name = result.projectDescription.name[0]
			log(`Found IFlow with name: ${iflowInfo.name}`)
		})
		
		//Read diagrams/BPMN-xmls
		log("Reading BPMN diagram file(s)...")
		var diagFiles = flowFile.getEntries().filter(entry => entry.entryName.startsWith("src/main/resources/scenarioflows/integrationflow"))
		dbg(diagFiles.length, "Number .iflw-diagrams")
		if (diagFiles.length < 1) throw "IFlow doesn't contain any diagrams!"
		
		diagFiles.forEach(diagEntry => {
			iflowInfo.diagrams.push({
				name: diagEntry.name.match(/(.*?).iflw$/)[1],
				filename: diagEntry.name,
				content: flowFile.readAsText(diagEntry)
			})
			log(`Found IFlow diagram with name: ${iflowInfo.diagrams.slice(-1)[0].filename}`)
		})
		
		//Patch XMLDocument and render
		log("Patching SAP BPMN diagrams...")	
		iflowInfo.diagrams.forEach(diag => {
			xml2js.parseString(diag.content, function(err, result) {
				if (err) err(err)
				var json = result
				var res = findNode(json, "bpmn2:subProcess")
								
				//Foreach BPMN subprocess...
				res.forEach(sp  => {
					var sid = sp[0].$.id;
					dbg(sid, "Subprocess ID")
					dbg(sp[0].$.name, "Subprocess Name")
					
					//...find the matching BPMN shape via its id...
					var shape = findNode(json, "bpmndi:BPMNShape")[0].find(shape => { 						
						return shape.$.bpmnElement == sid
					})					
					//...and expand shape (=subprocess)
					shape.$['isExpanded'] = true
					dbg(JSON.stringify(shape, null, 2), "Patched shape")
				});

				//Save patched diagram
				var builder = new xml2js.Builder();
				var xml = builder.buildObject(json);

				const tmpDiagName = `${diag.filename}.patched`
				fs.writeFile(tmpDiagName, xml, function(err, data) {
				  if (err) err(err)
				  log("Successfully written patched diagram to file")
				});
				
				log("Start rendering")
				renderDiagram(tmpDiagName, diag.name, targetFormats, scaleFactor, outputDir)
			});
		});
	} catch (ex){
		var msg = ex
		if (ex.message !== undefined) msg = ex.message
		if (debug && ex.stack !== undefined) msg = ex.stack.toString()		
		err(msg)
	}	
}

module.exports = plotIFlow