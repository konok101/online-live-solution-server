const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5qcqebt.mongodb.net/?retryWrites=true&w=majority`;


console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    console.log("DB connected Successfully");
    const database = client.db('educationalLiveSolu');

    const reviewCollection = database.collection('review');

    app.post('/review', async (req, res) => {
      const data = req.body;
      const store = await reviewCollection.insertOne(data);
      res.json(store);
    });














  } finally { 
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', async(req, res) => {
  res.send('Hello Worlddddddddddddddd!')
})

app.listen(port, () => {
  console.log(`Educational Live Solu listening on port ${port}`)
})