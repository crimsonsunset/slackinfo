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
            //console.log(song)
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
    searchField: {},
    render: function () {
        console.log('rendering headerrzzz')
        var that = this;
        this.$el.html(this.template());
        this.searchField = $('#search')
        this.listenTo(app.controlsModel, 'click-filterBtn', function (data) {
            $('.mdl-textfield__input').val(data).parent().addClass('is-dirty');
            //that.searchField.val(data).parent().addClass('is-focused');
            that._searchFor(data)
        });
        return this;
    },
    initialize: function () {
        //this.id = this.model.cid
    },
    searchChanged: function (e) {
        var inText = $(e.target).val();
        this._searchFor(inText)
    },
    _searchFor: function(inText){
        var currSongList = app.controlsModel.get('currSongList')
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
    helloz: function(inText){
        console.log('hellozzzz', inText)
    },
    events: {
        'keyup .search-field': 'searchChanged',
        'change .search-field': 'helloz'
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
        //clean the list for duplicate type tags


        _.each(app.controlsModel.get('filterList'), function(e,i,l){
            that.switchRefObj[e] = {
                name:e,
                isOn:false,
                topBtns: app.controlsModel.attributes[e+'Sorted'].slice(0, 12)
                //topBtns: that._cleanArr(app.controlsModel.attributes[e+'Sorted'])
            }
            //slice(0, 12)
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
    _cleanArr: function (arr) {
        //todo: this shit
        var origArr = arr
        _.each(arr, function(e,i,l){

            if (e.name.split(' ').length >1) {
                console.log('okayyyy, the word is: ',e.name)
                _.each(origArr, function(e2,i2,l2){
                    if (e.name != e2.name) {
                        console.log('comparing these shits', e.name,"|", e2.name)
                        _.each(e.name.split(' '), function(wordInTag,i2,l2){
                            //console.log(wordInTag)
                            if (e2.name.indexOf(wordInTag)!= -1) {
                                console.log('FOUND ONE')
                                console.log(wordInTag)
                            } else {

                            }
                        })

                    }
                })
            }
        })
        return arr
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
        $('#'+this.rowId+'-btnRow').slideToggle();
        createTextFills('filter-btn', {minFontPixels: 10})
        return this;
    },
    initialize: function (topBtns,rowId) {
        this.topBtns = topBtns;
        this.rowId = rowId;
        this.btnWidth = (12 / topBtns.length < 2) ? 1 : Math.floor(12 / topBtns.length);
        console.log('btnWidth is: ', this.btnWidth)

        return this;
    },
    filterBtnClick: function (e) {
        event.stopPropagation();
        var btnName = $(e.target).attr('data')
        var target = (e.target.localName == 'span') ? e.target.parentNode : e.target
        console.log('Clicked FILTER BTN',btnName);
        console.log(e.target.localName);
        //todo: add support for multi filters
        $('.btn-toggledOn').removeClass('btn-toggledOn')
        $(target).addClass('btn-toggledOn')
        app.controlsModel.trigger('click-filterBtn',btnName);
    },
    events: {
        'click .mdl-button': 'filterBtnClick'
    }
});