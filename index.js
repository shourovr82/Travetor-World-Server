const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
console.log(process.env)
const app = express();
const port = process.env.PORT || 5000;


// middlewares
app.use(cors());
app.use(express.json());
// database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ikwqeh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log('Travetor server is running on ', uri);
})


