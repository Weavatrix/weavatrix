#!/usr/bin/env node
// Release-boundary benchmark for installed npm packages, not source entry points.
import {parseArguments, printHelp, validateOptions} from './npm-mcp-benchmark/options.mjs'
import {runBenchmark} from './npm-mcp-benchmark/runner.mjs'

const options = parseArguments(process.argv.slice(2))
if (options.help) {
    printHelp()
} else {
    validateOptions(options)
    await runBenchmark(options)
}
