const express = require('express');
const cors = require('cors');
const { ServerApiVersion, MongoClient, ObjectId, ObjectID } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json());
// database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ikwqeh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    const serviceCollection = client.db('travetorWorld').collection('services');
    const reviewsCollection = client.db('travetorWorld').collection('reviews')


    // get services data
    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    })
    app.get('/servicesHome', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    })

    // get Service Details 
    app.get('/serviceDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service)
    })

    // get customer reviews

    app.get('/reviews', async (req, res) => {
      const serviceTitle = req.query?.serviceName;
      console.log(serviceTitle);
      let newQuery = {};
      if (req.query?.serviceName) {
        newQuery = {
          title: serviceTitle
        }
      }
      const cursor = reviewsCollection.find(newQuery);
      const reviews = await cursor.toArray();
      res.send(reviews)
    })


    // get user reviews or my reviews
    app.get('/myreview', async (req, res) => {
      const useremail = req.query?.email;
      let query = {};
      if (req.query?.email) {
        query = {
          email: useremail
        }
      }
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews)

    })

    // post customer reviews
    app.post('/postReview', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(review)
    })

    // delete my review
    app.delete('/deleteReview/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })

    // update user review
    app.put('/userReview/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      console.log(review);
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          ratings: review.ratings,
          message: review.message
        }
      }
      console.log('object');
      const result = await reviewsCollection.updateOne(filter, updatedReview, option);
      res.send(result)


    })







  }
  finally { }
}

run().catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log('Travetor server is running on ', port);
})


