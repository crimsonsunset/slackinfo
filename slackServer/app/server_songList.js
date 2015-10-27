module.exports = function(app,Backbone,_,request,promise,Song){
    return Backbone.Collection.extend({
        model: Song,
        comparator: 'title',
        searchService: {},
        attributes:{},
        initialize: function () {
            console.log('starting SONGLIST')
            return this;
        },
        fetchSongs: function () {
            var that = this;
            var deferreds = [];
            return $.getJSON(this.SONG_URL)
                .done(function (data) {
                    _.each(data, function (e, i, l) {
                        if (e.text.hasUrl() && e.text.matchesService()) {
                            //todo: figure out how to parse out duplicates and failed API calls using the defered's reject
                            var currSong = new app.Song(e);
                            deferreds.push(currSong.promise)
                            that.add(currSong)
                        } else {}
                    });
                    return $.when.apply(null, deferreds).done(function () {
                        console.log('DONE LOADING SONGS')
                        app.controlsModel.trigger('loadedSongs',{});
                    });
                })
                .fail(function (data) {
                    console.log("failed loading songs");
                });
        },
        addToTally: function (obj,tag) {
            //initalize if needed
            var currObj = this.attributes[obj]
            var currTallyObj = (!currObj) ? this.attributes[obj] = {} : currObj;
            if (currTallyObj[tag]) {
                currTallyObj[tag].count++;
            } else {
                this.attributes[obj][tag]={name:tag,count:1};
            }
            return currTallyObj
        },
        getTallies: function () {
            return this.attributes
        }
    })

};
