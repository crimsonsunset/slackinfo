//templates are loaded from loadTemplates() in util
app.SongView = Backbone.View.extend({
    tagName: 'div',
    render: function () {
        var d = this.template(this.model.toJSON())
        this.$el.html(d)
        this.$(".song").css('background-color', randomColor({luminosity: 'light'}));
        return this;
    },
    initialize: function () {
        //this.listenTo(this.model, "change", this.songChanged);
    },
    showSongCard: function (e) {
        //console.log('showSongCard')
        app.mainView.spawnCard(new app.SongCardView({model: this.model}).render())
    },
    songChanged: function (e) {
        //console.log('songchanged')
    },
    events: {
        'click .song': 'showSongCard'
    }
});

app.SongListView = Backbone.View.extend({
    el: '.song-list',
    render: function () {
        console.log('rendiner sonlistview')
        this.$el.empty();
        this.collection.each(this.addOne, this);
        return this; // enable chained calls
    },
    renderList : function(songs){
        //console.log('renderList');
        this.$el.empty();
        var that = this;
        //console.log(app.controlsModel.get('currSongList'))
        _.each(songs, function(song){
            that.addOne(song)
        });
        return this;
    },
    addOne: function (song) {
        var songView = new app.SongView({model: song});
        this.$el.append(songView.render().el);
    },
    initialize: function () {
        app.controlsModel.set({'currSongList': this.collection});

        //watch the currSongList for changes, which will happen when search or filter occurs
        var that = this
        this.listenTo(app.controlsModel, 'change:currSongList', function (data) {
            that.renderList(data.get('currSongList'))
        });
        return this;
    }
});

app.SongCardView = Backbone.View.extend({
    tagName: 'div',
    render: function () {
        this.$el.html(this.template(this.model.toJSON()))
        console.log(this.model.toJSON())
        this.$el.attr('id', 'song-card-' + this.id);
        this.$(".mdl-card__media").css('background-color', randomColor({luminosity: 'dark'}));
        return this;
    },
    initialize: function () {
        this.id = this.model.cid
    }
});

app.HeaderView = Backbone.View.extend({
    el: '#controls',
    render: function () {
        this.$el.html(this.template());

        //for (var i = 0; i < app.controlsModel.filterList.length; i++) {
        //
        //}

        return this;
    },
    initialize: function () {
        //this.id = this.model.cid
    }
});

//tags,contributors,service
app.SwitchView = Backbone.View.extend({
    //tagName: 'div',
    el: '.switch-box',
    switchRefObj : {},
    render: function () {
        this.$el.append(this.template(this.switchRefObj))
        return this;
    },
    initialize: function (configObj) {
        console.log('INIT switches')
        var that = this;
        var topBtns = [];
        //take top 12 tags to make the buttons
        console.log(app.controlsModel.get('filterList'))
        _.each(app.controlsModel.get('filterList'), function(e,i,l){
            that.switchRefObj[e] = {
                name:e,
                isOn:false,
                topBtns: app.controlsModel.attributes[e+'Sorted'].slice(0, 11)
            }
        });
        //console.log(this.switchRefObj)
        return this;
    },
    toggleBtnRow: function (event,i) {
        console.log(event)
        event.stopImmediatePropagation();
        event.stopPropagation();
        //this.switchRefObj[rowName].isOn = !this.switchRefObj[rowName].isOn;
    },
    events: {
        'click .mdl-switch': 'toggleBtnRow'
    }
});


app.BtnRowView = Backbone.View.extend({
    el: 'header',
    render: function () {
        this.$el.append(this.template(this.switchRefObj))
        return this;
    },
    initialize: function (configObj) {
        console.log('INIT switches')
        var that = this;
        var topBtns = [];
        //take top 12 tags to make the buttons
        console.log(app.controlsModel.get('filterList'))
        _.each(app.controlsModel.get('filterList'), function(e,i,l){
            that.switchRefObj[e] = {
                name:e,
                topBtns: app.controlsModel.attributes[e+'Sorted'].slice(0, 11)
            }
        });
        console.log(this.switchRefObj)
        return this;
    },
    toggleBtnRow: function (e) {
        console.log('toggling row bro');
        console.log(e.target.innerText)
    },
    events: {
        'click .resize': 'toggleBtnRow'
    }
});