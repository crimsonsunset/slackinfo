module.exports =  function (request,param,_) {
    var START_STAMP = '1434326400';
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
        authToken = '',
        params = {};

    function slackGet(type){
        params = {
            token: authToken
        };

        var URL = slackAPI.endpoints[type] + '?' + param(params);
        var specifier = (type == 'users') ? 'members' : 'channels';
        request(URL, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var items = JSON.parse(response.body)[specifier]
                _.each(items, function(e,i,l){
                    slackAPI[type][e.id] = e.name
                });
                //console.log(slackAPI[type])
            }
        })
        return slackAPI[type]

    }

    slackGet('channels')
    slackGet('users')


    slackAPI.getUsers = function () {
        console.log('getting users');
        if (slackAPI.users.length !== 0) {
            return slackGet('users');
        } else {
            return slackAPI.users()
        }

    }

    slackAPI.getExport = function () {

        //console.log(slackAPI.channels['music'])

        params = {
            token: authToken,
            channel: 'C06JLNH8A',
            count: '1000',
            oldest: START_STAMP
        };

        var ret = request(slackAPI.endpoints['history'] + '?' + param(params), function (error, response, body) {

            if (!error && response.statusCode == 200) {
                console.log("Success on Server!")
                slackAPI.lastImportDate = String(Date.now())
                console.log(response.body)
                return response.body
            }
        })
        console.log('ret')
        console.log(ret)

        return ret

    };

    return slackAPI;
};