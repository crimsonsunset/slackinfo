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

function createTextFills(inClass,options) {
    var resizeTimer;
    var currOpts = _.extend({},options)
    //init all resizes first, then debounce resizing to call it again
    $('.'+inClass).textfill(currOpts);
    $(window).on('resize', function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            $('.'+inClass).textfill(currOpts);
        }, 250);

    });
}

String.prototype.sdbm_hash = function () {
    var hash = 0;
    for (i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = char + (hash << 6) + (hash << 16) - hash;
    }
    return hash;
};

function _removeDupeTags(inArr) {
    var origArr = inArr
    var suspectWords = []
    var foundMatch = false;
    _.each(inArr, function (e, i, l) {

        if (e.split(' ').length > 1) {
            _.each(origArr, function (e2, i2, l2) {
                if (e != e2 && ((e.indexOf(e2) != -1) || (e2.indexOf(e) != -1))) {
                    foundMatch = true
                    //console.log('comparing these shits', e,"|", e2)
                    suspectWords.push({word: e, index: i})
                    suspectWords.push({word: e2, index: i2})
                }
            })
        }
    })

    //at this point, if no match is found can skip the rest
    if (!foundMatch) {
        //console.log('no matches, returning originaALLLZSS')
        return origArr
    }
    //console.log('suspectwords are ',suspectWords)

    var smallestWord = 'asdasdasdasdasasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd'
    var smallestIndex = -1
    _.each(suspectWords, function (e, i, l) {

        if (e.word.length < smallestWord.length) {
            smallestWord = e.word
            smallestIndex = e.index
        }
    })

    //console.log('suspectWords are ',suspectWords)
    //console.log('smallestWOrd is ',smallestWord)

    //todo: LOLOLOLOL :trollface:
    var badInds = _.uniq(_.pluck(_.reject(suspectWords, function (e) {
        return e.word === smallestWord
    }), 'index'))

    //console.log('goin in,', origArr)
    //console.log('badInds', badInds)

    _.each(badInds, function (e, i, l) {
        origArr.splice(e, 1)
    })
    //console.log('final answer', origArr)
    return origArr
}
