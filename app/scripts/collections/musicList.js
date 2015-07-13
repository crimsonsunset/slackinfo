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
    localStorage: new Store("backbone-song"),
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
            return song['service'] === filterName
        });
    }
});
