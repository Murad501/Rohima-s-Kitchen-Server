const express = require('express')
const app = express()
require("dotenv").config();
const cors = require('cors')
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('data is loading')
})

function verifyJWT(req, res, next) {
    const accessToken = req.headers.authorization
    if(!accessToken){
        return res.status(401).send({message: 'unauthorized access'})
    }
    const token = accessToken.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({message: 'unauthorized access'})
        }
         req.decoded = decoded 
         next()
      });
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const servicesCollection = client.db('Rohimas-Kitchen').collection('services');
        const reviewsCollection = client.db('Rohimas-Kitchen').collection('reviews')

        app.get('/home', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const result = await cursor.limit(3).toArray()
            res.send(result)
        })

        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/service/:id', async(req, res)=> {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })

        app.get('/editreview/:id', async(req, res)=> {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await reviewsCollection.findOne(query)
            res.send(result)
        })

        app.get('/reviews', async(req, res) => {
            const id = req.query.id
            const query = {serviceId: id}
            const cursor = reviewsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/myreviews', verifyJWT, async(req, res)=> {
            const decodedUser = req.decoded.user
            const email = req.query.email
            if(decodedUser !== email){
                return res.status(403).send({message: 'forbidden'})
            }
            const query = {userEmail: email}
            const cursor = reviewsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/review', async(req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })

        app.post('/service', async(req, res)=> {
            const service = req.body;
            const result = await servicesCollection.insertOne(service)
            res.send(result)
        })

        app.post('/jwt', (req, res)=> {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({token})
        })

        app.delete('/delete/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })

        app.patch('/editreview/:id', async(req, res) => {
            const id = req.params.id
            const editedReview = req.body.editedReview
            const query = {_id: ObjectId(id)}
            const update = { $set:{reviewText: editedReview} }
            const result = await reviewsCollection.updateOne(query, update)
            res.send(result)
        })



    }
    finally{

    }
}
run().catch(err => console.error(err))


app.listen(port, ()=> {
    console.log('server running on port', port)
})