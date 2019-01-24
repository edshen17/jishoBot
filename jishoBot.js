const Discord = require('discord.js')
const client = new Discord.Client()

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate');
// Your Google Cloud Platform project ID
const projectId = '';
// Instantiates a client
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

function processCommand(receivedMessage) {
  let fullCommand = receivedMessage.content.substr(1) // Remove the leading exclamation mark
  let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
  let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
  let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

  if (primaryCommand == "translate") {
    translateMsg(receivedMessage)
  }
}
//////////////Edwin's CODE///////////////////////////

//translates the given message to either jp -> en or en -> jp given inputs and outputs it in Discord
function translateMsg(msg) {
  let target = 'en';
  let text = msg.content

  if (text.includes('jp')) {
     target = 'ja'
    // text = text.substr(13)
    text = text.split('jp')[1]
  }

   else if (text.includes('en')) {
  //   text = text.substr(13)
  text = text.split('en')[1]
  }

  else {
    text = text.split('translate')
  }

    translate
      .translate(text, target)
      .then(results => {
        const translation = results[0];
        msg.reply(translation)
      })
      .catch(err => {
        console.error('ERROR:', err);
      });

}


bot_secret_token = ""

client.login(bot_secret_token)
