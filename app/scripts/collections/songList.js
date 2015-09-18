app.SongList = Backbone.Collection.extend({
    model: app.Song,
    url: '/api/songs',
    SONG_URL: 'app/templates/testDay.json',
    //localStorage: new Store("backbone-song"),
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
    fetchSongs: function () {
        var that = this;
        var deferreds = [];
        return $.getJSON(this.SONG_URL)
            .done(function (data) {
                _.each(data, function (e, i, l) {
                    if (e.text.hasUrl() && e.text.matchesService()) {
                        var currSong = new app.Song(e);
                        deferreds.push(currSong.promise)
                        that.add(currSong)
                    } else {}
                });
                return $.when.apply(null, deferreds).done(function () {
                    app.controlsModel.trigger('loadedSongs',{});
                });
            })
            .fail(function (data) {
                console.log("failed loading songs");
            });
    }
});
