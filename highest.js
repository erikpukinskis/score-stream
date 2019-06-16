
const fs = require("fs")

const inputPath = process.argv[2]
const n = process.argv[3]
console.log("opening", n, "highest scores in", inputPath, "...")

const stream = fs.createReadStream(inputPath)
stream.setEncoding('utf8');

stream.on('data', (chunk) => {
  console.log("chunk!")
})
