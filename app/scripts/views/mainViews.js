
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
    }
});