const google = require('googleapis').google
const customSearch = google.customsearch('v1')
const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    console.log('> [image-robot] Starting...')
    const content = state.load()

    await fetchImagesOfAllSentences(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          let query
    
          if (sentenceIndex === 0) {
            query = `${content.searchTerm}`
          } else {
            query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
          }
    
          console.log(`> [image-robot] Querying Google Images with: "${query}"`)
    
          content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
          content.sentences[sentenceIndex].googleSearchQuery = query
        }
      }
    
      async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
          auth: googleSearchCredentials.apiKey,
          cx: googleSearchCredentials.searchEngineId,
          lr: 'lang_pt',
          q: query,
          searchType: 'image',
        //   searchType: 'SEARCH_TYPE_UNDEFINED',
          num: 2
        })
        if(!response.data.items) {
            return
        }
        const imagesUrl = response.data.items.map((item) => {
          return item.link
        })
    
        return imagesUrl
      }

}

module.exports = robot
