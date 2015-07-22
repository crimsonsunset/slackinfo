
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
    el: '.song',
    render: function () {
        console.log('redner time for song')
        return this.template(this.model.attributes); // enable chained calls
    },
    initialize: function () {
    },
    events: {
    }
});

app.SongListView = Backbone.View.extend({
    el: '.song-list',
    render: function () {

        var that = this
        _.each(this.collection.models, function(e,i,l){
            that.$el.append(new app.SongView({model:e}).render())
        });

        return this; // enable chained calls
    },
    initialize: function () {
        console.log('initializingg list')
        console.log(this)
    },
    events: {
    }
});