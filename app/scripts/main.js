var app = app || {};
$(document).ready(function () {

    app.songList = new app.SongList();
    app.controlsModel = new app.ControlsModel();

    app.controlsModel.getUsers().then(function () {
        app.songList.fetch().done(function (models) {

            var hitServerFunction = (models.length == 0) ? app.songList.fetchSongs() : app.songList.serverNoop()

            //only need to hit endpoint 1x for the bulk of the songs, then it will be stored
            //using localstorage. no need to keep hitting server.
            $.when(hitServerFunction,
                loadTemplates(app.templates.names, function () {
                    console.log('done loading templates')
                }))
                .then(init);
        })
    })




    function init() {
        //todo: emit data finished event here
        console.log('Init function! ')
        app.searchService, app.songList.searchService = new app.SearchService('bower_components/fuse.js/src/fuse.min.js',
            app.songList,
            ['artist', 'contributor', 'service', 'tags', 'title'], {threshold: 0.2, useModels: true});
        app.mainView = new app.MainView();

        //app.controlsModel.trigger('loadedSongs',{});
    }

    //These need to wait for songs to all be fetched
    Backbone.listenTo(app.controlsModel, 'loadedSongs', function (inObj) {
        console.log('okay, now done with FETCHING all the songs')
        app.controlsModel.sortTags();
        app.switchView = new app.SwitchView().render();
        componentHandler.upgradeDom();
        createTextFills('resize');
        //todo: emit view finished event here
        app.router = new app.Router();
        Backbone.history.start();
    });

});