# jishoBot
This Discord bot is a tool to help Discord users easily translate or define words from Japanese to English or 
vice versa. It uses Google Translate and jisho.org API. 

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites

* Node.js
* Discord 
* Google Cloud Platform (GCP) account

### Installing
1. ```git clone https://github.com/edshen17/jishoBot.git ```
2. Input your Google Cloud API in config.json
3. Download your API private key from Google and add it to your directory [(more instructions here)](https://cloud.google.com/translate/docs/quickstart-client-libraries#client-libraries-install-nodejs)
4. Start up Command Prompt or Terminal and navigate to this directory: ```cd <clone directory>```
5. Install all the dependences this bot uses by typing: ```npm install ``` 
6. Invite the bot to your server [(more instructions here)](https://stackoverflow.com/questions/37689289/how-to-join-a-server) and input your Discord bot key in config.json

### Using jishoBot!

Once you have the bot up and running, you can type *!translate (or !trans), !define (or !def)* to translate/define words. You can also type *!help* for more instructions.
###### !translate
 ```
 !translate en <Japanese sentence> will output an English translation of the sentence given.
 Similarly, !translate jp <English sentence> will output an Japanese translation of the sentence given.

Example: 
!translate en こんにちは (outputs Hello) 
!translate jp How's today's weather? (outputs 今日の天気はどうですか？)
```
<p align="center">
  <img src="https://user-images.githubusercontent.com/15848507/51932665-9402f380-23cd-11e9-8cb4-8116f857e182.png">
</p>

###### !define
```
!define <kana/kanji>
Outputs the first item listed in Jisho of the inputted word.
Please note that sometimes English words can be accidentally turned into romaji due to how Jisho.org works
(eg: inputting 'go' can result in 五. In such cases, put quotes around the string "go" to get the English word)

Example:
!define kuru (outputs the reading, definition, and tags of 来る)
```
<p align="center">
  <img src="https://user-images.githubusercontent.com/15848507/51932735-bd238400-23cd-11e9-86d7-47e394144779.png">
</p>


## Built With

* [Node.js](https://nodejs.org/en/) - Javascript runtime
* [Request](https://www.npmjs.com/package/request) - HTTP client for node.js

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* Testers on Discord server (special thanks to Akira, Asano, Christopher, Nodar, Trevor, and Yui)


