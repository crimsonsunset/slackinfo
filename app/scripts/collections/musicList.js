app.TodoList = Backbone.Collection.extend({
    model: app.Todo,
    localStorage: new Store("backbone-todo"),
    completed: function() {
        return this.filter(function( todo ) {
            return todo.get('completed');
        });
    },
    remaining: function() {
        return this.without.apply( this, this.completed() );
    }
});

app.SongList = Backbone.Collection.extend({
    model: app.Song,
    SONG_URL: 'app/templates/testDay.json',
    //localStorage: new Store("backbone-song"),
    initialize: function () {
        //this.fetchSongs();
        return this;
    },
    completed: function() {
        return this.filter(function( todo ) {
            return todo.get('completed');
        });
    },
    remaining: function() {
        return this.without.apply( this, this.completed() );
    },
    filterBy: function(filterName) {
        return this.filter(function( song ) {
            return song.get('service') === filterName
        });
    },
    fetchSongs: function () {
        var that = this;
        return $.getJSON(this.SONG_URL)
            .done(function (data) {
                _.each(data, function(e,i,l){
                    if (e.text.hasUrl() && e.text.matchesService()) {
                        that.add(new app.Song(e))
                    } else {}
                });
                //console.log('done fetching songs', that)
            })
            .fail(function (data) {
                console.log("failed loading songs");
            });
    }
});
