app.ControlsModel = Backbone.Model.extend({
    defaults: {
        showHeader: false
    },
    currSongList : [],
    tagTallyObj : {},
    sortedTags : [],
    filterList : ['Top Tags', 'Genre','Contributors', 'Service'],
    initialize: function () {
        console.log('init controls model')
    },
    sortTags: function () {
        this.sortedTags = _.sortBy(_.toArray(this.tagTallyObj), 'count').reverse();
    },
    addTagToTally: function (tag) {
        console.log('adding to tally')
        if (this.tagTallyObj[tag]) {
            this.tagTallyObj[tag].count++;
        } else {
            this.tagTallyObj[tag]={name:tag,count:1};
        }
        return this.tagTallyObj
    }
});
