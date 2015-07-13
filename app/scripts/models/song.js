app.Todo = Backbone.Model.extend({
    defaults: {
        title: '',
        completed: false

    }
});

app.Song = Backbone.Model.extend({
    defaults: {
        title: '',
        artist: '',
        url: '',
        contributor: '',
        source: ''
    }
});