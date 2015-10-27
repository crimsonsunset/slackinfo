// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var param = require('node-jquery-param');
var rp = require('request-promise');
var _ = require('underscore');
var promise = require('promise');
var cron = require('node-schedule');

// external API
var slackAPI = require('./app/slackAPI')(param,_,rp,promise); // pass our application into our external api


var cors = require('cors')
app.use(cors());

//Change to use different collections in the DB
var collName = "SONGLIST";

var Schema       = mongoose.Schema;
var songSchema   = new Schema({
    artist: String,
    artist_info: Schema.Types.Mixed,
    contributor: String,
    description: String,
    index: String,
    id: String,
    service: String,
    tags: [String],
    text: String,
    thumbnail: String,
    title: String,
    ts: String,
    type: String,
    url: String,
    user: String
});

var songModel = mongoose.model(collName, songSchema);

// configuration ===========================================

// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port

try {
    mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)
}
catch (e) {
    throw "cannot connect to DB!"
}


// get all data/stuff of the body (POST) parameters
//app.use(bodyParser.json()); // parse application/json
//app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
//app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
//
//app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
var routes = require('./app/routes')(app,express,songModel,_, slackAPI,promise); // pass our application into our routes


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);


// start app ===============================================
app.listen(port);
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app;

//var job = cron.scheduleJob('* * * * *', function(){
//    console.log('The answer to life, the universe, and everything!');
//    slackAPI.getExport()
//});
var slackJob = cron.scheduleJob('0 6 * * *', function(){
    console.log('woa its time for ea real slack export');
    slackAPI.getExport()
});

