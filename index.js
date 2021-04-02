const robots = {
    state: require('./robots/state.js'),
    // input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    image: require('./robots/images.js')
  }
  
  async function start() {
    // await robots.input()
    await robots.text()
    await robots.image()
    
    const content = robots.state.load()
    console.dir(content, { depth: null })
  }
  
  start()