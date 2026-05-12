import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  alias: {
    '~/types': resolve(currentDir, 'types'),
    '~/data': resolve(currentDir, 'data'),
    '~/composables': resolve(currentDir, 'composables'),
    '~/components': resolve(currentDir, 'components'),
  },
})
