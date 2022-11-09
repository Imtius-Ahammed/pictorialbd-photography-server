const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ruqflxh.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("pictorialdb").collection("services");

    const userReviews = client.db("pictorialdb").collection("userReviews");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });


    // reviews api

    app.get('/reviews', async(req,res)=>{

      let query ={};
      console.log(req.query);
      if(req.query.email){
        query={
          email: req.query.email
        }
      }
      const cursor = userReviews.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })
    app.post('/reviews', async(req,res)=>{
      const reviews = req.body;
      const result = await userReviews.insertOne(reviews);
      res.send(result);

    })

    app.delete('/reviews/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await userReviews.deleteOne(query);
      res.send(result);
    })


  } 
  finally {
  }
}
run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("pictorialbd server us running");
});

app.listen(port, () => {
  console.log(`PictorialBD server is running on ${port}`);
});
