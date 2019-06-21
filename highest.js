
const fs = require("fs")
const readline = require("readline")

function info() {
  // uncomment this to get debugging info:
  console.log.apply(console, arguments)
}


// Handle command line args:

const inputPath = process.argv[2]
const n = process.argv[3]
info("opening", n, "highest scores in", inputPath, "...")
if (!fs.existsSync(inputPath)) {
  process.exit(1)
}


// Open file for streaming:

const stream = fs.createReadStream(inputPath)
stream.setEncoding("utf8");

const rl = readline.createInterface({
  input: stream,
})

rl.on("line", handleLine)
rl.on("close", finish)

function finish() {
  console.log(JSON.stringify(highScores, null, 2))
}


// Handle newly discovered scores:

const highScores = [] // sorted from lowest score to highest

function addScore(score, id) {
  const outOfSpace = highScores.length == n

  if (outOfSpace && score < highScores[0].score) {
    return
  }

  if (outOfSpace) {
    highScores.shift()
  }

  highScores.push({
    score: score,
    id: id,
  })

  highScores.sort(byScore)

  info("\n"+id+" SCORED "+score+"\n")
}

function byScore(a, b) {
  return a.score - b.score
}



// Parse chunks of text:

function handleLine(line) {
  let score
  let id

  const whitespaceMatch = line.match(/^\s*/)
  if (whitespaceMatch[0].length == line.length) {
    info(" --- only whitespace left")
    return
  }
  
  const scoreMatch = line.match(/^\s*([0-9]+): /)

  score = parseInt(scoreMatch[1])
  const matchedLength = scoreMatch[0].length
  const remainder = line.slice(matchedLength)

  info(" --- found score "+score+", "+remainder.length+" left in line")

  const object = JSON.parse(remainder)

  if (typeof object.id != "string") {
    process.exit(2)
  }

  addScore(score, object.id)
}

