app.Song = Backbone.Model.extend({
    defaults: {
        title: '',
        artist: '',
        artist_info: {},
        tags: [],
        url: '',
        contributor: '',
        service: '',
        thumbnail: '',
        description: ''
    },
    promise : {},
    initialize: function(attr) {
        this.set('attributes',attr)
    },




    fetchSongData: function () {
        var artistStr = encodeURIComponent(this.get('artist'))
        var that = this;
        //console.log('MAKING CALL TO API BROOOO')
        var def = $.getJSON(this.MUSIC_API_STR + this.ARTIST_QUERY_STR + artistStr + this.KEY_STR + this.FMT_STR)
            .done(function (data) {

                if (data.error) {
                    //console.log('got an erorrzz',def)
                    //console.log(def.promise().promise())
                    //def.promise().reject(this,['failtime'])
                    return -1;
                }
                //use url as unique to avoid dupes [hash no bueno]
                that.set('artist_info', data.artist)

                //remove duplicate-ish tags
                var filteredTags = _removeDupeTags(_.pluck(data.artist.tags.tag, 'name'))
                //var filteredTags = _.pluck(data.artist.tags.tag, 'name')
                that.set('tags', filteredTags)
                //that.set('hashzzz',that.get('url').sdbm_hash())
                _.each(that.get('tags'), function (tag) {
                    app.controlsModel.addToTally('tags', tag)
                });
                $.ajax({
                    url: "http://localhost:8080/api/song",
                    method: "POST",
                    contentType: 'application/json',
                    data: JSON.stringify(that)
                })
                    .done(function (data) {
                        //console.log('post to NODE IS DONE BTUH')
                        //console.log(data)
                    })
            })
            .fail(function (data) {
                console.log("failed fetching song data");
            });
        return def
    }
});