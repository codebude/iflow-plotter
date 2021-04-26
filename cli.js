#!/usr/bin/env node
const plotIFlow = require('./index')

require('yargs')
  .scriptName("iflow-plotter")
  .usage('$0 <input file> [optional args]')
  .command('$0 <input file> [optional args]', 'Plot IFlow diagram to file', (yargs) => {
    yargs.option('format', {
      type: 'array',
	  alias: 'f',
	  group: 'Conversion parameters:',
	  //choices: ['pdf','svg','png'],
      default: ['pdf','svg','png'],
      describe: 'Target format(s). One of: pdf,png,svg,bpmn.'
    })
	yargs.option('scale-factor', {
      type: 'number',
	  alias: 's',
	  group: 'Conversion parameters:',
      default: 1.0,
      describe: 'Scale of rendered diagram'
    })
	yargs.option('output-dir', {
      type: 'string',
	  alias: 'o',
	  group: 'Conversion parameters:',
      default: ".",
      describe: 'Output directory'
    })
	yargs.option('debug', {
      type: 'boolean',
	  alias: 'd',
	  group: 'Conversion parameters:',
      describe: 'Raise logging level'
    })
  }, function (argv) {    
	//console.log(argv)
	plotIFlow(argv.inputfile, argv.f, argv.s, argv.o, argv.d)
  })
  .help()
  .argv


