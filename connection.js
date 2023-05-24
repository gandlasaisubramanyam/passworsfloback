const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

exports.db = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB Connection established...')
    })
    .catch(err => {
      console.log(err)
    })
}