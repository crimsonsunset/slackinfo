var userObj = {
    'U06HEA4DP': 'Joe',
    'U06J76HFC': 'Sang',
    'U06J9BRL0': 'Choe',
    'U06J2UTA6': 'Alex',
    'U06JAHAV7': 'James',
    'llll': 'Gutz'
}

var serviceArr = ['soundcloud', 'youtube', 'hypem', 'spotify']

//todo: figure out a better less hard coded way to do this
function getUser(ind) {
    return userObj[ind]
}

// Asynchronously load templates located in separate .html files
function loadTemplates(views, callback) {

    var deferreds = [];

    $.each(views, function(index, view) {
        var viewName = view+'View'
        if (app[viewName]) {
            deferreds.push($.get(app.templates.path + view + '.html', function(data) {
                app[viewName].prototype.template = _.template(data);
            }));
        } else {
            console.log(view + " not found");
        }
    });
    console.log('loaded temps inside')
    return $.when.apply(null, deferreds).done(callback);
}

String.prototype.hasUrl = function () {
    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(this)
};

String.prototype.matchesService = function () {
    var that = this
    var didMatch=false
    _.each(serviceArr, function (e, i, l) {
        if (that.indexOf(e) !== -1) {
            didMatch = true
            return true
        }
    })
    return didMatch
}
