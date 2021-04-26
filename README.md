# iflow-plotter

The iflow-plotter is small commandline application (CLI) that enables you to convert SAP™ CPI (Cloud Integration) zip-files to (BPMN) diagrams. You can choose between multiple output formats (svg, pdf, png).


### How to install?
Simply open your favourite terminal application and type in `npm i iflow-plotter -g`. (If you haven't installed NodeJS, you should do it upfront.)

### How to use
Open a terminal and run the `iflow-plotter` command. The following info (taken from `iflow-plotter --help` shows you how to use the tool.

    iflow-plotter <input file> [optional args]
    
    Plot IFlow diagram to file
    
    Conversion parameters:
      -f, --format        Target format(s). One of: pdf,png,svg,bpmn.
                                              [array] [default: ["pdf","svg","png"]]
      -s, --scale-factor  Scale of rendered diagram            [number] [default: 1]
      -o, --output-dir    Output directory                   [string] [default: "."]
      -d, --debug         Raise logging level                              [boolean]
    
    Options:
          --version  Show version number                                   [boolean]
          --help     Show help                                             [boolean]


### Thanks to...
All package creators of the packages that were used when creating iflow-plotter. Special thanks goes out to the bpmn-js team!