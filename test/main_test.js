//NOTE: Since all other functions created Discord Embeds, I manually tested those functions in Discord.
const expect = require('chai').expect;

describe('createSentence', function () {
  var createSentence = require('../jishoBot.js').createSentence;

  it('should create a string from the given array', function() {
    expect(createSentence(["jp", "Hello,", "how", "are", "you?"])).to.be.a('string');
  });

  it('should correctly create a sentence from the given array', function() {
    expect(createSentence(["en", "Hello,", "how", "are", "you?"])).to.deep.equal('Hello, how are you?');
  });

  it('should correctly create a single word from the given array', function() {
    expect(createSentence(["radio"], true)).to.deep.equal('radio');
  });

  it('should correctly create a compound word from the given array', function() {
    expect(createSentence(["polar", "bear"], true)).to.deep.equal('polar bear');
  });

});
