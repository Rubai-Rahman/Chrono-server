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
    const newsCollection = database.collection("news");

    //  Extended /products route
app.get("/products", async (req, res) => {
  const { page, size, isFeatured, sort, limit, category, brand } = req.query;

  // Build MongoDB query dynamically
  let query = {};

  if (isFeatured === "true") query.isFeatured = true;
  if (category) query.category = category;
  if (brand) query.brand = brand;

  let cursor = productCollection.find(query);

  // Sorting - fix field names to match your data
  if (sort === "createdAt_desc") cursor = cursor.sort({ createdAt: -1 });
  else if (sort === "createdAt_asc") cursor = cursor.sort({ createdAt: 1 });
  else if (sort === "price_asc") cursor = cursor.sort({ price: 1 });
  else if (sort === "price_desc") cursor = cursor.sort({ price: -1 });
  // Add default sorting
  else cursor = cursor.sort({ createdAt: -1 });

  // Apply limit for home page featured
  if (limit) cursor = cursor.limit(parseInt(limit));

  // Pagination - fix for 1-based page numbers
  if (page && size) {
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);
    cursor = cursor.skip((pageNum - 1) * sizeNum).limit(sizeNum);
  }

  try {
    const count = await productCollection.countDocuments(query); // Use countDocuments instead of cursor.count()
    const products = await cursor.toArray();

    res.send({ count, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Failed to fetch products' });
  }
});

    //Get single Api
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json(product);
    });

    //POST API Post Cart Item
    app.post("/orders", async (req, res) => {
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
      const query = { email: email };
      const cursor = await orderCollection.find(query);
      const order = await cursor.toArray();
      res.json(order);
    });
    //Manage Orders
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;

      const options = { cart: { $elemMatch: { _id: id } } };
      // const options = { $pull: { cart: { _id: ObjectId(id) } } };

      const result = await orderCollection.deleteOne(options);

      res.json(result);
    });
    //Manage Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });
    //set Review Api
    app.post("/review", async (req, res) => {
      const name = req.body.name;
      const comment = req.body.review;
      const img = req.body.image;
      const review = {
        name,
        comment,
        img,
      };
      const result = await reviewCollection.insertOne(review);

      res.json(result);
    });
    //Get REviews
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find({});
      const order = await cursor.toArray();
      res.json(order);
    });
    //set news Api
    app.post("/news", async (req, res) => {
      const name = req.body.name;
      const details = req.body.details;
      const img = req.body.image;
      const news = {
        name,
        details,
        img,
      };
      const result = await newsCollection.insertOne(news);

      res.json(result);
    });
    //Get REviews
    app.get("/news", async (req, res) => {
      const cursor = newsCollection.find({});
      const order = await cursor.toArray();
      res.json(order);
    });


