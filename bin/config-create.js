
const path = require('path')
const fs = require('fs')

const filePathTemplate = path.resolve(__dirname + '/../src/config/app.template.root.js')
const filePathConfig = path.resolve(__dirname + '/../src/config/app.js')
const template = fs.readFileSync(filePathTemplate, 'utf8')
const rendered = template.split('{{host}}').join(process.argv[2])
fs.writeFileSync(filePathConfig, rendered)
