var app = app || {}; // create namespace for our app


$(document).ready(function(){

    console.log('doc ready')

    //var todo = new app.Todo({title: 'Learn Backbone.js', completed: false}); // create object with the attributes specified.
    //todo.get('title'); // "Learn Backbone.js"
    //todo.get('completed'); // false
    //todo.get('created_at'); // undefined
    //todo.set('created_at', Date());
    //console.log(todo.get('created_at'))
    //
    //
    //// instance of the Collection
    //app.todoList = new app.TodoList();
    //
    //var todoList = new app.TodoList()
    //todoList.create({title: 'Learn Backbone\'s Collection'}); // notice: that `completed` will be set to false by default.
    //var lmodel = new app.Todo({title: 'Learn Models', completed: true});
    //todoList.add(lmodel);
    //todoList.pluck('title');     // ["Learn Backbone's Collection", "Learn Models"]
    //todoList.pluck('completed'); // [false, true]
    //JSON.stringify(todoList);    // "[{
    //
    //
    ////--------------
    //// Initializers
    ////--------------
    //
    //app.appView = new app.AppView();



    //start joe stuff

    app.songList = new app.SongList();
    $.when(app.songList.fetchSongs(),
        loadTemplates(app.templates.names, function(){}))
        .then( init );

    function init(){
        console.log('init time')
        //var view = new app.SongView({model: app.Song});
        //$('#todo-list').append(view.render().el);

        app.mainView = new app.MainView();


        app.router = new app.Router();
        Backbone.history.start();
    }

});