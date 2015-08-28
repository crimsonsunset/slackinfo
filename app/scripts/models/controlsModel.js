app.ControlsModel = Backbone.Model.extend({
    defaults: {
        showHeader: false
    },
    currSongList : [],
    filterList : ['Top Tags', 'Genre','Contributors', 'Service'],
    initialize: function () {
    }
});
