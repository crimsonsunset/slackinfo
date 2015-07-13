/**
 * @author Joe Sangiorgio
 * Node server for Marvel Code Test
 */
var express = require('express');
var app = express();
var request = require('request');
var param = require('node-jquery-param');
var cors = require('cors')
var PORT = 8080

//for development purposes, allow cross-origin requests to this server
app.use(cors());

//URL constants, modify here in case of API change/new key issued
var APIURL = "http://gateway.marvel.com:80/v1/public/characters/";
var COMICS_FETCH_STR = "/comics?";
var PUBLIC_KEY = "c467c874374c4d34ef51b728075fe970";
var PRIVATE_KEY = "a8d3411eb32c46aaba0386c7796e8b81021a1155";


//Register our endpoint, and route the request through it. Per the assignment,
//the comic-centric API call must be made server-side.
app.get('/', function (req, res) {

  console.log('GET received with: ',req)

  ////server requires more information to complete a call. see https://developer.marvel.com/documentation/authorization
  ////for more information
  //var timeStamp = String(Date.now())
  //var hash = md5(timeStamp+PRIVATE_KEY+PUBLIC_KEY)
  //
  //var params = {
  //  apikey: PUBLIC_KEY,
  //  ts: timeStamp,
  //  hash: hash
  //};
  //
  //var characterId = req.param("characterId")
  //delete req.query["characterId"]
  //
  //var fullURL = APIURL + characterId+ COMICS_FETCH_STR+ param(params) +"&"+ param(req.query)
  //
  //console.log(characterId+" and "+param(req.query))
  //
  ////at this point, url has been massaged into the format Marvel API is expecting.
  //request(fullURL, function (error, response, body) {
  //
  //  if (!error && response.statusCode == 200) {
  //    console.log("Success on Server!")
  //    res.send(response.body);
  //  }
  //})

      res.send('response.body');

});

app.post('/', function (req, res) {
  res.send('POST request to the homepage');
  console.log('GET received with: ',req)
  res.send('cool beansz')

});


//message out to the user
console.log("Server started on port "+ PORT)
app.listen(PORT);
