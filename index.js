const express = require('express')
const app = express()
require("dotenv").config();
const cors = require('cors')
const port = process.env.PORT || 5000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('data is loading')
})



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@user1.istzhai.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        const servicesCollection = client.db('Rohimas-Kitchen').collection('services');

        app.get('/home', async(req, res) => {
            const query = {}
            const cursor = servicesCollection.find(query)
            const result = await cursor.limit(3).toArray()
        })
    }
    finally{

    }
}
run().catch(err => console.error(err))


app.listen(port, ()=> {
    console.log('server running on port', port)
})