module.exports = function (param, _, request, promise) {
    var START_STAMP = '1434326400';
    var CHANNEL_NAME = 'music';
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
        authToken = 'xoxp-6592344449-6592344465-11803303442-ffa8edf4ba',
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

    slackGet('users')
    slackGet('channels').then(function () {slackAPI['channels'] = _.invert(slackAPI['channels'])})

    slackAPI.getData = function (specifier) {
        return slackAPI[specifier]
    }

    slackAPI.getExport = function () {

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
                parseSlackResponse(response.body)
            }
        }).promise()


    };

    function parseSlackResponse(messages){
        console.log('alritey here we go gunna parse it up')
    }

    return slackAPI;
};