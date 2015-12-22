var app = app || {};
$(document).ready(function () {

    app.songList = new app.SongList();
    app.controlsModel = new app.ControlsModel();

    $.when(
        loadTemplates(app.templates.names),
        app.controlsModel.getFromServer('users'),
        app.controlsModel.getFromServer('count'),
        app.controlsModel.getFromServer('tallies')
    )
        .then(function (templates, users, count, tallies) {

            //set the tallies back up
            _.each(tallies[0], function (e, i, l) {
                app.controlsModel.set(i, e)
            });

                //theres something new on the server, dump old collection and use db
                console.log('we got some CHANGES change bruh')
                //app.songList.burnItDown();
                app.songList.fetchFromServer().then(init);

        })



    function init() {

        //todo: emit data finished event here
        console.log('Init function! ')
        app.searchService, app.songList.searchService = new app.SearchService('bower_components/fuse.js/src/fuse.min.js',
            app.songList,
            ['artist', 'contributor', 'service', 'tags', 'title'], {threshold: 0.2, useModels: true});
        app.mainView = new app.MainView();
        app.controlsModel.sortTags();
        app.switchView = new app.SwitchView().render();
        componentHandler.upgradeDom();
        createTextFills('resize');


        //todo: emit view finished event here
        app.router = new app.Router();
        Backbone.history.start();

    }
});

//todo:  fix top viewport, hypem support, fix localstorage, more animations, fix grunt, fix arrows, cross broswer, change load from server