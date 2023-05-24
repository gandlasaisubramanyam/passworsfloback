const mongoose = require('mongoose')

const quoteSchema = new mongoose.Schema({
  quoteType: {
    type: String,
    required: true
  },
  quote: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('quote', quoteSchema)