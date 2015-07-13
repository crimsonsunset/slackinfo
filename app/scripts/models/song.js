app.Todo = Backbone.Model.extend({
    defaults: {
        title: '',
        completed: false

    }
});

app.Song = Backbone.Model.extend({
    defaults: {
        title: '',
        artist: '',
        url: '',
        contributor: '',
        service: '',
        thumbnail: '',
        description: ''
    },
    initialize: function(inMsg) {

        this.contributor = getUser(inMsg.user)
        if (inMsg.attachments) {
            this.service = inMsg.attachments[0].service_name || ''
            this.title = inMsg.attachments[0].title || ''
            this.description = inMsg.attachments[0].text || ''
            this.url = inMsg.attachments[0].title_link || ''
            this.thumbnail = inMsg.attachments[0].thumb_url || ''

        } else {
            //todo: services that dont have integration blocks (added hypem here)
            this.url = inMsg.text.split('<')[1].split('>')[0];
        }
    }
});