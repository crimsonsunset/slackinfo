//templates are loaded from loadTemplates() in util
app.SongView = Backbone.View.extend({
    tagName: 'div',
    render: function () {
        var d = this.template(this.model.toJSON())
        this.$el.html(d)
        //this.$(".song").css('background-color', randomColor({luminosity: 'light'}));
        return this;
    },
    initialize: function () {
        var d = new Date(Number(this.model.get('date')))
        this.model.set('prettyDate',makeDatePretty(d) )
        return this;
    },
    showSongCard: function (e) {
        console.log('showSongCard', this.model.id)
        $('#' + this.model.id).slideToggle()

        //app.mainView.spawnCard(new app.SongCardView({model: this.model}).render())
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
    numRendered: 0,
    chunk: 10,
    spinner: '<div class="spinner-holder"><div class="mdl-spinner mdl-js-spinner is-active spinner"></div></div>',
    initialize: function () {
        app.controlsModel.set({'currSongList': this.collection.models});

        //watch the currSongList for changes, which will happen when search or filter occurs
        var that = this
        this.listenTo(app.controlsModel, 'change:currSongList', function (data) {
            console.log('triggering herez')
            that.numRendered=0
            that.renderList(data.get('currSongList'))
        });
        this.infiniteScroll();
        return this;
    },
    render: function () {
        console.log('RENDERING songlist')
        this.$el.empty();
        this.collection.each(this.addOne, this);
        createTextFills('song-text', {minFontPixels: 15, maxFontPixels: 23})
        return this; // enable chained calls
    },
    renderChunk: function () {
        console.log('rendner chunk, starting at', this.numRendered)
        for (var i = 0; i < this.chunk; i++) {
            if (app.controlsModel.get('currSongList')[this.numRendered]) {
                this.addOne(app.controlsModel.get('currSongList')[this.numRendered]);
                this.numRendered++;
            }
        }
        createTextFills('song-text', {minFontPixels: 15, maxFontPixels: 23})
        return this; // enable chained calls
    },
    renderList: function (songs) {
        console.log('renderList');
        this.$el.empty();
        var that = this;
        this.renderChunk();
        return this;
    },
    addOne: function (song) {
        var songView = new app.SongView({model: song});
        this.$el.append(songView.render().el);
    },
    infiniteScroll: function () {
        //todo: figure out why scroll event doesnt work, fix spinner
        var that = this
        this.$el.bind('scroll', function(){
            if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight){
                console.log("hit bottom",app.songList.models.length, that.numRendered)
                if (that.numRendered < app.controlsModel.get('currSongList').length) {
                    console.log("REACHED BOTTOM, CALLING");
                    that.renderChunk();
                    that.$el.append(that.spinner);
                    componentHandler.upgradeDom();
                    setTimeout(function () {
                        $('.spinner-holder').remove( ".spinner-holder" )
                    },1500)
                }
            }
        });
    },
    //doesnt work?? wtf
    events: {
        'scroll .song-list': 'infiniteScroll'
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
    el: '#headerCont',
    searchField: {},
    fromKeyboard: false,
    render: function () {
        var that = this;
        this.$el.html(this.template());
        this.searchField = $('#search')
        this.listenTo(app.controlsModel, 'click-filterBtn', function (data) {
            $('.mdl-textfield--expandable').addClass('is-focused');
            $('.mdl-textfield__input').val(data);
            that._searchFor(data)
        });
        return this;
    },
    initialize: function () {
        //this.id = this.model.cid
    },
    searchChanged: function (e) {
        console.log(this.fromKeyboard)
        if (!this.fromKeyboard) {
            var inText = $(e.target).val();
            this._searchFor(inText)
            app.controlsModel.trigger('searchFor', inText);
        }else{
            this.fromKeyboard=false
        }
    },
    _searchFor: function (inText) {
        var currSongList = app.controlsModel.get('currSongList')
        if (inText.length <= 2) {
            app.controlsModel.set({'currSongList': app.songList.models});
        }
        else if (inText.length > 2) {
            //var testArr = app.songList.basicSearch(inText)
            var testArr = app.songList.fuzzySearch(inText)
            //todo: a bit of a hack, CID prevents isEqual from working as expected.
            //making them all NA to pass test when necessary.
            _.each(testArr, function (e, i, l) {
                e.cid = 'NA'
            });
            if (!_.isEqual(testArr, currSongList)) {
                //setting the controls model will trigger a view update cuz view is listening for change
                app.controlsModel.set({'currSongList': testArr});
            }
        } else {
        }
    },
    events: {
        'click #search-btn': function(e){
            console.log('asdasz')
            if (e.clientX == 0) {
                this.fromKeyboard = true
            }
        },
        'keyup .search-field': 'searchChanged'
    }
});

//tags,contributors,service
app.SwitchView = Backbone.View.extend({
    el: '.switch-box',
    switchRefObj: {},
    render: function () {
        this.$el.append(this.template(this.switchRefObj))
        return this;
    },
    initialize: function (configObj) {
        var that = this;
        //take top 12 tags to make the buttons
        console.log(app.controlsModel.get('filterList'))
        _.each(app.controlsModel.get('filterList'), function (e, i, l) {
            that.switchRefObj[e] = {
                name: e,
                isOn: false,
                topBtns: app.controlsModel.attributes[e + 'Sorted'].slice(0, 12)
            }
            //slice(0, 12)
        });
        app.controlsModel.set({'switchRefObj': this.switchRefObj})
        this.listenTo(app.controlsModel, 'rowToggle', this.toggleBtnRow);
        this.listenTo(app.controlsModel, 'searchFor', this.findBtnBySearch);
        return this;
    },
    toggleBtnRow: function (rowId) {
        var selector = $("#" + rowId + "-btnRow")
        if (!this.switchRefObj[rowId].btnRow) {
            this.switchRefObj[rowId].btnRow = new app.BtnRowView(_.pluck(this.switchRefObj[rowId].topBtns, 'name'), rowId).render();
        } else {
            selector.slideToggle();
        }

    },
    btnRowChange: function (event, fromKeyboard) {
        //for keyboard shortcuts
        if (event.clientX != 0) {
            var rowName = event.target.id;
            this.switchRefObj[rowName].isOn = !this.switchRefObj[rowName].isOn;
            app.controlsModel.trigger('rowToggle', rowName);
        }
    },
    findBtnBySearch: function (inText) {
        $('.btn-toggledOn').removeClass('btn-toggledOn')
        _.each(this['switchRefObj'], function (e, i, l) {
            if (e.btnRow) {
                e.btnRow.$el.find("span").filter(function () {
                    return $(this).text() == inText;
                }).parent().addClass('btn-toggledOn')
            }
        })
    },
    stopIt: function (event, i) {
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
    btnWidth: 1,
    rowId: '',
    render: function () {
        console.log('rendering buttn row', this.btnWidth)
        this.$el.append(this.template(this.topBtns))
        $('#' + this.rowId + '-btnRow').slideToggle();
        createTextFills('filter-btn', {minFontPixels: 10})
        return this;
    },
    initialize: function (topBtns, rowId) {
        this.topBtns = topBtns;
        this.rowId = rowId;
        this.btnWidth = (12 / topBtns.length < 2) ? 1 : Math.floor(12 / topBtns.length);
        //console.log('btnWidth is: ', this.btnWidth)
        return this;
    },
    filterBtnClick: function (e) {
        e.stopPropagation();
        var btnName = $(e.target).attr('data')
        var target = (e.target.localName == 'span') ? e.target.parentNode : e.target
        //console.log('Clicked FILTER BTN',btnName);
        //console.log(e.target.localName);
        //todo: add support for multi filters
        $('.btn-toggledOn').removeClass('btn-toggledOn')
        $(target).addClass('btn-toggledOn')
        app.controlsModel.trigger('click-filterBtn', btnName);
    },
    events: {
        'click .mdl-button': 'filterBtnClick'
    }
});