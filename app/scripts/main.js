var app = app || {}; // create namespace for our app
$(document).ready(function(){

    app.songList = new app.SongList();
    $.when(app.songList.fetchSongs(),
        loadTemplates(app.templates.names, function(){}))
        .then( init );

    function init(){
        app.eventBus = _.extend({}, Backbone.Events);
        app.controlsModel = new app.ControlsModel();
        app.mainView = new app.MainView().render();
        app.router = new app.Router();
        Backbone.history.start();
        //app.controlsModel.on({
        //    "change:currSongList": app.songListView.renderList(this)
        //})

    }

});