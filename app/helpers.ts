// lib/encounters.js

import fs from 'node:fs'
import path from 'node:path'
import { load } from 'js-yaml'
import type { EncountersD } from '@/types/encounters'

export function getEncounters() {
  const filePath = path.join(process.cwd(), 'data', 'encounters.yaml')
  const rawYaml = fs.readFileSync(filePath, 'utf8')
  return load(rawYaml) as EncountersD
}
