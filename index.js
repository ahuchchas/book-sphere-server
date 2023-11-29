const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { MongoClient, ObjectId } = require("mongodb");
const port = 5000;

const app = express();
dotenv.config();
//middleware
app.use(express.json());
app.use(cors());

//check the server response
app.get("/", async (req, res) => {
  res.send("book sphere server is running");
});

const client = new MongoClient(process.env.MONGODBURI);
async function run() {
  try {
    const database = client.db("book-sphere");
    const books = database.collection("books");

    //get all books
    app.get("/books/:user", async (req, res) => {
      try {
        const query = { user: req.params.user };
        const cursor = books.find(query);
        const allbooks = await cursor.toArray();
        res.json(allbooks);
      } catch (error) {
        res.status(500).send("something is wrong! can't get books");
      }
    });
    //get single book
    app.get("/book/:id", async (req, res) => {
      try {
        const query = { _id: req.params.id };
        const book = books.findOne(query);
        res.json(book);
      } catch (error) {
        res.status(500).send("something is wrong! can't get book");
      }
    });

    //add book
    app.post("/books/add", async (req, res) => {
      const book = req.body;

      try {
        const result = await books.insertOne(book);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't add book");
      }
    });

    //update book
    app.put("/books/update/:id", async (req, res) => {
      const book = req.body;
      const id = req.params.id;

      if (!id) {
        return res.status(400).send("id is required!");
      }
      try {
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            title: book.title,
            author: book.author,
            genre: book.genre,
            publishedYear: book.publishedYear,
          },
        };
        const result = await books.updateOne(filter, updatedDoc, options);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't update book");
      }
    });

    //delete a book
    app.delete("/books/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      try {
        const result = await books.deleteOne(query);
        res.json(result);
      } catch (error) {
        res.status(500).send("something is wrong! can't delete book");
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`book sphere running on port: ${port}`);
});
