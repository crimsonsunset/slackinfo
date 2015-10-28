module.exports = function(app,Backbone,_,request,promise,Song){
    return Backbone.Collection.extend({
        model: Song,
        comparator: 'title',
        searchService: {},
        attributes:{},
        initialize: function () {
            console.log('starting SONGLIST')
            return this;
        },
        addToTally: function (obj,tag) {
            //initalize if needed
            var currObj = this.attributes[obj]
            var currTallyObj = (!currObj) ? this.attributes[obj] = {} : currObj;
            if (currTallyObj[tag]) {
                currTallyObj[tag].count++;
            } else {
                this.attributes[obj][tag]={name:tag,count:1};
            }
            return currTallyObj
        },
        burnItDown: function () {
            _.chain(this.models).clone().each(function (model) {
                //console.log('deleting model ' + model.id);
                model.destroy();
            });
        },
        getTallies: function () {
            return this.attributes
        }
    })

};
