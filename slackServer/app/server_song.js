module.exports = function(app,Backbone,_,request,promise,lastFMKey){
    return Backbone.Model.extend({
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
        KEY_STR : lastFMKey,
        FMT_STR : '&format=json',
        promise : {},
        initialize: function(inMsg) {

            this.set('contributor',app.users[inMsg.user])
            app.songList.addToTally('contributors',this.get('contributor'))

            if (inMsg.attachments) {
                this.set({service: inMsg.attachments[0].service_name || ''})
                //this.set({title: inMsg.attachments[0].title || ''})
                this.set({description: inMsg.attachments[0].text || ''})
                this.set({url: inMsg.attachments[0].title_link || ''})
                this.set({thumbnail: inMsg.attachments[0].thumb_url || ''})

                //artists come in differently per service
                var currService = this.get('service').toLowerCase();

                app.songList.addToTally('services',currService)

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
            this.promise = this.fetchSongData();

        },
        fetchSongData: function () {
            var artistStr = encodeURIComponent(this.get('artist'))
            var that = this;
            //console.log('MAKING CALL TO API BROOOO')
            return request(this.MUSIC_API_STR + this.ARTIST_QUERY_STR + artistStr + this.KEY_STR + this.FMT_STR,function (error, response, body) {

                if (!error && response.statusCode == 200) {

                    var data = JSON.parse(response.body)
                    if (data.error) {
                        return -1;
                    }
                    //use url as unique to avoid dupes [hash no bueno]
                    that.set('artist_info', data.artist)

                    //remove duplicate-ish tags
                    var filteredTags = that._removeDupeTags(_.pluck(data.artist.tags.tag, 'name'))
                    //var filteredTags = _.pluck(data.artist.tags.tag, 'name')
                    that.set('tags', filteredTags)
                    _.each(that.get('tags'), function (tag) {
                        app.songList.addToTally('tags', tag)
                    });
                }
            }).promise()
        },
        //todo: clean this up or leave it impossible to read on purpose??
        _removeDupeTags: function(inArr){
            var origArr = inArr
            var suspectWords = []
            var foundMatch = false;
            _.each(inArr, function (e, i, l) {

                if (e.split(' ').length > 1) {
                    _.each(origArr, function (e2, i2, l2) {
                        if (e != e2 && ((e.indexOf(e2) != -1) || (e2.indexOf(e) != -1))) {
                            foundMatch = true
                            suspectWords.push({word: e, index: i})
                            suspectWords.push({word: e2, index: i2})
                        }
                    })
                }
            })

            //at this point, if no match is found can skip the rest
            if (!foundMatch) {
                return origArr
            }

            var smallestWord = 'asdasdasdasdasasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd'
            var smallestIndex = -1
            _.each(suspectWords, function (e, i, l) {

                if (e.word.length < smallestWord.length) {
                    smallestWord = e.word
                    smallestIndex = e.index
                }
            })

            //todo: LOLOLOLOL :trollface:
            var badInds = _.uniq(_.pluck(_.reject(suspectWords, function (e) {
                return e.word === smallestWord
            }), 'index'))

            _.each(badInds, function (e, i, l) {
                origArr.splice(e, 1)
            })
            return origArr
        }
    });
}

