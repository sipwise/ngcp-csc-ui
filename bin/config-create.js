import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// In ES modules, __dirname is not available, so we create it from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePathTemplate = path.resolve(path.join(__dirname, '..', 'src', 'config', 'app.template.root.js'))
const filePathConfig = path.resolve(path.join(__dirname, '..', 'src', 'config', 'app.js'))
const template = fs.readFileSync(filePathTemplate, 'utf8')
const rendered = template.split('{{host}}').join(process.argv[2])
fs.writeFileSync(filePathConfig, rendered)
