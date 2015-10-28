module.exports = function (app,param, _, request, promise,slackToken,Song,SongList,exportDate) {
    var START_STAMP = '1434326400';
    var CHANNEL_NAME = 'music';
    var serviceArr = ['soundcloud', 'youtube', 'hypem', 'spotify']
    var slackAPI = {
            channels: {},
            users: {},
            baseURL: 'https://slack.com/api/',
            endpoints: {
                channels: 'https://slack.com/api/channels.list',
                users: 'https://slack.com/api/users.list',
                history: 'https://slack.com/api/channels.history'
            }
        },
        authToken = slackToken,
        params = {};

    function slackGet(type) {
        params = {
            token: authToken
        };

        var URL = slackAPI.endpoints[type] + '?' + param(params);
        var specifier = (type == 'users') ? 'members' : 'channels';
        return request(URL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var items = JSON.parse(response.body)[specifier]
                _.each(items, function (e, i, l) {
                    slackAPI[type][e.id] = e.name
                });
                //console.log(slackAPI[type])
            }
        }).promise()

    }

    slackAPI.getData = function (specifier) {
        return slackAPI[specifier]
    }
    slackAPI.test = function () {
        console.log(SongList.models.length)
        console.log(app.songList.getTallies())
    }

    slackAPI.getExport = function (startDate) {
        app.isReady = false;
        params = {
            token: authToken,
            channel: slackAPI['channels'][CHANNEL_NAME],
            count: '1000',
            oldest: startDate || START_STAMP
        };

        console.log('about to call slack w', params.oldest)

        return request(slackAPI.endpoints['history'] + '?' + param(params), function (error, response, body) {

            if (!error && response.statusCode == 200) {
                console.log("Success on Server!")
                if (JSON.parse(response.body).messages.length == 0) {
                    console.log('it just didnt work bruh')
                } else {
                    parseSlackResponse(JSON.parse(response.body).messages)
                }
            }
        }).promise()


    };

    function parseSlackResponse(messages){
        var deferreds = [];
        var latestDate = messages[0].ts
        _.each(messages, function (e, i, l) {
            if (_hasUrl(e.text) && _matchesService(e.text)) {
                var currSong = new Song(e);
                deferreds.push(currSong.promise)

                //$.when would be nicer
                Promise.all([currSong.promise]).then(function(res){

                    if (currSong.get('isValid') == false) {
                        console.log('got a weird message, not saving it', currSong.attributes.text)
                    } else {
                        app.saveSongToDB(currSong).then(function(res){
                            //todo: reserved for something if need to know if db save worked
                            //console.log('res', res)
                        })
                        SongList.add(currSong)

                    }

                })
            } else {}
        });

        return Promise.all(deferreds).then(function(res){
            console.log('done with all the calls', latestDate);
            exportDate.remove({}, function(err) {
                    if (err) {
                        console.log('failed CLEARING exportDate in DB')
                    }
                }
            );
            var dbDate = new exportDate({date:latestDate});
            dbDate.save(function (err) {
                if (err)
                    console.log('failed SAVING exportDate in DB')
            });
            app.lastExportDate = latestDate;
            app.isReady = true;
            console.log('-------', latestDate)
        })
    }

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


    slackGet('users').then(function () {
        app.users = slackAPI['users']
    });
    slackGet('channels').then(function () {
        slackAPI['channels'] = _.invert(slackAPI['channels'])
        //todo: remove this call, only for testing
        //slackAPI.getExport();
    });

    return slackAPI;
};