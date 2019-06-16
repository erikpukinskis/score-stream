
const fs = require("fs")

const inputPath = process.argv[2]
const n = process.argv[3]
console.log("opening", n, "highest scores in", inputPath, "...")

const stream = fs.createReadStream(inputPath)
stream.setEncoding("utf8");

const NEW_LINE_CHAR = 10
let state = "started-new-line"



stream.on("data", handleChunk)

stream.on("end", () => handleChunk("\n"))

let score
let id

function handleChunk(chunk) {

  const whitespaceMatch = chunk.match(/^\s*/)
  if (whitespaceMatch[0].length == chunk.length) {
    if (id) {
      addScore(score, id)
    }
    console.log(" --- only whitespace left")
    return
  }
  
  if (state == "started-new-line") {
    console.log(" --- started new line")
    const scoreMatch = chunk.match(/^([0-9]+): /)
    if (!scoreMatch) {
      debugger
      throw new Error("Done?")
    }

    score = parseInt(scoreMatch[1])
    const matchedLength = scoreMatch[0].length
    const remainder = chunk.slice(matchedLength)

    console.log(" --- "+remainder.length+" left in chunk")

    state = "scanning-for-id"
    handleChunk(remainder)

  } else if (state == "scanning-for-id") {
    console.log(" --- scanning for id")
    const match = chunk.match(/\n|\"id\":\s*\"([^\"]+)\"/)

    if (match[0].length == 1) {
      throw new Error("Encountered a newline before an id. Not good.")
    } else {
      idMatch = match
    }

    if (idMatch) {
      id = idMatch[1]
      const matchedLength = idMatch[0].length
      const remainder = chunk.slice(matchedLength)

      console.log(" --- found id "+id+". "+remainder.length+" left in chunk")

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


function addScore(score, id) {
  console.log("\n"+id+" SCORED "+score+"\n")
}
