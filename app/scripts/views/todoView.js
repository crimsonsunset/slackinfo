// renders individual todo items list (li)
app.TodoView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#item-template').html()),
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this; // enable chained calls
    },
    initialize: function () {
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this); // remove: Convenience Backbone'
    },
    events: {
        'dblclick label': 'edit',
        'keypress .edit': 'updateOnEnter',
        'blur .edit': 'close',
        'click .toggle': 'toggleCompleted',
        'click .destroy': 'destroy'
    },
    edit: function () {
        this.$el.addClass('editing');
        this.input.focus();
    },
    close: function () {
        var value = this.input.val().trim();
        if (value) {
            this.model.save({title: value});
        }
        this.$el.removeClass('editing');
    },
    updateOnEnter: function (e) {
        if (e.which == 13) {
            this.close();
        }
    },
    toggleCompleted: function () {
        this.model.toggle();
    },
    destroy: function () {
        this.model.destroy();
    }
});


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
        console.log('showSongCard')
        app.mainView.spawnCard(new app.SongCardView({model: this.model}).render())
    },
    songChanged: function (e) {
        console.log('songchanged')
    },
    events: {
        'click .song': 'showSongCard'
    }
});

app.SongListView = Backbone.View.extend({
    el: '.song-list',
    displayArr: [],
    render: function () {
        this.$el.empty();
        this.displayArr = [];
        this.collection.each(this.addOne, this);
        return this; // enable chained calls
    },
    renderList : function(songs){
        console.log('renderList')
        this.displayArr = songs;
        this.$el.empty();
        var that = this;
        _.each(this.displayArr, function(song){
            that.addOne(song)
        });
        return this;
    },
    addOne: function (song) {
        var songView = new app.SongView({model: song});
        this.displayArr.push(song)
        this.$el.append(songView.render().el);
    },

    initialize: function () {
        console.log('init songlis view')
        console.log(this.collection)
        this.listenTo(this.model, 'search', function () {
            console.log('searchzz')
        });
    }
});

app.SongCardView = Backbone.View.extend({
    tagName: 'div',
    render: function () {
        this.$el.html(this.template(this.model.toJSON()))
        this.$el.attr('id', 'song-card-' + this.id);
        this.$(".mdl-card__media").css('background-color', randomColor({luminosity: 'dark'}));
        return this;
    },
    initialize: function () {
        this.id = this.model.cid
    }
});