const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6df8qc8.mongodb.net/?retryWrites=true&w=majority`;
 const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
 
async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    }
    catch {

    }
  }
  next();
}

async function run() {
  try {
    
    await client.connect();
    console.log("DB connected Successfully");
    const database = client.db('educationalLiveSolu');

    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('review');
    const courseCollection = database.collection('course');
  const addCourseCollection = database.collection("addCourse");



  app.post('/addCourse', (req, res) => {
    const teacher = req.body;
    console.log(teacher);
    addCourseCollection.insertOne(teacher)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
  });

  app.get('/myCourse', async(req, res)=>{
    const email = req.query.email;
    const query= {email: email};
    const cursor= courseCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders)
  })
/*   app.get('/addCourse', (req, res) => {
    addCourseCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    }) */
    app.get('/addCourse', async (req, res) => {
      const store = await addCourseCollection.find().toArray();
      res.send(store);
    });


    app.post('/review', async (req, res) => {
      const data = req.body;
      const store = await reviewCollection.insertOne(data);
      res.json(store);
    });
    app.get('/review', async (req, res) => {
      const store = await reviewCollection.find().toArray();
      res.send(store);
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

    app.put('/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };

      console.log(filter);
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete('/users/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await usersCollection.deleteOne(filter);
      res.json(result);
    });


    app.put('/users/addTeacher', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'teacher' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
  });


  app.get('/users/teacher/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await usersCollection.findOne(query);
    let isTeacher = false;
    if (user?.role === 'teacher') {
        isTeacher = true;
    }
    res.json({ teacher: isTeacher });
});

  app.post('/courseSubmit', async (req, res) => {
    const data = req.body;
    const store = await courseCollection.insertOne(data);
    res.json(store);
  });
  app.get('/courseSubmit', async (req, res) => {
    const store = await courseCollection.find().toArray();
    res.send(store);
  });
  app.delete('/courseSubmit/:email', verifyToken, async (req, res) => {
    const email = req.params.email;
    const filter = { email: email };
    const result = await courseCollection.deleteOne(filter);
    res.json(result);
  });





  } finally { 
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', async(req, res) => {
  res.send('Educational Live Solu id Here!')
})

app.listen(port, () => {
  console.log(`Educational Live Solu listening on port ${port}`)
})