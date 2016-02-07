/**
 * Created by pc on 2016/1/27.
 */

db.locations.find();


// delete from subdocument

db.collection.update({ d : 2014001 , m :123456789},
  {$pull : { "topups.data" : {"val":NumberLong(200)} } } )


// Add locations to mongoDB by using shell
db.locations.save({
  name: 'Starcups',
  address: '125 High Street, Reading, RG6 1PS',
  rating: 3,
  facilities: ['Hot drinks', 'Food', 'Premium wifi'],
  coords: [-0.9690884, 51.455041],
  openingTimes: [{
    days: 'Monday - Friday',
    opening: '7:00am',
    closing: '7:00pm',
    closed: false
  }, {
    days: 'Saturday',
    opening: '8:00am',
    closing: '5:00pm',
    closed: false
  }, {
    days: 'Sunday',
    closed: true
  }]
});

db.locations.update({
  name: 'Cafe Hero'
}, {
  $push: {
    reviews: {
      _id: ObjectId(),
      author: 'Jackie Chen',
      rating: 5,
      timestamp: new Date("Feb 2, 2016"),
      reviewText: "It's amazing!!!."
    }
  }
})


/**
 * Heroku URL: https://mighty-meadow-29112.herokuapp.com/
 */