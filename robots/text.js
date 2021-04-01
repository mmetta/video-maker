const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {

    await fetchContentFromWikipedia(content)
    await sanitizeContent(content)
    await breakContentIntoSentences(content)
    limitMaximumSentences(content)

    async function fetchContentFromWikipedia(content) {

        const input = {
            'articleName': content.searchTerm,
            'lang': 'en'
        }

        const wikiClient = algorithmia.client(algorithmiaApiKey)
        const wikiAlgo = wikiClient.algo('web/WikipediaParser/0.1.2')
        const res = await wikiAlgo.pipe(input)
        content.sourceContentOriginal = res.get().content
      }

      async function sanitizeContent(content) {
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)
    
        content.sourceContentSanitized = withoutDatesInParentheses
    
        function removeBlankLinesAndMarkdown(text) {
          const allLines = text.split('\n')
    
          const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
            if (line.trim().length === 0 || line.trim().startsWith('=')) {
              return false
            }
    
            return true
          })
    
          return withoutBlankLinesAndMarkdown.join(' ')
        }
      }

      function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
      }
    
      async function breakContentIntoSentences(content) {
        content.sentences = []
    
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
          content.sentences.push({
            text: sentence,
            keywords: [],
            images: []
          })
        })
      }

      function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
      }

}

module.exports = robot
