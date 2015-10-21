var app = app || {};
$(document).ready(function () {

    app.songList = new app.SongList();
    app.controlsModel = new app.ControlsModel();

    app.controlsModel.getUsers().then(function () {
            $.when(app.songList.fetchSongs(),
                loadTemplates(app.templates.names, function () {}))
                .then(init);
        }
    );

    function init() {
        //todo: emit data finished event here
        app.searchService, app.songList.searchService = new app.SearchService('bower_components/fuse.js/src/fuse.min.js',
            app.songList,
            ['artist', 'contributor', 'service', 'tags', 'title'], {threshold: 0.2, useModels: true});
        app.mainView = new app.MainView();
    }

    //These need to wait for songs to all be fetched
    Backbone.listenTo(app.controlsModel, 'loadedSongs', function (inObj) {
        console.log('okay, now done with fetching all the songs')
        app.controlsModel.sortTags();
        app.switchView = new app.SwitchView().render();
        componentHandler.upgradeDom();
        createTextFills();
        //todo: emit view finished event here
        app.router = new app.Router();
        Backbone.history.start();
    });

});