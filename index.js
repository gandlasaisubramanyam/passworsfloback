require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const { db } = require('./connection')
const authRoutes = require('./Routes/auth')
const quoteRoutes = require('./Routes/quotes')
const { requireSignIn, isAuth } = require('./Utils/authorization')

//Middlewares
db()
app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello world !')
})

//Custom Middlewares
app.use('/api', authRoutes)
app.use('/api', requireSignIn, isAuth, quoteRoutes)

const PORT = process.env.PORT || 9000
app.listen(PORT, () => {
  console.log(`App is Listening to the port ${PORT}`)
})