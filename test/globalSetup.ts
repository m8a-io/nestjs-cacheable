import { execSync } from 'child_process'

export default () => {
  try {
    const output = execSync('redis-cli ping', { encoding: 'utf-8' })
    if (output.trim() !== 'PONG') {
      throw new Error('Redis server did not respond with PONG.')
    }
  } catch (error) {
    console.error(
      '\n\nCould not connect to Redis. Please ensure Redis is running before executing the e2e tests.\n',
    )
    process.exit(1)
  }
}
