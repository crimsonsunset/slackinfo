var serviceArr = ['soundcloud', 'youtube', 'hypem', 'spotify']

// Asynchronously load templates located in separate .html files
function loadTemplates(views, callback) {

    var deferreds = [];

    $.each(views, function (index, view) {
        var viewName = view + 'View'
        //console.log('loading ',viewName)
        if (app[viewName]) {
            deferreds.push($.get(app.templates.path + view + '.html', function (data) {
                app[viewName].prototype.template = _.template(data);
            }));
        } else {
            console.log(view + " not found");
        }
    });
    //console.log('loaded temps inside')
    return $.when.apply(null, deferreds).done(callback);
}

String.prototype.hasUrl = function () {
    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(this)
};

String.prototype.matchesService = function () {
    var that = this
    var didMatch = false
    _.each(serviceArr, function (e, i, l) {
        if (that.indexOf(e) !== -1) {
            didMatch = true
            return true
        }
    })
    return didMatch
}

function autoSizeText() {
    var el, elements, _i, _len, _results;
    elements = $('.resize');
    console.log(elements);
    if (elements.length < 0) {
        return;
    }
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
        console.log('resizeing something')
        el = elements[_i];
        _results.push((function (el) {
            var resizeText, _results1;
            resizeText = function () {
                var elNewFontSize;
                elNewFontSize = (parseInt($(el).css('font-size').slice(0, -2)) - 1) + 'px';
                return $(el).css('font-size', elNewFontSize);
            };
            _results1 = [];
            while (el.scrollHeight > el.offsetHeight) {
                _results1.push(resizeText());
            }
            return _results1;
        })(el));
    }
    return _results;
};

function createTextFills() {
    var resizeTimer;
    //init all resizes first, then debounce resizing to call it again
    $('.resize').textfill({});
    $(window).on('resize', function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $('.resize').textfill({});
        }, 250);

    });
}

String.prototype.sdbm_hash = function() {
    var hash = 0;
    for (i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = char + (hash << 6) + (hash << 16) - hash;
    }
    return hash;
};