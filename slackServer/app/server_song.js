module.exports = function (app, Backbone, _, request, promise, lastFMKey) {
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
            description: '',
            date: '',
            isValid: true
        },
        MUSIC_API_STR: 'http://ws.audioscrobbler.com/2.0/',
        HYPEM_API_STR: 'https://api.hypem.com/v2/tracks/',
        ARTIST_QUERY_STR: '?method=artist.getinfo&artist=',
        KEY_STR: lastFMKey,
        HYPEM_KEY_STR: '?key=swagger',
        FMT_STR: '&format=json',
        promise: {},
        nonIntegratedServiceArr: ['hypem'],
        talliedAttrs: ['contributor', 'service', 'tags'],
        initialize: function (inMsg, fromBackup) {
            var that = this;
            if (fromBackup) {
                _.each(inMsg, function (e, i, l) {
                    that.set(i, e)
                    if (that.talliedAttrs.indexOf(i) != -1) {
                        if (i == 'tags') {
                            _.each(that.get(i), function (tag) {
                                app.songList.addToTally('tags', tag)
                            });
                        } else {
                            app.songList.addToTally(i + 's', that.get(i))
                        }
                    }
                })
                return;
            }

            this.set('contributor', app.users[inMsg.user])
            //todo: is this actually really the time? nobody really knows. fuck you timestamps
            this.set('date', String(inMsg.ts).replace(".", "").slice(0, 13))
            app.songList.addToTally('contributors', this.get('contributor'))

            if (inMsg.attachments) {

                this.set({service: inMsg.attachments[0].service_name || ''})
                //this.set({title: inMsg.attachments[0].title || ''})
                this.set({description: inMsg.attachments[0].text || ''})
                this.set({url: inMsg.attachments[0].title_link || ''})
                this.set({thumbnail: inMsg.attachments[0].thumb_url || ''})

                //artists come in differently per service
                var currService = this.get('service').toLowerCase();

                app.songList.addToTally('services', currService)

                switch (currService) {
                    case 'soundcloud':
                        try {
                            this.set({artist: inMsg.attachments[0].author_name.split('(')[0].trim() || ''})
                            var splitInd = inMsg.attachments[0].title.search(/\bby /g);
                            this.set({title: inMsg.attachments[0].title.slice(0, splitInd).trim() || ''})
                        }
                        catch (err) {
                            this.set('isValid', false)
                            console.log('ERRONEOUS SOUNDCLOUD SONG')
                        }
                        break;
                    case 'spotify':
                        try {
                            var songAttrArr = inMsg.attachments[0].title.split('-');
                            this.set({artist: songAttrArr[0].trim() || ''});
                            this.set({title: songAttrArr[1].trim() || ''});
                        }
                        catch (err) {
                            this.set('isValid', false)
                            console.log('ERRONEOUS SPOTIFY SONG')
                        }
                        break;
                    case 'youtube':
                        try {
                            //todo: this isnt right, but not getting any better info rite now
                            this.set({title: inMsg.attachments[0].title || ''})
                            this.set({artist: inMsg.attachments[0].author_name || ''})
                        }
                        catch (err) {
                            this.set('isValid', false)
                            console.log('ERRONEOUS YOUTUBE SONG')
                        }
                        break;
                    default:
                        console.log('wtf is this-- unsupported msg type', inMsg)
                        this.set('isValid', false)
                        break;
                }
                that._cleanUpAndGetMetaData()

            }


            else {

                this.promise = new promise(function (resolve, reject) {

                    //check that its in the supported service list
                    var serviceName = false;
                    _.each(that.nonIntegratedServiceArr, function (e, i, l) {
                        if (inMsg.text.indexOf(e) != -1) {
                            serviceName = e;
                            return;
                        }
                    });

                    //error handling for wierd messages / non supported
                    if (serviceName == false) {
                        that.set('isValid', false)
                        resolve(false)
                    } else {
                        //todo: services that dont have integration blocks (added hypem here)
                        //todo: add more fuckin integrations [hypem] https://api.hypem.com/api-docs/#!/tracks/item_get
                        switch (serviceName) {
                            case 'hypem':
                                try {
                                    that.set({url: inMsg.text.split('<')[1].split('>')[0] || ''})
                                    that.set({service: serviceName || ''})
                                    var decodedStr = decodeURI(that.get('url')).replace(/\+/g, '');
                                    var halfStr = decodedStr.slice(decodedStr.lastIndexOf("track/") + 6)
                                    var trackId = halfStr.slice(0, halfStr.lastIndexOf("/"))
                                    that.getTagsFromHypem(trackId).then(function (res) {
                                        console.log('done getting hypem data', res)
                                        resolve(that._cleanUpAndGetMetaData())
                                    }).catch(function (res) {
                                        that.set('isValid', false)
                                        console.log('FAILEDZZ HypemData')
                                        resolve(false)
                                    })

                                }
                                catch (err) {
                                    that.set('isValid', false)
                                    console.log('ERRONEOUS HYPEM SONG')
                                    resolve(false)
                                }
                                break;
                            default:
                                console.log('wtf is that-- unsupported CRAZY msg type', inMsg)
                                that.set('isValid', false)
                                resolve(false)
                                break;
                        }
                    }
                });
            }


        },
        fetchSongData: function () {
            var artistStr = encodeURIComponent(this.get('artist'))
            var that = this;
            return request(this.MUSIC_API_STR + this.ARTIST_QUERY_STR + artistStr + this.KEY_STR + this.FMT_STR, function (error, response, body) {

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
        getTagsFromHypem: function (trackId) {
            var that = this;
            return request(this.HYPEM_API_STR + trackId + this.HYPEM_KEY_STR, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(response.body)
                    if (data.error) {
                        return -1;
                    }
                    that.set({artist: data.artist || ''})
                    that.set({title: data.title || ''})
                    console.log('done setting hypem DATA')
                }
                if(error){
                    console.log('got an error from hypem API')
                    return false
                }
            }).promise()
        },
        //todo: clean this up or leave it impossible to read on purpose??
        _cleanUpAndGetMetaData: function () {
            //must remove slashes from all artist name since they will break the get call
            this.set({artist: this.get('artist').replace('/', '')})

            //final check, if no artist its invalid
            if (this.get('artist').length == 0) {
                this.set('isValid', false)
            }
            this.promise = this.fetchSongData();
            return this.promise;

        },
        _removeDupeTags: function (inArr) {
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

