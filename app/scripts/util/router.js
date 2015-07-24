
app.Router = Backbone.Router.extend({
    routes: {
        '*filter' : 'setFilter'
    },
    setFilter: function(params) {
        if (params) {
            console.log('app.router.params = ' + params); // just for didactical purposes.
            window.filter = params.trim() || '';
            app.todoList.trigger('reset');
        } else {
            //console.log('starting router');

        }

    }
});