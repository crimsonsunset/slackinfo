app.ControlsModel = Backbone.Model.extend({
    defaults: {
        currSongList : [],
        filterList : ['tags','contributors', 'services'],
        users : [],
        serverRoutes : {
            users: 'users'
        },
        switchRefObj : {}
    },
    initialize: function () {
        //console.log('init controls model')
        return this;
    },
    getUsers: function(){
        var that = this;
        return $.getJSON(app.config.serverURL+this.get('serverRoutes')['users'])
            .done(function (data) {
                console.log('GOT USERSSS', data[Object.keys(data)[0]])
                that.set('users', data)
            })
            .fail(function (data) {
                console.log("failed fetching users");
            });
    },
    sortTags: function () {
        var that = this;
        _.each(that.get('filterList'), function (e, i, l) {
            that.attributes[e+'Sorted'] = _.sortBy(_.toArray(that.get(e)), 'count').reverse();
        })
    },
    addToTally: function (obj,tag) {
        //initalize if needed
        var currObj = this.get(obj)
        var currTallyObj = (!currObj) ? this.attributes[obj] = {} : currObj;
        if (currTallyObj[tag]) {
            currTallyObj[tag].count++;
        } else {
            this.attributes[obj][tag]={name:tag,count:1};
        }
        return currTallyObj
    }
});
