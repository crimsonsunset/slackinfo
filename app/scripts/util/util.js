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

function replaceDiacritics(s)
{
    var s;

    var diacritics =[
        /[\300-\306]/g, /[\340-\346]/g,  // A, a
        /[\310-\313]/g, /[\350-\353]/g,  // E, e
        /[\314-\317]/g, /[\354-\357]/g,  // I, i
        /[\322-\330]/g, /[\362-\370]/g,  // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];

    var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

    for (var i = 0; i < diacritics.length; i++)
    {
        s = s.replace(diacritics[i],chars[i]);
    }

    return s
}

// Asynchronously load templates located in separate .html files
function loadTemplates(views, callback) {

    var deferreds = [];

    $.each(views, function(index, view) {
        var viewName = view+'View'
        //console.log(viewName)
        if (app[viewName]) {
            console.log('inside if,', view)
            deferreds.push($.get(app.templates.path + view + '.html', function(data) {
                console.log('data from templates loaded')
                console.log(data)
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
