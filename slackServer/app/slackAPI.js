module.exports = function (app,param, _, request, promise,slackToken,Song,SongList) {
    var START_STAMP = '1434326400';
    var CHANNEL_NAME = 'music';
    var serviceArr = ['soundcloud', 'youtube', 'hypem', 'spotify']
    var slackAPI = {
            channels: {},
            users: {},
            lastImportDate: '',
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

    slackGet('users').then(function () {
        app.users = slackAPI['users']
    });
    slackGet('channels').then(function () {
        slackAPI['channels'] = _.invert(slackAPI['channels'])
        //todo: remove this call, only for testing
        slackAPI.getExport();
    });

    slackAPI.getData = function (specifier) {
        return slackAPI[specifier]
    }

    slackAPI.getExport = function () {
        app.isReady = false;

        params = {
            token: authToken,
            channel: slackAPI['channels'][CHANNEL_NAME],
            count: '1000',
            oldest: START_STAMP
        };

        return request(slackAPI.endpoints['history'] + '?' + param(params), function (error, response, body) {

            if (!error && response.statusCode == 200) {
                console.log("Success on Server!")
                slackAPI.lastImportDate = String(Date.now())
                //ret = response.body
                parseSlackResponse(JSON.parse(response.body).messages)
            }
        }).promise()


    };

    function parseSlackResponse(messages){
        console.log('alritey here we go gunna parse it up')
        var that = this;
        var deferreds = [];
        _.each(messages, function (e, i, l) {
            if (_hasUrl(e.text) && _matchesService(e.text)) {
                //todo: figure out how to parse out duplicates and failed API calls using the defered's reject

                //console.log('adding: ')
                //console.log(e)
                var currSong = new Song(e);
                deferreds.push(currSong.promise)
                app.saveSongToDB(currSong).then(function(res){
                    //todo: reserved for something if need to know if db save worked
                    //console.log('res', res)
                })
                SongList.add(currSong)
            } else {}
        });

        return Promise.all(deferreds).then(function(res){
            console.log('done with all the calls')
            //console.log(SongList.getTallies())
            //console.log(SongList.models)
            app.isReady = true;
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

    return slackAPI;
};