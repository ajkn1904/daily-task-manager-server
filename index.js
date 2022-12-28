const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

//mongodb info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const usersCollection = client.db("DailyTaskManager").collection("Users");
const tasksCollection = client.db("DailyTaskManager").collection("Tasks");



async function run() {
    try {

        //adding users
        app.post('/users', async (req, res) => {
            const users = req.body
            const result = await usersCollection.insertOne(users)
            res.send(result)
        })


        //getting tasks without media
        app.get('/text/tasks', async (req, res) => {
            const query = { imageStatus: false }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)
        })

        
        //getting tasks with media
        app.get('/media/tasks', async (req, res) => {
            const query = { imageStatus: true }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)

        })


        //adding task
        app.post('/tasks', async (req, res) => {
            const tasks = req.body;
            const result = await tasksCollection.insertOne(tasks)
            res.send(tasks);
        })
    }
    finally {

    }
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Daily Task Manager Server is running');
});

app.listen(port, () => console.log(`Daily Task Manager Server is running on ${port}`));