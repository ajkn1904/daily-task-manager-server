const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



client.connect(err => {
  const collection = client.db("dailyTaskManager").collection("Users");
  // console.log("db connected", uri)
  
});



app.use(cors());
app.use(express.json());

app.get('/', async(req, res) => {
    res.send('Daily Task Manager Server is running');
});

app.listen(port, () => console.log(`Daily Task Manager Server is running on ${port}`));