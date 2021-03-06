//Imports
const Discord = require('discord.js')
const client = new Discord.Client()
const config = require('./config.json')
const request = require('request')
const { Translate } = require('@google-cloud/translate')

//For Google Translate
const projectId = config.googleProjectID
const translate = new Translate({
  projectId: projectId,
});

//Prevents bot from responding to its own messages and spamming the chat
client.on('message', (client) => {
  if (client.author == client.user) {
    return
  }

  if (client.content.startsWith("!") || client.content.startsWith(".")) {
    processCommand(client)
  }
})

/**
 * processCommand - Branches off the commands (!translate, !define, !help)
 *
 * @param  {Object} client Discord Client Object
 * @return {null}          Discord Embed
 */
function processCommand(client) {
  let fullCommand = client.content.substr(1) // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  if (primaryCommand === 'translate' || primaryCommand === 'trans') {
    translateMsg(arguments, client)
  } else if (primaryCommand === "define" || primaryCommand === "def") {
    defineWord(arguments, client)
  } else if (primaryCommand === "help") {
    helpMsg(arguments, client)
  }
}

/**
 * errorMsg - Embeds the given error message in Discord
 *
 * @param  {Object} client Discord Client Object
 * @param  {string} err    Given error message
 * @return {null}          Discord Embed
 */

function errorMsg(client, err) {
  client.channel.send({

    "embed": {
      "color": 16312092,
      "footer": {
        "text": "再試行してください"
      },

      "fields": [{
        "name": "Error:",
        "value": err
      }]
    }
  })
}


/**
 * createSentence - creates a sentence (or word) from given argument array. Used in translateMsg and defineWord
 *
 * @param  {array}   arr             Arguments from user (separated by " ")
 * @param  {boolean} isWord          Is the given array a sentence or a word? Default value is false.
 * @return {string}                  User sentence/word to be defined or translated
 */

function createSentence(arr, isWord = false) {
  let sentence = ""
  if (!isWord) { //this is really just checking the first arg to see if it's equal to "jp"/"en". If they are, then it's a sentence
    arr.shift(); // remove jp/en from the sentence
  }
  arr.forEach((word) => {
    sentence.length === 0 ? sentence += word : sentence += " " + word
  })
  return sentence
}

/**
 * googleTranslate - Use Google's API and embed it in Discord
 *
 * @param  {string} sentence   Given sentence to translate
 * @param  {string} target     Target translation language
 * @param  {Object} client     Discord Client Object
 * @param  {string} footerText Footer text describing input and output languages
 * @return {null}              Discord Embed
 */

function googleTranslate(sentence, target, client, footerText) {
  translate
    .translate(sentence, target)
    .then(results => {
      const translation = results[0]
      client.channel.send({
        "embed": {
          "color": 4886754,
          "footer": {
            "text": footerText
          },

          "fields": [{
            "name": "Translation:",
            "value": translation
          }]
        }
      })
    })
    .catch(err => {
      console.error('ERROR:', err)
    });
}

/**
 * translateMsg - Prepares and formats the given inputs to be translated by Google Translate
 *
 * @param  {array}  arg     Array of arguments
 * @param  {Object} client  Discord Client Object
 * @return {null}           Discord Embed
 */
function translateMsg(arg, client) {
  let target = arg[0] //target language is the first argument
  let sentence = ''
  let footerText = ''

  if (arg.length === 0) { //if no args are entered / only whitespace for the sentence
    errorMsg(client, "Please enter valid inputs! Please refer to the !help command for more information")
  } else {
    if (arg[0] === 'jp') { // if user wants to translate to Japanese
      target = 'ja'
      sentence = createSentence(arg)
      footerText = `English -> Japanese`
    } else if (arg[0] === 'en') { //translate to English
      target = arg[0]
      sentence = createSentence(arg)
      footerText = 'Japanese -> English'
    } else { //if no input, translate to English by default.
      //However, this can be made more flexible so you can have it output other languages if the first arg is different
      target = 'en'
      sentence = createSentence(arg, true)
      footerText = 'Japanese -> English'
    }

    googleTranslate(sentence, target, client, footerText)


  }



}

/**
 * EmbedJisho - Embeds given data from jisho.org and makes it look nice in Discord
 *
 * @param  {Object} client  Discord Client Object
 * @param  {string} word    Word to be defined
 * @param  {type}   encoded Encoded URI of word
 * @param  {type}   json    JSON from jisho.org
 * @return {type}           Discord Embed
 */

