// scripts/generate-types.js
import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import * as yaml from 'js-yaml'

const yamlPath = path.join(process.cwd(), 'data', 'encounters.yaml')
const rawYaml = fs.readFileSync(yamlPath, 'utf8')
const data = yaml.load(rawYaml)

// Convert to JSON
const json = JSON.stringify(data, null, 2)
fs.writeFileSync(path.join(process.cwd(), 'data', 'encounters.json'), json)

// Generate types from JSON
exec(
  'pnx quicktype data/encounters.json -o types/encounters.d.ts --just-types',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }
    console.log('Types generated successfully')
  }
)
