app.SongList = Backbone.Collection.extend({
    model: app.Song,
    url: '/api/songs',
    SONG_URL: 'app/exports/1.json',
    COUNT_URL: '/count',
    localStorage: new Backbone.LocalStorage("local-songs"),
    comparator: 'title',
    searchService: {},
    initialize: function () {
        return this;
    },
    filterBy: function (filterName) {
        return this.filter(function (song) {
            return song.get('service') === filterName
        });
    },
    basicSearch: function (inStr) {
        console.log('searching for: ' + inStr)
        var pattern = new RegExp(inStr, "gi");
        console.log(this)
        return this.filter(function (song) {
            return pattern.test(song.get("title"));
        });
    },
    fuzzySearch: function (inStr) {
        //console.log('searching for: ' + inStr)
        return this.searchService.search(inStr)
    },
    burnItDown: function () {
        _.chain(this.models).clone().each(function (model) {
            //console.log('deleting model ' + model.id);
            model.destroy();
        });
    },
    fetchFromServer: function () {
        var that = this;
        var deferreds = [];
        return $.getJSON(app.config.serverURL + 'collection')
            .done(function (data) {
                console.log('GOT stuff')
                console.log(data)
                _.each(data.models, function (e, i, l) {


                    //todo: this is for loading testing
                    //if (i > 30) {
                    //    console.log('adding only 30')
                    //    return
                    //}
                    var currSong = new app.Song(e);
                    that.add(currSong)
                    currSong.save();
                })
            })
            .fail(function (data) {
                console.log("failed fetching");
            });
    }
});