// GET single News with comments and user reactions
app.get("/news/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const commentsPage = parseInt(req.query.commentsPage) || 1;
    const commentsLimit = parseInt(req.query.commentsLimit) || 50;

    const newsCollection = client.db("cronoClick").collection("news");
    const commentsCollection = client.db("cronoClick").collection("comments");
    const reactionsCollection = client.db("cronoClick").collection("comment_reactions");

    const news = await newsCollection.findOne({ _id: ObjectId(id) });
    if (!news) return res.status(404).json({ error: "News not found" });

    // Fetch ALL comments for this news
    const allComments = await commentsCollection
      .find({ newsId: ObjectId(id) })
      .sort({ date: -1 })
      .toArray();

    // Organize comments hierarchically
    const commentMap = new Map();
    const topLevelComments = [];

    allComments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...comment,
        _id: comment._id.toString(),
        newsId: comment.newsId.toString(),
        parentId: comment.parentId ? comment.parentId.toString() : null,
        replies: []
      });
    });

    allComments.forEach(comment => {
      const commentObj = commentMap.get(comment._id.toString());
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId.toString());
        if (parent) {
          parent.replies.push(commentObj);
        }
      } else {
        topLevelComments.push(commentObj);
      }
    });

    // Sort replies oldest first for conversation flow
    const sortReplies = (comments) => {
      comments.forEach(comment => {
        if (comment.replies.length > 0) {
          comment.replies.sort((a, b) => new Date(a.date) - new Date(b.date));
          sortReplies(comment.replies);
        }
      });
    };
    sortReplies(topLevelComments);

    // --- Add user-specific reactions ---
    const userId = req.user?.id || "anonymous"; // Replace with real auth user
    const addUserReactions = async (comments) => {
      for (let comment of comments) {
        const userReaction = await reactionsCollection.findOne({
          commentId: ObjectId(comment._id),
          userId: userId
        });

        comment.userReaction = userReaction ? userReaction.reaction : null;

        if (comment.replies && comment.replies.length > 0) {
          await addUserReactions(comment.replies);
        }
      }
    };

    await addUserReactions(topLevelComments);

    const totalComments = allComments.length;

    res.json({
      news,
      comments: topLevelComments,
      commentsPagination: {
        total: totalComments,
        page: commentsPage,
        pages: Math.ceil(totalComments / commentsLimit)
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comments - add a new comment or reply for a news item
app.post("/comments", async (req, res) => {
  try {
    const { newsId, user, message, parentId } = req.body;
    
    if (!newsId || !user || !message) {
      return res.status(400).json({ error: "newsId, user, and message are required" });
    }

    const comment = {
      newsId: ObjectId(newsId),
      user,
      message,
      date: new Date(),
      parentId: parentId ? ObjectId(parentId) : null, // Add parentId support
      likes: 0, // Initialize likes count
      replyCount: 0 // Initialize reply count
    };

    const result = await client.db("cronoClick").collection("comments").insertOne(comment);

    // If this is a reply, increment the parent comment's reply count
    if (parentId) {
      await client.db("cronoClick").collection("comments").updateOne(
        { _id: ObjectId(parentId) },
        { $inc: { replyCount: 1 } }
      );
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /comments/:id/react - react to a comment (like, dislike, or remove reaction)
app.post("/comments/:id/react", async (req, res) => {
  try {
    const commentId = req.params.id;
    const { reaction } = req.body; // 'like', 'dislike', or 'remove'
    const userId = req.user?.id || 'anonymous'; // You'll need to get this from your auth system
    
    const commentsCollection = client.db("cronoClick").collection("comments");
    const reactionsCollection = client.db("cronoClick").collection("comment_reactions");
    
    // First, remove any existing reaction from this user for this comment
    await reactionsCollection.deleteOne({
      commentId: ObjectId(commentId),
      userId: userId
    });
    
    // Get current comment to calculate new counts
    const comment = await commentsCollection.findOne({ _id: ObjectId(commentId) });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    let likesChange = 0;
    let dislikesChange = 0;
    let userReaction = null;
    
    if (reaction !== 'remove') {
      // Add the new reaction
      await reactionsCollection.insertOne({
        commentId: ObjectId(commentId),
        userId: userId,
        reaction: reaction,
        date: new Date()
      });
      
      userReaction = reaction;
      
      if (reaction === 'like') {
        likesChange = 1;
      } else if (reaction === 'dislike') {
        dislikesChange = 1;
      }
    }
    
    // Recalculate total likes and dislikes
    const totalLikes = await reactionsCollection.countDocuments({
      commentId: ObjectId(commentId),
      reaction: 'like'
    });
    
    const totalDislikes = await reactionsCollection.countDocuments({
      commentId: ObjectId(commentId),
      reaction: 'dislike'
    });
    
    // Update the comment with new counts
    await commentsCollection.updateOne(
      { _id: ObjectId(commentId) },
      { 
        $set: { 
          likes: totalLikes,
          dislikes: totalDislikes
        }
      }
    );
    
    res.json({ 
      likes: totalLikes, 
      dislikes: totalDislikes,
      userReaction: userReaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

  try {
    // 1️⃣ Check if user already exists
    const existingUser = await usersCollection.findOne(filter);

    if (existingUser) {
      // ✅ User exists — return as-is without updating
      return res.json(existingUser);
    }

    // 2️⃣ New user — insert with all fields (email, name, role, photoURL)
    const newUser = {
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role || 'user', // default fallback if not sent
    };

    await usersCollection.insertOne(newUser);

    return res.json(newUser); // ✅ Return created user
  } catch (error) {
    console.error('Error in /users PUT:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
      const img = req.body.image;
      const product = {
        name,
        price,
        details,
        img,
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