function EmbedJisho(client, word, encoded, json) {
  let definitions = ''
  let tags = ''
  const wordTag = json.data[0].tags
  const isCommon = json.data[0].is_common
  const jpWord = json.data[0].japanese[0].word
  const jpReading = json.data[0].japanese[0].reading

  json.data[0].senses.forEach((word, index) => { //gets all definitions of the first word and stores them
    definitions += `\r ${index + 1}.  ${word.english_definitions[0]}`
  })

  if (wordTag.length === 1 && isCommon) { //if has Wanikani tag and is a common tag
    tags += `${wordTag[0]}, common word`
  } else if (isCommon) { //just a common tag
    tags += `common word`
  } else if (wordTag.length > 0) { //just a Wanikani tag
    tags += `${wordTag[0]}`
  } else {
    tags += 'No tags'
  }

  //Embeds the data we get from Jisho
  client.channel.send({
    "embed": {
      "title": `Link to ${word} on Jisho.org`,
      "url": `https://jisho.org/search/${encoded}`,
      "color": 2273161,
      "fields": [{
          "name": "Reading(s):",
          "value": jpWord //if the word is a kanji (not a hiragana/katakana word)
            ?
            `${jpWord} (${jpReading})` //output kanji and reading
            :
            `${jpReading}` //else, output only the reading
        },
        {
          "name": "Definition(s):",
          "value": `${definitions}`
        },
        {
          "name": "Tag(s):",
          "value": `${tags}`
        }
      ]
    }
  })
}

/**
 * defineWord - Searches English or Japanese word on Jisho.org in either kana/kanji/romaji
 *
 * @param  {array}  arg    Inputed arguments from user
 * @param  {Object} client Discord Client Object
 * @return {null}          Discord Embed
 */

function defineWord(arg, client) {
  let word = createSentence(arg, true)
  let encoded = encodeURIComponent(word) //Since we may send Asian characters, we must encode it!
  let link = `https://jisho.org/api/v1/search/words?keyword=${encoded}`
  try {
    request({ url: link, json: true }, function(err, res, json) {
      if (err) {
        errorMsg(client, err)
      } else if (arg.length === 0) {
        errorMsg(client, 'Please enter valid inputs! Please refer to the !help command for more information')
      } else if (json.data.length === 0) {
        errorMsg(client, 'Please make sure you entered a valid word! Please refer to the !help command for more information')
      } else {
        EmbedJisho(client, word, encoded, json);
      }
    });
  } catch {
    errorMsg(client, 'There was an error! The Jisho server may be down, or your link to the dictionary for your BOT is incorect')
  }
}

/**
 * helpMsg - Informs user how to use the BOT's commands
 *
 * @param  {array}  arg    Inputted arguments from user
 * @param  {Object} client Discord Client Object
 * @return {null}          Discord Embed
 */

function helpMsg(arg, client) {
  if (arg[0] === 'translate') {
    client.channel.send({
      "embed": {
        "color": 13632027,
        "fields": [{
          "name": "!translate",
          "value": `!translate en <Japanese sentence> will output an English translation of the sentence given.
        \r Similarly, !translate jp <English sentence> will output an Japanese translation of the sentence given.
        \r Example: \r !translate en こんにちは (outputs Hello) \r !translate jp Hello (outputs こんにちは)
        `
        }]
      }
    })
  } else if (arg[0] === 'define') {
    client.channel.send({
      "embed": {
        "color": 13632027,
        "fields": [{
          "name": "!define <kana/kanji>",
          "value": `Outputs the first item listed in Jisho of the inputted word.
          Please note that sometimes English words can be accidentally turned into romaji due to how Jisho.org works
          (eg: inputting 'go' can result in 五)
        \r Example:
        \r!define こんにちは (outputs the reading, definition, and tags of こんにちは)`
        }]
      }
    })
  } else {
    client.channel.send({
      "embed": {
        "color": 13632027,
        "fields": [{
            "name": "!translate",
            "value": `!translate en <Japanese sentence> will output an English translation of the sentence given.
        \r Similarly, !translate jp <English sentence> will output an Japanese translation of the sentence given.
        \r Example: \r !translate en こんにちは (outputs Hello) \r !translate jp Hello (outputs こんにちは)
        `
          },
          {
            "name": "!define <kana/kanji>",
            "value": `Outputs the first item listed in Jisho of the inputted word.
          Please note that sometimes English words can be accidentally turned into romaji due to how Jisho.org works
          (eg: inputting 'go' can result in 五)
        \r Example:
        \r !define こんにちは (outputs the reading, definition, and tags of こんにちは)`
          }
        ]
      }
    })
  }
}


// log into Discord
client.login(config.botSecretToken)

module.exports.createSentence = createSentence;
