var app = app || {}; // create namespace for our app
$(document).ready(function () {

    app.songList = new app.SongList();
    app.controlsModel = new app.ControlsModel();
    $.when(app.songList.fetchSongs(),
        loadTemplates(app.templates.names, function () {}))
        .then(init);

    function init() {
        //todo: emit data finished event here
        app.searchService, app.songList.searchService = new app.SearchService('bower_components/fuse.js/src/fuse.min.js',
            app.songList,
            ['artist', 'contributor', 'service', 'tags', 'title'], {threshold: 0.2, useModels: true});
        app.mainView = new app.MainView();
        //todo: emit view finished event here
        app.router = new app.Router();
        Backbone.history.start();
        //d = new app.SwitchView({title: 'Top Tags', arr: ['t1','t2','t3','t4']}).render()
        componentHandler.upgradeDom();
        createTextFills();
    }

});