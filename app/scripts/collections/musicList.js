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
    url: '/api/songlist',
    SONG_URL: 'app/templates/testDay.json',
    //localStorage: new Store("backbone-song"),
    initialize: function () {

        this.on("search", function (msg) {
            alert("Triggered " + msg);
        });
        return this;
    },
    completed: function () {
        return this.filter(function (todo) {
            return todo.get('completed');
        });
    },
    remaining: function () {
        return this.without.apply(this, this.completed());
    },
    filterBy: function (filterName) {
        return this.filter(function (song) {
            return song.get('service') === filterName
        });
    },
    search: function (inStr) {
        console.log('searching for: '+ inStr)
        var pattern = new RegExp(inStr, "gi");
        return this.filter(function (song) {
            return pattern.test(song.get("title"));
        });
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


//_.extend(app.SongList, Backbone.Events).on("search", function(data) {
//    console.log(data);
//});
