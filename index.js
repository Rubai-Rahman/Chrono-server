const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
const fileUpload = require("express-fileupload");
const admin = require("firebase-admin");

app.use(cors());
app.use(express());
app.use(fileUpload());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f8dsb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email;
    } catch {}
  }
  next();
}

async function run() {
  try {
    await client.connect();

    const database = client.db("cronoClick");
    const productCollection = database.collection("products");
    const reviewCollection = database.collection("review");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    //Get Products
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);
      let products;
      const count = await cursor.count();
      if (page) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }

      res.send({ count, products });
    });
    //Get single Api
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });

    //POST API Post Cart Item
    //POST API Post Cart Item
    app.post("/orders", async (req, res) => {
      console.log(req.body);
      const email = req.body.email;
      const cart = req.body.cart;
      const order = {
        email,
        cart,
      };
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    //get Orders
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const order = await cursor.toArray();
      res.json(order);
    });
    //set Review Api
    app.post("/reviews", async (req, res) => {
      const name = req.body.name;
      const comment = req.body.review;
      const review = {
        name,
        comment,
      };
      const result = await reviewCollection.insertOne(review);

      res.json(result);
    });
    //post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, option);
      res.json(result);
    });
    //Check Admin Api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    //Admin
    app.put("/users/admin", verifyToken, async (req, res) => {
      const user = req.body;

      const requester = req.decodedEmail;
      if (requester) {
        const requesterAccount = await usersCollection.findOne({
          email: requester,
        });
        if (requesterAccount.role === "admin") {
          const filter = { email: user.email };
          const updateDoc = { $set: { role: "admin" } };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        }
      } else {
        res
          .status(403)
          .json({ message: "You Dont have permission to make Admin" });
      }
    });
    //Post Product Api

    app.post("/products", async (req, res) => {
      const name = req.body.name;
      const price = req.body.price;
      const details = req.body.details;
      const pic = req.files.image;
      const picData = pic.data;
      const encodedPic = picData.toString("base64");
      const imageBuffer = Buffer.from(encodedPic, "base64");
      const product = {
        name,
        price,
        details,
        image: imageBuffer,
      };
      const result = await productCollection.insertOne(product);
      res.json(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Updated here");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
