
app.MainView = Backbone.View.extend({
    el: '#songapp',
    songMatcher :  _.matcher({title: true}),
    initialize: function () {
        var that= this
        $(document).bind('keypress', function(e) {
            that.shortcutKeys(e)
        });

        //render the app which has the containers, then can populate containers with the subviews
        this.render();

        //todo: make this lazy load, comment out to test timing
        app.songListView, this.songListView = new app.SongListView({collection: app.songList}).renderChunk();
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
    shortcutKeys: function (e) {
        if ($(e.currentTarget.activeElement)[0].nodeName != 'INPUT') {
            var event = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            switch (e.keyCode) {
                //f (find)
                case 102:
                    var cb = $('#search-btn')[0];
                    cb.dispatchEvent(event);
                    setTimeout(function () {
                        $('#search').val('');
                    },20)
                    break;
                //t
                case 116:
                    var cb = $('#switch-tags')[0];
                    //$( "#switch-tags" ).trigger( "click", true );
                    cb.dispatchEvent(event);
                    app.controlsModel.trigger('rowToggle', 'tags');
                    break;
                //c
                case 99:
                    var cb = $('#switch-contributors')[0];
                    cb.dispatchEvent(event);
                    app.controlsModel.trigger('rowToggle', 'contributors');
                    break;
                //s
                case 115:
                    var cb = $('#switch-services')[0];
                    cb.dispatchEvent(event);
                    app.controlsModel.trigger('rowToggle', 'services');
                    break;
                default :
                    console.log("none of those keys", e.keyCode)
            }

        } else {

        }
        return this;
    },
    //todo: fix this to actually work
    events: {
        'keyup document': 'shortcutKeys'
    }
});