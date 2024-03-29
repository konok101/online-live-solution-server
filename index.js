const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());


/* const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6df8qc8.mongodb.net/?retryWrites=true&w=majority`;
 */

const uri = "mongodb+srv://konok1512101:27oJABqw0GPlfy7A@cluster0.dueuu8r.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
  const courseCollection = database.collection('myCourse');
  const addCourseCollection = database.collection("addCourse");
  const applyForTeacherCollection = database.collection("applyForTeacher");
  const ContactCollection = database.collection('contact');
  const  ratingCollection = database.collection('reviews');


 

  app.post('/addCourse', (req, res) => {
    const teacher = req.body;
    console.log(teacher);
    addCourseCollection.insertOne(teacher)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
  });



  app.put('/courseUpdate/:id', async (req, res) => {
    const id = req.params.id;
    const updatedValue = req.body
    const filter = { _id: new ObjectId(id) }
    const option = { upsert: true };
    const updatedDoc = {
      $set: {
        teacherName: updatedValue?.nameUpdate,
        imageURL: updatedValue?.imageUrls,
        price: updatedValue?.priceUpdate,
        couseName: updatedValue?.courseNameUpdate,
        hours: updatedValue?.hoursUpdate,
        teachingArea: updatedValue?.teachinAreaUpdate,
        socialUrl: updatedValue?.socialUrlUpdate,

     
      
      }

    }
   
    const result = await addCourseCollection.updateOne(filter, updatedDoc, option);
    res.send({ status: "Updated",result })
  })

    app.delete('/courseUpdate/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query= { _id: new ObjectId(id) };
      const result = await addCourseCollection.deleteOne(query);
      res.send(result);
    });




  app.get('/myCourse', async(req, res)=>{
    const email = req.query.email;
    const query= {email: email};
    const cursor= courseCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders)
  })
  app.get('/myCourses', async(req, res)=>{
    const email = req.query.teacherEmail;
    console.log('ss email', email);
    const query= {email: email};
    const cursor= courseCollection.find(query);
    const orders = await cursor.toArray();
    res.send(orders)
  })

 
  app.put('/myCoursed/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };

    console.log(filter);
    const updateDoc = { $set: { isRating: 'false' } };
    const result = await courseCollection.updateOne(filter, updateDoc);
    console.log('result', result)
    res.send(result);
  });

 
    app.get('/addCourse', async (req, res) => {
      const store = await addCourseCollection.find().toArray();
      res.send(store);
    });
    app.get('/applyTeacherList', async (req, res) => {
      const store = await applyForTeacherCollection.find().toArray();
      res.send(store);
    });

    app.post('/contact', async (req, res) => {
      const data = req.body;
      const store = await ContactCollection.insertOne(data);
      res.json(store);
    });

    app.get('/contact', async (req, res) => {
      const store = await ContactCollection.find().toArray();
      res.send(store);
    });
    app.delete('/contactList/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const query= { _id: new ObjectId(id) };
      const result = await ContactCollection.deleteOne(query);
      res.send(result);
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

    app.put('/users/admin/:id', verifyToken, async (req, res) => {
     /*  const email = req.params.email;
      const filter = { email: email }; */
      const email = req.params.id;
      const filter= { _id: new ObjectId(email) };

      console.log(filter);
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.delete('/users/:id', verifyToken, async (req, res) => {
   /*    const email = req.params.email; */
 /*      const filter = { email: email }; */
      const email = req.params.id;
      const filter= { _id: new ObjectId(email) };
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


app.post('/applyForTeacher', (req, res) => {
  const teacher = req.body;
  applyForTeacherCollection.insertOne(teacher)
      .then(result => {
          res.send(result.insertedCount > 0)
      })
});

app.delete('/applyForTeacher/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const query= { _id: new ObjectId(id) };
  const result = await applyForTeacherCollection.deleteOne(query);
  res.send(result);
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
  app.delete('/myCourse/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const query= { _id: new ObjectId(id) };
    const result = await courseCollection.deleteOne(query);
    res.send(result);
  });

  app.put('/myCourse/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };

    console.log(filter);
    const updateDoc = { $set: { approveData: 'approve' } };
    const result = await courseCollection.updateOne(filter, updateDoc);
    console.log('result', result)
    res.send(result);
  });

  app.post('/courseRating', async (req, res) => {
    const data = req.body;
    const store = await ratingCollection.insertOne(data);
    res.json(store);
  });

  app.get('/courseRating', async (req, res) => {
    const store = await ratingCollection.find().toArray();
    res.send(store);
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