module.exports = function (app, express, Song, _, slackAPI, promise, restart, request,Songz) {

    // create our router
    router = express.Router();

    // middleware to use for all requests
    router.use(function (req, res, next) {
        // do logging
        console.log('Something is happening.');
        next();
    });

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function (req, res) {
        res.json({message: 'hooray! welcome to our api!'});
    });

    router.route('/song')
        .post(function (req, res) {
            console.log("POST in SONG")
            var dbSong = new Song();

            if (!req.body) {
                console.log('someone posting crap');
                res.send("Please POST a valid Object");
            } else {
                dbSong = _.extend(dbSong, req.body);
                var message = {};

                Song.find({url: dbSong.url}, function (err, songs) {
                    if (err) {return console.error(err);}
                    if (songs.length === 0) {
                        console.log('saving song in db')
                        dbSong.save(function (err) {
                            if (err)
                                res.send("FAIL " + err);
                            else {}
                        });
                        message = {data: {message: 'successfully added song to db'}}
                    } else {
                        //this song already exists in db
                        console.log('song already in DB')
                        message = {data: {message: 'song already exists in db, skipping'}}
                    }
                    res.status(200)
                        .send(message);
                });
            }

        })
        .get(function (req, res) {
            console.log("GET in SONG")
            console.log(req.query['id'])

            if (!req.query['id']) {
                res.status(406)
                    .send({error: 'You must include a songID in your query string'});
            } else {
                res.status(200)
                    .send({song: {}});
            }
        });

    router.route('/users')
        .get(function (req, res) {
            console.log("GET in users")
            res.status(200)
                .send(slackAPI.getData('users'));
        });

    router.route('/channels')
        .get(function (req, res) {
            console.log("GET in channels")
            res.status(200)
                .send(slackAPI.getData('channels'));
        });

    router.route('/noop')
        .get(function (req, res) {
            console.log("GET in noop")
            slackAPI.test()
            res.status(200)
                .send({'status': 'cool story bro'});
        });

    router.route('/collection')
        .get(function (req, res) {
            console.log("GET in collection")
            if (app.isReady) {
                res.status(200)
                    .send({models: app.songList.models, tallies: app.songList.getTallies()});
            } else {
                res.status(409)
                    .send({error: 'The Server is currently pulling data, please refresh the page'});
            }
        });

    router.route('/tallies')
        .get(function (req, res) {
            console.log("GET in collection")
            if (app.isReady) {
                res.status(200)
                    .send(app.songList.getTallies());
            } else {
                res.status(409)
                    .send({error: 'The Server is currently pulling data, please refresh the page'});
            }
        });

    router.route('/count')
        .get(function (req, res) {
            console.log("GET in count")
            try {
                Song.count({}, function (err, numRecords) {
                    res.status(200)
                        .send(String(numRecords));
                })
            }
            catch (e) {
                throw "cannot connect to DB in count!"
            }


        });

    router.route('/export')
        .get(function (req, res) {
            console.log("GET in EXPORT");
            slackAPI.getExport().then(function (data) {
                var messages = JSON.parse(data).messages
                res.status(200)
                    .send(messages);

            }, function (reason) {
                console.log('failed export on route');
                console.log(reason);
            });
        });

    router.route('/date')
        .get(function (req, res) {
            console.log("GET in DATE");
            app.getLastExportDate().then(function (date) {
                res.status(200)
                    .send(date);
            }, function (reason) {
                console.log('failed export on route');
                console.log(reason);
            });
        });

    router.route('/initial')
        .get(function (req, res) {
            console.log("GET in INITIAL");
            app.getLastExportDate().then(function (date) {
                res.status(200)
                    .send(date);
            }, function (reason) {
                console.log('failed export on route');
                console.log(reason);
            });
        });

    router.route('/test')
        .get(function (req, res1) {
            console.log("GET in test");
            var serviceArr = ['soundcloud', 'youtube', 'hypem', 'spotify']
            _hasUrl = function (str) {
                return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(str)
            };

            _matchesService = function (str) {
                var didMatch = false
                _.each(serviceArr, function (e, i, l) {
                    if (str.indexOf(e) !== -1) {
                        didMatch = true
                        return true
                    }
                })
                return didMatch
            }


            var deferreds = [];
            var messages= require('./exports/66.json').messages
            _.each(messages, function (e, i, l) {
                if (_hasUrl(e.text) && _matchesService(e.text)) {
                    var currSong = new Songz(e);
                    deferreds.push(currSong.promise)
                    Promise.all([currSong.promise]).then(function (res) {
                        console.log('Promise Came back from single song')
                        console.log(res)
                    })

                }
            });

            return Promise.all(deferreds).then(function (res) {
                console.log('All the promises came back from the asst APIs, SENDING data back to the route')
                console.log(res)
                res1.status(200)
                    .send(res);
            })
        });

    router.route('/resetdate')
        .get(function (req, res) {
            console.log("GET in DATE");
            app.getLastExportDate().then(function (date) {
                res.status(200)
                    .send(date);
            }, function (reason) {
                console.log('failed export on route');
                console.log(reason);
            });
        });


    router.route('/allexports')
        .get(function (req, res) {
            console.log("GET in allexports");
            var lastDate;
            app.getLastExportDate().then(function (date) {
                getNextExport(date)
                function getNextExport(date) {
                    slackAPI.getExport(date).then(function (data) {
                        if (JSON.parse(data).has_more) {
                            console.log('============== OKAY, KEEP LOOPING ===========')
                            getNextExport(app.lastExportDate)
                        } else {
                            return
                        }
                    })
                }

                res.status(200)
                    .send('asdzzzz');
            }, function (reason) {
                console.log('failed export on route');
                console.log(reason);
            });
        });


};
