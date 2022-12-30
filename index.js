const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const app = express();
const jwt = require('jsonwebtoken')

app.use(cors());
app.use(express.json());

//mongodb info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7splzic.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const usersCollection = client.db("DailyTaskManager").collection("Users");
const tasksCollection = client.db("DailyTaskManager").collection("Tasks");




//jwt verification
const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        //jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query)
            console.log(user);
            //token
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        })


        //adding users
        app.post('/users', async (req, res) => {
            const query = req.body.email
            const doesExist = await usersCollection.findOne(query)
            if (!doesExist) {
                const users = req.body
                const result = await usersCollection.insertOne(users)
                res.send(result)
            }
            else{
                return
            }
        })


        //getting tasks without media
        app.get('/text/tasks', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access from getting text' })
            }
            const query = { imageStatus: false, email: email }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)
        })


        //getting tasks with media
        app.get('/media/tasks', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access from getting media' })
            }
            const query = { imageStatus: true, email: email }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)

        })


        //getting tasks by id
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await tasksCollection.findOne(query)
            res.send(result)
        })


        //adding task
        app.post('/tasks', async (req, res) => {
            const tasks = req.body;
            const result = await tasksCollection.insertOne(tasks)
            res.send(tasks);
        })


        //updating task data
        app.put('/tasks/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const status = req.body;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const updatedDoc = {
                $set: {
                    taskName: status.taskName,
                    description: status.description,
                    comment: status.comment
                }
            }
            const result = await tasksCollection.updateOne(query, updatedDoc, option)
            res.send(result)
        })




        //getting tasks with if completed
        app.get('/completed/tasks', verifyJwt, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access from getting media' })
            }

            const query = { isComplete: true, email: email }
            const result = await tasksCollection.find(query).toArray()
            res.send(result)

        })




        // updating status of a task to Completed
        app.put('/complete/tasks/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const task = {
                $set: {
                    isComplete: true
                }
            }
            const result = await tasksCollection.updateOne(query, task, option)
            res.send(result)
        })





        // updating status of a task to not completed
        app.put('/notComplete/tasks/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const option = { upsert: true }
            const task = {
                $set: {
                    isComplete: false
                }
            }
            const result = await tasksCollection.updateOne(query, task, option)
            res.send(result)
        })



        //deleting task
        app.delete('/tasks/:id', verifyJwt, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await tasksCollection.deleteOne(query)
            res.send(result)
        })



    }
    finally {

    };
}
run().catch(console.log);



app.get('/', async (req, res) => {
    res.send('Daily Task Manager Server is running');
});

app.listen(port, () => console.log(`Daily Task Manager Server is running on ${port}`));