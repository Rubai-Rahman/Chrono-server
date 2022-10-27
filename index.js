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

let serviceAccount = {
  type: "service_account",
  project_id: "chrono-click",
  private_key_id: "33eeaa73572bca2133c95602fe140312d7a8c57c",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWTkAcIwb32Iym\nYHvK2GKwk3PbS8sgbIiiNZ6CyO5sexOyJGhPJTPuX5gyiDKPAiCejJ02sOhxvuYX\nPhwa+HbMxJiB31cs1blu4z5N4K41VGpw9XuSIh7uXGy0312/EidhCFhINsXqCRVk\nWbujMeB1vjt+rYTF+P7ZGXolpYugpnnCULf4YNoqRUIdEr5NjP/sb4wKCEyB+y1M\nbUBEa+q32RJkBZM9YeYPapU9vZg5FK1jDj+siQsdMqo9vUPj+2CRkgok1f1z9/BT\nLRdy0WyFGlYmPkUp7Nv1iCs+RlynMnsvmgX57c6RhwZEQ/58xE2udhjXp0xQPK7B\n2tSbL08rAgMBAAECggEAWDg1LwACVdPYroLoYuvp0HuaxWsxjsLvCitdecRCVfji\ndkKDiBUuCBJlImQrv/Alwm7rJwDzZyOpL2c7haTDru69QzVP+x5uK+YzFzcHL9/0\nw1RizpjqN8BnZZvPySCtgkW/pdaaaYncuwcvdXJKTt4FOtQuZJroOjHBNS8tR++O\nkVlXEoCw8qhisIa0SDAU5NdxaFvyt3MRcEyxEvceFPK16gxeu3QQF75nbbuSYSla\nK0DvS7HFQfEXVJGOu1w3hav6ir7QpchBfl7dqA+tfYgzc+19U/202Nk+9nKBPeew\nv175WV8x/cm8E5G3jjjikaPPtgHza2c3kolVeol4qQKBgQD+OP+8VcggpQvZMSTa\nqn/sTC57rgcF7vn8xf5ccZWwCjDSZI6oQn5liOnSjXJAtFs7cVb4On4LJrzAb09j\nlfV7ZLzxMwvMZ6PFzEbvho+IPQmPQT8bZgKYUJW0uOGXrALk9U0MV67wY85+DiDx\noGng3wOn07Q1B632ICkZzVLDSQKBgQDXzc8gT8/MriIReej07BbpSWD6WMGgkvC1\nSZo6QfronJ3sJ7ICGgxBzMnOM8nkL70GKXaKJvXYMTHGUhJaAKGEPHX6MDqiCbco\na0+d6j4XQ50FMsT5VCS1cOr36p98XzcYkFcmaMUiYs4bT/kIFp3Rc2n7wGogesz4\nM3YD2huK0wKBgHCaBowA4teywwC8h7pi8q5TP/OALZQvOYMAn52KoeaLXPyTlaxp\nZ1rJveeIxyZpvE8j8IWaQuHlko0ZwGw3q7ev8xBSr9MlxKCDzpehXknV3zoYiD82\ne8fDScv2Z9WqVs3a6PmijNXlHz0uPOFJUBxOK2xWlOc4M5FkxU+sZhAhAoGBAJ1T\ne2cRCGstn8Sh3cWAwIs+ZabdQfvwY++mQvup0mP2meLqZYnGt5zY0V60vsDOVL3D\nSJobISuFYcY1Ww+mWhnvggrtUjGDZ7Xd1eNIPA/1yOlbQ+KJB2IHeiVXNQIU4DPW\nNtLXmrAg3CVpPiI5asChpWhVtIkNPZTM34KbZWzlAoGBAIIYn/WLe8f1+xlcXGw7\n1ZoaBS49l1y3PfgXvZfgcDMQDBEp56s8VcVBZEnJsfYjh68IZH+/eezZ+ZV8BHFz\nhfvn9W0hyVo1HxeZB0D6eqfqyQphHuQtMJz8xNXlz+NPOrrx0w9gzF9zukY1v4RC\nmfnVEDmOe4cRfRa5xGChHm55\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-88ym2@chrono-click.iam.gserviceaccount.com",
  client_id: "109091584681779048214",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-88ym2%40chrono-click.iam.gserviceaccount.com",
};
// let serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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
    //single user orders
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const cursor = await orderCollection.find(query);
      const order = await cursor.toArray();
      res.json(order);
    });
    //Manage Orders
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = orderCollection.find({
        cart: { $elemMatch: { "cart._id": ObjectId(id) } },
      });

      const result = await orderCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
    //Manage Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
      console.log(id);
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
      console.log(user);
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
