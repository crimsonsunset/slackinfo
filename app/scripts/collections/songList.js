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
            console.log('deleting model ' + model.id);
            model.destroy();
        });
    },
    fetchFromServer: function () {
        var that = this;
        return $.getJSON(app.config.serverURL + 'collection')
            .done(function (data) {
                console.log('GOT stuff')
                console.log(data)
                _.each(data.models, function (e, i, l) {
                    var currSong = new app.Song(e);
                    that.add(currSong)
                    currSong.save();
                })

            })
            .fail(function (data) {
                console.log("failed fetching");
            });
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
                        currSong.save();
                    } else {}
                });
                return $.when.apply(null, deferreds).done(function () {
                    console.log('DONE LOADING SONGS')
                    app.controlsModel.trigger('loadedSongs', {});
                });
            })
            .fail(function (data) {
                console.log("failed loading songs");
            });
    },
    serverNoop: function () {
        var that = this;
        return $.getJSON(app.config.serverURL + "noop")
            .done(function (data) {
                console.log('done with server noop')
                var promise = new $.Deferred().resolve('zzz');
                return $.when.apply(null, [promise]).done(function () {
                    setTimeout(function () {
                        console.log('DONE LOADING SONGsdsdsdsdsdS')
                        app.controlsModel.trigger('loadedSongs', {});
                    }, 1000)
                });


            })
            .fail(function (data) {
                console.log("failed loading songs");
            });
    }
});
