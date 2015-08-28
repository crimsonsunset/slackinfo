app.TodoList = Backbone.Collection.extend({
    model: app.Todo,
    localStorage: new Store("backbone-todo"),
    completed: function () {
        return this.filter(function (todo) {
            return todo.get('completed');
        });
    },
    remaining: function () {
        return this.without.apply(this, this.completed());
    }
});

app.SongList = Backbone.Collection.extend({
    model: app.Song,
    url: '/api/songs',
    SONG_URL: 'app/templates/testDay.json',
    //localStorage: new Store("backbone-song"),
    comparator : 'title',
    initialize: function () {
        return this;
    },
    filterBy: function (filterName) {
        return this.filter(function (song) {
            return song.get('service') === filterName
        });
    },
    basicSearch: function (inStr) {
        console.log('searching for: '+ inStr)
        var pattern = new RegExp(inStr, "gi");
        console.log(this)
        return this.filter(function (song) {
            return pattern.test(song.get("title"));
        });
    },
    fuzzySearch: function (inStr) {
        var retArr=[]
        _.each(app.searchService.search(inStr), function (e, i, l) {
            retArr.push(new app.Song(e))
        });
        return retArr
    },
    fetchSongs: function () {
        var that = this;
        return $.getJSON(this.SONG_URL)
            .done(function (data) {
                _.each(data, function (e, i, l) {
                    if (e.text.hasUrl() && e.text.matchesService()) {
                        that.add(new app.Song(e))
                    } else {}
                });
            })
            .fail(function (data) {
                console.log("failed loading songs");
            });
    }
});
