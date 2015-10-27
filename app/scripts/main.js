var app = app || {};
$(document).ready(function () {

    app.songList = new app.SongList();
    app.controlsModel = new app.ControlsModel();

    //app.controlsModel.getFromServer('users').then(function () {
    //    app.songList.fetch().done(function (models) {
    //
    //        var hitServerFunction = (models.length == 0) ? app.songList.fetchSongs() : app.songList.serverNoop()
    //        console.log('hitfucntion is', hitServerFunction)
    //
    //
    //        //only need to hit endpoint 1x for the bulk of the songs, then it will be stored
    //        //using localstorage. no need to keep hitting server.
    //        $.when(hitServerFunction,
    //            loadTemplates(app.templates.names, function () {
    //                console.log('done loading templates')
    //            }))
    //            .then(init);
    //    })
    //})


    $.when(loadTemplates(app.templates.names, function () {
        console.log('done loading templates')
    }), app.controlsModel.getFromServer('users'),
        app.controlsModel.getFromServer('count'),
        app.controlsModel.getFromServer('tallies'),
        app.songList.fetch()
    )


        .then(function (templates,users,count,tallies,models) {
        console.log('count',count[0])
        console.log('models')
        console.log(models)
            if (models.length === count[0]) {
                //nothing has changed on the server, can use localstorage
                init();
            } else {
                //theres something new on the server, dump old collection and use what's stored there
                app.songList.burnItDown();
                app.songList.fetchFromServer().then(init);

            }


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