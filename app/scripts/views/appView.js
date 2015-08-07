
// renders the full list of todo items calling TodoView for each one.
app.AppView = Backbone.View.extend({
    el: '#todoapp',
    initialize: function () {
        this.input = this.$('#new-todo');
        // when new elements are added to the collection render then with addOne
        app.todoList.on('add', this.addOne, this);
        app.todoList.on('reset', this.addAll, this);
        app.todoList.fetch(); // Loads list from local storage
    },
    events: {
        'keypress #new-todo': 'createTodoOnEnter'
    },
    createTodoOnEnter: function (e) {
        if (e.which !== 13 || !this.input.val().trim()) { // ENTER_KEY = 13
            return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val(''); // clean input box
    },
    addOne: function (todo) {
        //var view = new app.TodoView({model: todo});
        //$('#todo-list').append(view.render().el);

        var songView = new app.SongView({model: song});
        $('#todo-list').append(songView.render().el);
    },
    addAll: function(){
        this.$('#todo-list').html(''); // clean the todo list
        // filter todo item list
        switch(window.filter){
            case 'pending':
                _.each(app.todoList.remaining(), this.addOne);
                break;
            case 'completed':
                _.each(app.todoList.completed(), this.addOne);
                break;
            default:
                app.todoList.each(this.addOne, this);
                break;
        }
    },
    newAttributes: function () {
        return {
            title: this.input.val().trim(),
            completed: false
        }
    }
});



app.MainView = Backbone.View.extend({
    el: '#songapp',
    initialize: function () {
        console.log('init mainview')
        return this;
    },
    render: function () {
        console.log('render mainview')
        this.$el.append(this.template())
        app.songListView = new app.SongListView({collection: app.songList}).render()
        return this;
    },
    spawnCard: function (card) {
        $('.card-holder').empty().append(card.$el)
        return this;
    },
    searchChanged: function (e) {

        var inText = $(e.target).val();
        if (inText.length === 0) {
            app.songListView.render()
        }
        else if (inText.length >2) {
            app.songListView.renderList(app.songList.search(inText))
        } else {}
    },
    events: {
        'keyup .search-field': 'searchChanged'
    }
});

//app.SearchResultsListView = Backbone.View.extend({
//    el: '#search-results',
//    initialize: function () {
//        return this;
//    },
//    render: function () {
//        console.log('render mainview')
//        this.$el.append(this.template())
//        app.listView = new app.SongListView({collection: app.songList}).render()
//        return this;
//    },
//    spawnCard: function (card) {
//        $('.card-holder').empty().append(card.$el)
//        return this;
//    },
//    events: {
//        'keypress #new-todo': 'createTodoOnEnter'
//    }
//});