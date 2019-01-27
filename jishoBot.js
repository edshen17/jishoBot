//imports
const Discord = require('discord.js')
const client = new Discord.Client()
const keys = require('./keys.json')
const request = require('request')
const { Translate } = require('@google-cloud/translate')

//For Google Translate
const projectId = keys.googleProjectID
const translate = new Translate({
  projectId: projectId,
});

// Prevents bot from responding to its own messages and spamming the chat
client.on('message', (receivedMessage) => {
  if (receivedMessage.author == client.user) {
    return
  }

  if (receivedMessage.content.startsWith("!") || receivedMessage.content.startsWith(".")) {
    processCommand(receivedMessage)
  }
})

//Branches off the commands
function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  if (primaryCommand === 'translate') {
    translateMsg(arguments, receivedMessage)
  } else if (primaryCommand === "define") {
    defineWord(arguments, receivedMessage)
  }

  else if (primaryCommand === "help") {
    helpMsg(arguments, receivedMessage)
  }
}
//////////////Edwin's code///////////////////////////

// creates a sentence (or word) from given array. Used in translateMsg and defineWord
function createSentence(arr, isWord = false) {
  let sentence = ""
  if (!isWord) { //this is really just checking the first arg to see if it's equal to "jp"/"en"
    arr.shift(); // remove jp/en from the sentence
  }
  arr.forEach((word) => {
    sentence.length === 0 ? sentence += word : sentence += " " + word
  })
  return sentence
}

//translates the given message to either jp -> en or en -> jp given inputs and outputs it in Discord
function translateMsg(arg, msg) {
  let target = arg[0] //target language is the first argument
  let sentence = ''
  let footerText = ''
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

  //Use Google's API
  translate
    .translate(sentence, target)
    .then(results => {
      const translation = results[0]
      msg.channel.send({
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

// Embeds given data from jisho.org and makes it look nice in Discord
function EmbedJisho(msg, word, encoded, json) {
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
  msg.channel.send({
      "embed": {
        "title": `Link to ${word} on Jisho.org`,
        "url": `https://jisho.org/search/${encoded}`,
        "color": 2273161,
        "fields": [{
            "name": "Reading(s):",
            "value": jpWord //if the word is a kanji (not a hiragana/katakana word)
              ? `${jpWord} (${jpReading})` //output kanji and reading
              : `${jpReading}` //else, output only the reading
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

//Searches English or Japanese word on Jisho.org
function defineWord(arg, msg) {
  let word = createSentence(arg, true)
  let encoded = encodeURIComponent(word) //Since we may send Asian characters, we must encode it!
  let link = `https://jisho.org/api/v1/search/words?keyword=${encoded}`
  try {
    request({ url: link, json: true }, function(err, res, json) {
      if (err) {
        msg.reply(err)
      } else if (json.data.length === 0) {
        msg.reply('Please make sure you entered a valid word!')
      } else {
        EmbedJisho(msg, word, encoded, json);
      }
    });
  } catch {
    msg.reply('There was an error! The Jisho server may be down, or your link to the dictionary for your BOT is incorect')
  }
}

//Informs user how to use the BOT's commands
function helpMsg(arg, msg) {
  if (arg[0] === 'translate') {
    msg.channel.send({
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
  }
  else if (arg[0] === 'define') {
    msg.channel.send({
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
  }

  else {
    msg.channel.send({
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
client.login(keys.botSecretToken)
