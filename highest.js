
const fs = require("fs")

function info() {
  // uncomment this to get debugging info:
  // console.log.apply(console, arguments)
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
stream.on("data", handleChunk)
stream.on("end", finish)

function finish() {
  handleChunk("\n") // might be one score left if no newline at the end of the file
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

let state = "started-new-line"
let score
let id
const NEW_LINE_CHAR = 10

function handleChunk(chunk) {

  const whitespaceMatch = chunk.match(/^\s*/)
  if (whitespaceMatch[0].length == chunk.length) {
    if (id) {
      addScore(score, id)
    }
    info(" --- only whitespace left")
    return
  }
  
  if (state == "started-new-line") {
    info(" --- started new line")
    const scoreMatch = chunk.match(/^\s*([0-9]+): /)

    score = parseInt(scoreMatch[1])
    const matchedLength = scoreMatch[0].length
    const remainder = chunk.slice(matchedLength)

    info(" --- "+remainder.length+" left in chunk")

    state = "scanning-for-id"
    handleChunk(remainder)

  } else if (state == "scanning-for-id") {
    info(" --- scanning for id")
    const match = chunk.match(/\n|\"id\":\s*\"([^\"]+)\"/)

    if (match[0].length == 1) {
      process.exit(2)
    } else {
      idMatch = match
    }

    if (idMatch) {
      id = idMatch[1]
      const matchedLength = idMatch[0].length
      const remainder = chunk.slice(matchedLength)

      info(" --- found id "+id+". "+remainder.length+" left in chunk")

      state = "waiting-for-newline"
      handleChunk(remainder)
    }

  } else if (state == "waiting-for-newline") {
    const newlineMatch = chunk.match(/\n/)

    if (!newlineMatch) {
      return
    }

    const matchedLength = newlineMatch.index+1
    const remainder = chunk.slice(newlineMatch.index+1)

    addScore(score, id)
    id = null
    score = null
    state = "started-new-line"
    handleChunk(remainder)
  }

}

