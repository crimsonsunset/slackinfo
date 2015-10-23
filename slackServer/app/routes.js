module.exports = function (app, express, Song, _, slackAPI, promise) {

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
            console.log("Finished posting in order")

        })
        .get(function (req, res) {
            console.log("GET in SONG")
            console.log(req.query['id'])

            var resultJSON = {}
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

    router.route('/order')

        // create an order
        .post(function (req, res) {

            console.log("POSTING IN ORDER")

            var ans = new Answer();		// create a new instance of the Bear model
            //            console.log(JSON.stringify(ans))

            if (Object.keys(req.body).length != POST_ELEMENTS) {
                res.send("Please POST a valid Object");
            } else {
                for (var e in req.body) {
                    ans[e] = req.body[e]
                }
                ans.save(function (err) {
                    if (err)
                        res.send("FAIL " + err);
                    res.json({message: 'Successfully Created Order'});
                });
            }
            console.log("Finished posting in order")

        })

    router.route('/stats')

        .get(function (req, res) {
            console.log("Getting in stats")

            try {
                Answer.count({}, function (err, numRecords) {
                    //                    console.log("first err is " + err)
                    Answer.find({}, function (err, dbTable) {
                        //                        console.log("second err is " + err)
                        calcStats(numRecords, dbTable)
                    })
                })
            }
            catch (e) {
                throw "cannot connect to DB in stats!"
            }


            function calcStats(numRecords, dbTable) {
                var firstRun = true;
                var tallyObj1 = {}
                var tallyObj2 = {}
                var tallyObj3 = {}
                var tallyObj4 = {}
                var tallyObj5 = {}
                for (var i = 0; i < dbTable.length; i++) {
                    var currRecord = dbTable[i].toObject();
                    if (firstRun) {
                        _.each(currRecord["order"], function (e2, i2, l2) {
                            tallyObj1[e2] = {"val": 0, "name": e2}
                            tallyObj2[e2] = {"val": 0, "name": e2}
                            tallyObj3[e2] = {"val": 0, "name": e2}
                            tallyObj4[e2] = {"val": 0, "name": e2}
                            tallyObj5[e2] = {"val": 0, "name": e2}
                        });
                        firstRun = false;
                    }
                    for (var key in currRecord) {
                        if (currRecord.hasOwnProperty(key)) {
                            switch (key) {
                                case "sessionId", "_id", "order", "__v":
                                    break;
                                case "a1":
                                    tallyObj1[currRecord[key]].val++;
                                    break;
                                case "a2":
                                    tallyObj2[currRecord[key]].val++;
                                    break;
                                case "a3":
                                    tallyObj3[currRecord[key]].val++;
                                    break;
                                case "a4":
                                    tallyObj4[currRecord[key]].val++;
                                    break;
                                case "a5":
                                    tallyObj5[currRecord[key]].val++;
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                var tallyArr1 = [];
                var tallyArr2 = [];
                var tallyArr3 = [];
                var tallyArr4 = [];
                var tallyArr5 = [];
                for (var i in tallyObj1) {
                    tallyArr1.push(tallyObj1[i])
                    tallyArr2.push(tallyObj2[i])
                    tallyArr3.push(tallyObj3[i])
                    tallyArr4.push(tallyObj4[i])
                    tallyArr5.push(tallyObj5[i])
                }
                tallyArr1.sort(sort_by('val', false, function (a) {
                    return a
                }));

                //                console.log('tallyArr is + ' + JSON.stringify(tallyArr1))


                if (tallyArr1.length == 0) {
                    res.json({
                        1: {
                            name: "placeholder",
                            score: 0,
                            percentage: 0
                        },
                        2: {
                            name: "placeholder2",
                            score: 0,
                            percentage: 0
                        },
                        "total": 0
                    });

                } else {
                    res.json({
                        1: {
                            name: tallyArr1[0].name,
                            score: tallyArr1[0].val,
                            percentage: tallyArr1[0].val / numRecords
                        },
                        2: {
                            name: tallyArr1[1].name,
                            score: tallyArr1[1].val,
                            percentage: tallyArr1[1].val / numRecords
                        },
                        "total": numRecords
                    });

                }


            }
        })

    var sort_by = function (field, reverse, primer) {
        var key = function (x) {
            return primer ? primer(x[field]) : x[field]
        };
        return function (a, b) {
            var A = key(a), B = key(b);
            //alert(A + " , " + B)
            return ((A < B) ? -1 :
                    (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
        }
    };


};
