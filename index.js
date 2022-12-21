const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "unathorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client.db("pictorialdb").collection("services");

    const userReviews = client.db("pictorialdb").collection("userReviews");

    // jwt
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.post("/allservices", verifyJWT, async (req, res) => {
      const postServices = req.body;
      const result = await serviceCollection.insertOne(postServices);
      res.send(result);
    });

    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // reviews api

    app.get("/reviews", async (req, res) => {
      const decoded = req.decoded;
      console.log("inside orders ", decoded);
      // if (decoded.email !== req.query.email) {
      //   res.status(403).send({ message: "Forbidden access" });
      // }

      let query = {};
      console.log(req.query);
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = userReviews.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      const result = await userReviews.insertOne(reviews);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const user = req.body;
      const option = { upsert: true };

      const updatedUser = {
        $set: {
          email: user.email,
          message: user.message,
        },
      };
      console.log(updatedUser);
      const result = await userReviews.updateMany(filter, updatedUser, option);
      res.send(result);
      console.log(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userReviews.deleteOne(query);
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { id };
      const result = userReviews.find(query);
      const service = await result.toArray();
      res.send(service);
    });
  } finally {
  }
}
run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("pictorialbd server us running");
});

app.listen(port, () => {
  console.log(`PictorialBD server is running on ${port}`);
});
