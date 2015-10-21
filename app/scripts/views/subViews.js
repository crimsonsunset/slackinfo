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
        _.each(songs, function(song){
            that.addOne(song)
            console.log(song)
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
        return this;
    },
    initialize: function () {
        //this.id = this.model.cid
    }
});

//tags,contributors,service
app.SwitchView = Backbone.View.extend({
    el: '.switch-box',
    switchRefObj : {},
    render: function () {
        this.$el.append(this.template(this.switchRefObj))
        return this;
    },
    initialize: function (configObj) {
        var that = this;
        //take top 12 tags to make the buttons
        console.log(app.controlsModel.get('filterList'))
        _.each(app.controlsModel.get('filterList'), function(e,i,l){
            that.switchRefObj[e] = {
                name:e,
                isOn:false,
                topBtns: app.controlsModel.attributes[e+'Sorted'].slice(0, 11)
            }
        });
        app.controlsModel.set({'switchRefObj': this.switchRefObj})
        this.listenTo(app.controlsModel, 'rowToggle', this.toggleBtnRow);
        return this;
    },
    toggleBtnRow: function (rowId) {
        var selector = $("#"+rowId+"-btnRow")
        if (!this.switchRefObj[rowId].btnRow) {
            this.switchRefObj[rowId].btnRow = new app.BtnRowView(_.pluck(this.switchRefObj[rowId].topBtns, 'name'),rowId).render();
        } else {
            selector.slideToggle();
        }

    },
    btnRowChange: function (event,i) {
        var rowName = event.target.id;
        this.switchRefObj[rowName].isOn = !this.switchRefObj[rowName].isOn;
        app.controlsModel.trigger('rowToggle',rowName);
    },
    stopIt: function (event,i) {
        event.stopPropagation();
    },
    events: {
        'click .mdl-switch': 'btnRowChange',
        'click .resize,.capitalize,.mdl-switch__track,.mdl-switch__thumb,.mdl-switch__ripple-container': 'stopIt'
    }
});

app.BtnRowView = Backbone.View.extend({
    el: '.btn-box',
    topBtns: [],
    rowId: '',
    render: function () {
        this.$el.append(this.template(this.topBtns))
        $('#'+this.rowId+'-btnRow').slideToggle();
        return this;
    },
    initialize: function (topBtns,rowId) {
        this.topBtns = topBtns;
        this.rowId = rowId;
        var that = this;
        //_.each(this.topBtns, function(filterBtn){
        //    console.log(filterBtn)
        //});
        return this;
    },
    filterBtnClick: function (e) {
        event.stopPropagation();
        console.log('Clicked FILTER BTN');
        console.log(e.target.id)
    },
    events: {
        'click .mdl-button': 'filterBtnClick'
    }
});