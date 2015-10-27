app.SearchService = (function () {

    var A = function (libraryPath, items, keyArr, options) {
        this.libName = '';
        this.searchObj = {};
        var that = this;
        this.useModels = false;

        //support for returning/using backbone collection
        if (options.useModels) {
            this.fullArr = _.pluck(items.models, 'attributes');
            this.modelArr = items.models;
            this.useModels = true;
            for (var i = 0; i < this.fullArr.length; i++) {
                this.fullArr[i].index = i;
            }
        }else{
            this.fullArr = items
        }


        switch (libraryPath) {
            case contains(libraryPath, "fuse"):
                this.libName = "fuse";
                //higher threshold = fuzzier -- these are fuze defaults
                this.options = options || {
                        caseSensitive: false,
                        includeScore: false,
                        shouldSort: true,
                        threshold: 0.6,
                        location: 0,
                        distance: 100,
                        maxPatternLength: 32
                    }
                this.options.keys = keyArr
                loadLib(libraryPath).then(function () {
                    that.searchObj = new Fuse(that.fullArr, that.options);
                });
                break;
            case contains(libraryPath, "lunr"):
                console.log('LUNR TIME')
                this.libName = "lunr"
                loadLib(libraryPath).then(function () {
                    that.searchObj = lunr(function () {
                        for (var i = 0; i < keyArr.length; i++) {
                            this.field(keyArr[i])
                        }
                        this.ref('id');
                    })
                    for (var i = 0; i < items.length; i++) {
                        items[i].id = i
                        that.searchObj.add(items[i])
                    }

                });
                break;
            default :
                console.log("library not supported yet")
                throw "error"
        }

    };

    function contains(test, str) {
        if (test.indexOf(str) != -1) {
            return test
        } else {
            return false
        }
    }

    function loadLib(libPath) {
        return $.getScript(libPath)
            .done(function (script, textStatus) {
            })
            .fail(function (jqxhr, settings, exception) {
                console.log('failed to load search script');
            });
    }

    A.prototype.search = function(inStr){
        var retArr = [];
        switch (this.libName) {
            case "fuse":
                retArr = this.searchObj.search(inStr);
                break;
            case "lunr":
                var tempArr = this.searchObj.search(inStr);
                for (var i = 0; i < tempArr.length; i++) {
                    retArr.push(this.fullArr[tempArr[i].ref])
                }
                break;
            default :
                console.log("library not supported yet")
                throw "error"
        }
        if (this.useModels) {
            var newRetArr = [];
            for (var i = 0; i < retArr.length; i++) {
                newRetArr.push(this.modelArr[retArr[i].index])
            }
            retArr=newRetArr
        } else {

        }
        return retArr
    }


    return A;
}());