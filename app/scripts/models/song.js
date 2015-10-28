app.Song = Backbone.Model.extend({
    defaults: {
        title: '',
        artist: '',
        artist_info: {},
        tags: [],
        url: '',
        contributor: '',
        service: '',
        thumbnail: '',
        description: ''
    },
    initialize: function (attr) {
        this.set('attributes', attr)
        return this;
    }
});