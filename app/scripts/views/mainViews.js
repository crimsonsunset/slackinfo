
app.MainView = Backbone.View.extend({
    el: '#songapp',
    songMatcher :  _.matcher({title: true}),
    initialize: function () {
        //render the app which has the containers, then can populate containers with the subviews
        this.render();
        app.songListView, this.songListView = new app.SongListView({collection: app.songList}).render();
        app.headerView, this.headerView = new app.HeaderView().render();
        //app.switchView, this.switchView = new app.SwitchView().render();
        return this;
    },
    headerView: {},
    songListView: {},
    switchView: {},
    render: function () {

        //render the whole app
        this.$el.append(this.template());
        return this;
    },
    spawnCard: function (card) {
        $('.card-holder').empty().append(card.$el)
        return this;
    },
    searchChanged: function (e) {

        var currSongList = app.controlsModel.get('currSongList')
        var inText = $(e.target).val();
        if (inText.length <= 2) {
            app.controlsModel.set({'currSongList': app.songList.models});
        }
        else if (inText.length >2) {
            //var testArr = app.songList.basicSearch(inText)
            var testArr = app.songList.fuzzySearch(inText)
            //todo: a bit of a hack, CID prevents isEqual from working as expected.
            //making them all NA to pass test when necessary.
            _.each(testArr, function (e, i, l) {
                e.cid = 'NA'
            });
            if (!_.isEqual(testArr,currSongList)) {
                //setting the controls model will trigger a view update cuz view is listening for change
                app.controlsModel.set({'currSongList': testArr});
            }
        } else {}
    },
    events: {
        'keyup .search-field': 'searchChanged'
    }
});