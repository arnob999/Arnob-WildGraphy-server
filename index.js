const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xgfn0ly.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//jwt implementation
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }

        req.decoded = decoded;
        next()

    })
}

async function run() {

    try {
        const myClickCollection = client.db('arnob-wild-graphy').collection('myClick')
        const reviewCollection = client.db('arnob-wild-graphy').collection('review')


        //jwt token implementation
        app.post('/jwt', async (req, res) => {
            const user = req.body
            console.log(user);
            //user er data will be used as payload
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1hr' })
            res.send({ token })
        })
        //end jwt

        //to load specific data number using limit
        app.get('/photo', async (req, res) => {
            const query = {};
            const cursor = myClickCollection.find(query).limit(3);
            const photos = await cursor.toArray();
            res.send(photos);
        })
        //load all data
        app.get('/photos', async (req, res) => {
            const query = {};
            const cursor = myClickCollection.find(query);
            const photos = await cursor.toArray();
            res.send(photos);
        })

        //to load specific data
        app.get('/photos/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const photos = await myClickCollection.findOne(query);
            res.send(photos)
        })

    }


    finally {

    }

}
run().catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send("wild graphy is running successfully");

})

app.listen(port, () => {
    console.log(`wild graphy ${port}`);
})