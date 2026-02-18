const Express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

var app = Express();
app.use(Express.static(__dirname + '/public'));
app.use(Express.json());

require('dotenv').config()
var favicon = require('serve-favicon');
var path = require('path');
app.use(favicon(path.join(__dirname,'public','images','paraulogic.ico')));
var _ = require('underscore');

const CONNECTION_URL = process.env.CONNECTION_URL;
const DATABASE_NAME = "wordleDB";


// CONNECT MONGODB DATABASE
const port = process.env.PORT || 3000;
var server = app.listen(port, () => {
    console.log('listening at '+port)
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(DATABASE_NAME);
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});

// PART PARAULOGIC -------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

app.post('/getWords', async (request, response) => {

  const lletra = request.body.lletra.toLowerCase();
  const lletres = (request.body.lletres + lletra).toLowerCase();

  let list_words = [];

  db.collection("wordsCatalan")
    .find({})
    .project({_id:0, word:1})
    .toArray(function(err, result) {

      if (err) return response.status(500).json({error: "db error"});

      result.forEach(item => {
        list_words.push(item.word.toLowerCase());
      });

      const poss_words = FilterPossibleWords(lletra, lletres, list_words);

      response.json({ poss_words });
    });
});

function FilterPossibleWords(lletra, lletres, paraules) {

  return paraules
    .filter(word => word.includes(lletra))
    .filter(word => {
      for (let i = 0; i < word.length; i++) {
        if (!lletres.includes(word[i])) return false;
      }
      return true;
    })
    .sort();
}
