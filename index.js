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

    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('review');

    app.post('/review', async (req, res) => {
      const data = req.body;
      const store = await reviewCollection.insertOne(data);
      res.json(store);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    app.get('/users', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.get('/users/doctor/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isTeacher = false;
      if (user?.role === 'teacher') {
        isTeacher = true;
      }
      res.json({ teacher: isTeacher });
    });

    app.put('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };

      console.log(filter);
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
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