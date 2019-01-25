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

  if (receivedMessage.content.startsWith("!")) {
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
}
//////////////Edwin's code///////////////////////////

// creates a sentence (or word) from given array. Used in translateMsg and defineWord
function createSentence(arr, isWord = false) {
  let sentence = ""
  if (!isWord) { //this is really just checking the first arg to see if it's equal to "jp"/"en"
    arr.shift();
  }
  arr.forEach((word) => {
    sentence += " " + word
  })
  return sentence
}

//translates the given message to either jp -> en or en -> jp given inputs and outputs it in Discord
function translateMsg(arg, msg) {
  let target = arg[0] //target language is the first argument
  let sentence = ""

  if (arg[0] === 'jp') { // if user wants to translate to Japanese
    target = 'ja'
    sentence = createSentence(arg)
  } else if (arg[0] === 'en') { //translate to English
    target = arg[0]
    sentence = createSentence(arg)
  } else { //if no input, translate to English by default.
    //However, this can be made more flexible so you can have it output other languages if the first arg is different
    target = 'en'
    sentence = createSentence(arg, true)
  }

  //Use Google's API
  translate
    .translate(sentence, target)
    .then(results => {
      const translation = results[0];
      msg.reply(translation)
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

//Searches English or Japanese word on Jisho.org
function defineWord(arg, msg) {
  let word = createSentence(arg, true)
  let encoded = encodeURIComponent(word) //Since we may send Asian characters, we must encode it!

  if (arg.length > 2) {
    msg.reply(encoded)
  }

  try {
    request({ url: `https://jisho.org/api/v1/search/words?keyword=${encoded}`, json: true }, function(err, res, json) {
      if (err) {
        msg.reply(err)
      }

      else if (json.data.length === 0) {
        msg.reply('Please make sure you entered a valid word!')
      } else {
        msg.reply(`definition: ${json.data[0].senses[0].english_definitions[0]}, reading: ${json.data[0].japanese[0].reading}, kanji: ${json.data[0].japanese[0].word}`)
      }
    });
  } catch {
    msg.reply('There was an error! The Jisho server may be down, or your link to the dictionary for your BOT is incorect')
  }
}

// log into Discord
client.login(keys.botSecretToken)
