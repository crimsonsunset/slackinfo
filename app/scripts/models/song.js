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
    MUSIC_API_STR : 'http://ws.audioscrobbler.com/2.0/',
    ARTIST_QUERY_STR : '?method=artist.getinfo&artist=',
    KEY_STR : '&api_key=2c1f6dc5af310f10ddf07f0dd8492741',
    FMT_STR : '&format=json',
    promise : {},
    initialize: function(inMsg) {
        this.contributor = getUser(inMsg.user)
        app.controlsModel.addToTally('contributors',this.contributor)
        if (inMsg.attachments) {
            this.set({service: inMsg.attachments[0].service_name || ''})
            //this.set({title: inMsg.attachments[0].title || ''})
            this.set({description: inMsg.attachments[0].text || ''})
            this.set({url: inMsg.attachments[0].title_link || ''})
            this.set({thumbnail: inMsg.attachments[0].thumb_url || ''})

            //artists come in differently per service
            var currService = this.get('service').toLowerCase();
            app.controlsModel.addToTally('services',currService)
            switch(currService){
                case 'soundcloud':
                    this.set({artist:inMsg.attachments[0].author_name.split('(')[0].trim() || ''})
                    var splitInd = inMsg.attachments[0].title.search(/\bby /g);
                    this.set({title:inMsg.attachments[0].title.slice(0,splitInd).trim() || ''})
                    break;
                case 'spotify':
                    var songAttrArr = inMsg.attachments[0].title.split('-');
                    this.set({artist: songAttrArr[0].trim() || ''});
                    this.set({title: songAttrArr[1].trim() || ''});
                    break;
                case 'youtube':
                    //todo: this isnt right, but not getting any better info rite now
                    this.set({title: inMsg.attachments[0].title || ''})
                    this.set({artist: inMsg.attachments[0].author_name || ''})
                    break;
                default:
                    console.log('default')
                    this.set({artist: 'NO_ARTIST'})
                    break;
            }

        } else {
            //todo: services that dont have integration blocks (added hypem here)
            this.set({url: inMsg.text.split('<')[1].split('>')[0] || ''})
            this.set({service: 'hypem' || ''})
            var decodedStr = decodeURI(this.get('url')).replace(/\+/g,'');
            var songAttrArr = decodedStr.split('-');
            var title = songAttrArr[0].slice(songAttrArr[0].lastIndexOf("/")+1)
            this.set({artist: title.trim() || ''});
            this.set({title: songAttrArr[1].trim() || ''});
        }
        //must remove slashes from all artist name since they will break the get call
        this.set({artist:this.get('artist').replace('/','')})
        this.promise = this.fetchSongDataz();

    },
    fetchSongData: function() {
        var artistStr = encodeURIComponent(this.get('artist'))
        var that = this
        return $.getJSON(this.MUSIC_API_STR+this.ARTIST_QUERY_STR+artistStr+this.FMT_STR)
            .done(function (data) {
                //todo: figure out a better way to injest this than just taking the first one as the right one
                if (data.artists.length !== 0) {
                    var id = data.artists[0].id
                    return $.getJSON(that.MUSIC_API_STR+id+that.TAG_STR+that.FMT_STR)
                        .done(function (data) {
                            //todo: add more data here from http://musicbrainz.org/doc/Development/JSON_Web_Service#Artist
                            //if its called for
                            that.set({tags:_.pluck(data.tags, 'name')})
                        })
                } else {
                    return
                }


            })
            .fail(function (data) {
                console.log("failed fetching song data");
            });
    },
    fetchSongDataz: function() {
        var artistStr = encodeURIComponent(this.get('artist'))
        var that = this;
        console.log('MAKING CALL TO API BROOOO')
        return $.getJSON(this.MUSIC_API_STR+this.ARTIST_QUERY_STR+artistStr+this.KEY_STR+this.FMT_STR)
            .done(function (data) {
                that.set('artist_info',data.artist)
                that.set('tags',_.pluck(data.artist.tags.tag, 'name'))
                _.each(that.get('tags'), function (tag) {
                    app.controlsModel.addToTally('tags',tag)
                });
            })
            .fail(function (data) {
                console.log("failed fetching song data");
            });
    }


});