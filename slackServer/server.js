(function(){
    var express        = require('express');
    var app            = express();
    var mongoose       = require('mongoose');
    var param = require('node-jquery-param');
    var rp = require('request-promise');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var promise = require('promise');
    var restart = require("restartable");


    var cron = require('node-schedule');
    var cors = require('cors')
    app.use(cors());
    var port = process.env.PORT || 8080;
    app.isReady = false;


    //Change to use different collections in the DB
    var collName = "SONGLIST";
    var songSchema   = new mongoose.Schema({
        artist: String,
        artist_info: mongoose.Schema.Types.Mixed,
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
        date: String,
        user: String
    });
    var exportDateCollName = "last-export-date";
    var exportDateSchema   = new mongoose.Schema({
        date: String
    });

    function loadConfig(){
        // config files
        var db = require('./config/db');
        try {
            mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)
        }
        catch (e) {
            throw "cannot connect to DB!"
        }
        app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
    }

    function startServer(){
        app.isReady = true;
        app.listen(port);
        console.log('Magic happens on port ' + port); // shoutout to the user
        app.exports = module.exports = app;

        //var job = cron.scheduleJob('* * * * *', function(){
        //    console.log('The answer to life, the universe, and everything!');
        //    slackAPI.getExport()
        //});
        app.slackJob = cron.scheduleJob('0 6 * * *', function(){
            console.log('woa its time for ea real slack export');
            app.slackAPI.getExport()
        });
    }


    app.saveSongToDB= function(song){
        var dbSong = new app.dbModel();
        dbSong = _.extend(dbSong, song.attributes);
        var message = {};
        return new promise(function(resolve,reject){
            app.dbModel.find({url: dbSong.url}, function (err, songs) {
                if (err) {
                    console.log('errorr with save to db')
                    reject(false)
                    return -1;
                }
                if (songs.length === 0) {
                    //console.log('saving song in db')
                    dbSong.save(function (err) {
                        if (err){
                            console.log('failed saving song to db');
                            reject('false')
                        }
                    });
                    //console.log('heyoo')
                    //console.log(dbSong)
                    message = {data: {message: 'successfully added song to db'}}
                    resolve(true)
                } else {
                    //this song already exists in db
                    //console.log('song already in DB')
                    message = {data: {message: 'song already exists in db, skipping'}}
                    resolve(false)
                }
            });
        });
    },
    app.getLastExportDate = function () {
        return new promise(function(resolve,reject){
            app.dateModel.findOne(function (err, resp) {
                if (err){
                    resolve(false)
                    console.log("error getting last export date"+err)
                }else{
                    app.lastExportDate = resp.date
                    resolve(resp.date)
                }
            });
        })

    }
    app.restoreStateFromDB = function(){
        app.songList.burnItDown();
        console.log('burned it bro')
        return new promise(function(resolve,reject){
            app.dbModel.find(function (err, resp) {
                if (err){
                    console.log("error getting last export date"+err)
                    reject(false)
                }else{
                    _.each(resp, function (e, i, l) {
                        app.songList.add(new app.songModel(_.omit(e['_doc'], '__v'),true))
                    })

                    console.log('alrite got the backup', app.songList.length)
                    //console.log('alrite got the backup', app.songList.getTallies())
                    resolve(true)
                }
            })
        })
    }


    function init(){
        app.dbModel = mongoose.model(collName, songSchema);
        app.dateModel = mongoose.model(exportDateCollName, exportDateSchema);

        loadConfig();

        app.songModel = require('./app/server_song')(app,Backbone,_, rp,promise,require('./config/tokens').lastFMkey);
        var SongList = require('./app/server_songList')(app,Backbone,_, rp,promise,app.songModel);
        app.songList = new SongList();
        app.slackAPI = require('./app/slackAPI')(app,param,_,rp,promise,require('./config/tokens').token, app.songModel, app.songList, app.dateModel);
        app.routes = require('./app/routes')(app,express,app.dbModel,_, app.slackAPI,promise, restart); // pass our application into our routes

        // REGISTER OUR ROUTES -------------------------------
        app.use('/api', router);


        //check that the collection is up to snuff
        app.dbModel.count({}, function (err, numRecords) {
            if (app.songList.models.length != numRecords ) {
                console.log('not up to snuffzzz')
                app.restoreStateFromDB().then(function(){
                    startServer();

                });
            } else {
                startServer();
            }
        })

        //todo: remove
        //startServer();
    }
    init();

}())
