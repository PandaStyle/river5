var _ = require('lodash');
var request = require('request');
var jsonfile = require('jsonfile')
var feedAccounts = require('./feedAccounts')
var moment = require('moment');


var file = '../rivers/all.json';
 jsonfile.readFile(file, function(err, body) {

    if (err) {
        console.error("error reading json file ", err);
        throw error;
    }


        var res = [];

        var stats = {
            imageFromEnclosure: 0,
            imageFromMeta: 0,
            imageFromIneed: 0,
            noImage: 0
        }

        _.forEach(body["updatedFeeds"]["updatedFeed"], function(elem){

            function getImage(_item){
                var image_placeholder_url = "http://www.engraversnetwork.com/files/placeholder.jpg";

                if(_item.imageFromEnclosure) {
                    stats.imageFromEnclosure++;
                    return _item.imageFromEnclosure;
                } else if(_item.imageFromMeta) {
                    stats.imageFromMeta++;
                    return _item.imageFromMeta;
                } else if(_item.imageFromIneed && _item.imageFromIneed.src){
                    stats.imageFromIneed++;
                    return _item.imageFromIneed.src;
                } else {
                    stats.noImage++;
                    console.log("No image represented for item: ", _item);
                    return image_placeholder_url;
                }
            }



            _.forEach(elem.item, function(item){

                var ft = '';

                if(_.find(feedAccounts, { 'url': elem.websiteUrl})){
                    ft = _.find(feedAccounts, { 'url': elem.websiteUrl}).name
                } else if(!_.isNull(elem.feedTitle)) {
                    ft = elem.feedTitle.split('-')[0]
                } else {
                    ft = "bdcnetwork"
                }

                res.push({
                    id: item.id,
                    summary: item.body,
                    title: item.title,
                    link: item.link,
                    feed: ft,
                    published: item.pubDate,
                    image: getImage(item),
                    diff: moment.duration(moment().diff(moment(new Date(elem.whenLastUpdate)))).humanize(),

                    websiteUrl: elem.websiteUrl,
                    websiteDesc: _.find(feedAccounts, { 'url': elem.websiteUrl}) ? _.find(feedAccounts, { 'url': elem.websiteUrl}).name : elem.feedDescription,
                    whenLastUpdate: elem.whenLastUpdate
                });

            })

        });
        
        console.log(stats);

})