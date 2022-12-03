const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { ServerApiVersion, MongoClient, ObjectId } = require('mongodb');

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



//  verify jwt 
function verifyJWT(req, res, next) {
  const userToken = req.headers.authorization;
  if (!userToken) {
    return res.status(401).send({ message: 'Un Authorized Access' });
  }

  const token = userToken.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: 'un authorized Access' })
    }
    req.decoded = decoded;
    next();
  }
  )

}


//  run function 

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
      const services = await cursor.toArray();
      const sortedServices = (services.sort((a, b) => new Date(b.date) - new Date(a.date)));
      const latestServices = sortedServices.splice(0, 3);
      res.send(latestServices);
    })

    // get Service Details 
    app.get('/serviceDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service)
    })

    // get  specific service customer reviews

    app.get('/reviews', async (req, res) => {
      const serviceTitle = req.query?.serviceName;
      let newQuery = {};
      if (req.query?.serviceName) {
        newQuery = {
          title: serviceTitle
        }
      }
      const cursor = reviewsCollection.find(newQuery);
      const reviews = await cursor.toArray();
      const sortedReviews = (reviews.sort((a, b) => new Date(a.date) - new Date(b.date)));
      res.send(sortedReviews)
    })



    // get user reviews or my reviews
    app.get('/myreview', verifyJWT, async (req, res) => {
      const useremail = req.query?.email;
      const decoded = req.decoded;

      if (decoded?.email !== req.query?.email) {
        res.status(403).send({ message: 'Request Forbidden , Login again !' })
      }

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

    //  add service

    app.post('/addService', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result)
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
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    })

    // update user review
    app.put('/userReview/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const review = req.body;
      const option = { upsert: true };
      const updatedReview = {
        $set: {
          ratings: review.ratings,
          message: review.message
        }
      }
      const result = await reviewsCollection.updateOne(filter, updatedReview, option);
      res.send(result)
    })


    //  jwt web token
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.send({ token })
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


