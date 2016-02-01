/**
 * Created by pc on 2016/1/27.
 */

db.locations.find();


// delete from subdocument

db.collection.update({ d : 2014001 , m :123456789},
  {$pull : { "topups.data" : {"val":NumberLong(200)} } } )



db.locations.update({
  name: 'Starcups'
}, {
  $push: {
    reviews: {
      _id: ObjectId(),
      author: 'Yun Xu',
      rating: 3,
      timestamp: new Date("Jan 30, 2016"),
      reviewText: "Just soso."
    }
  }
})

/**
 * Heroku URL: https://mighty-meadow-29112.herokuapp.com/
 */