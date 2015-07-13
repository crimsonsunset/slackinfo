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

function hasUrl(s) {
    //var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    //return regexp.test(s) && s.indexOf('facebook.com') > -1;

    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(s)

}

String.prototype.hasUrl = function () {
    return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(this)
};

String.prototype.matchesService = function () {

    var doesMatch = false;
    var that = this
    var didMatch=false
    _.each(serviceArr, function (e, i, l) {
        doesMatch = (that.indexOf(e) !== -1) ? true : false
        if (doesMatch) {
            didMatch = true
            return true
        }
    })
    return didMatch
}
