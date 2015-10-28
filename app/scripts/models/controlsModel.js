app.ControlsModel = Backbone.Model.extend({
    defaults: {
        currSongList : [],
        //localStorage: new Backbone.LocalStorage("local-controls"),
        filterList : ['tags','contributors', 'services'],
        users : [],
        serverRoutes : {
            users: 'users',
            count: 'count',
            tallies: 'tallies',
            collection: 'collection'
        },
        switchRefObj : {}
    },
    initialize: function () {
        //console.log('init controls model')
        return this;
    },
    getFromServer: function(route){
        var that = this;
        return $.getJSON(app.config.serverURL+this.get('serverRoutes')[route])
            .done(function (data) {
                console.log('GOT stuff', data)
                that.set(route, data)
            })
            .fail(function (data) {
                console.log("failed fetching",route);
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
