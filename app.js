const express = require('express')
const path = require('path')
const config = require('config')
const mongoose = require('mongoose')

// Create express app
const app = express()

app.use('/api/auth', require('./routes/auth.routes'))


// Add port from config or default
const PORT = config.get('port') || 5000

async function start() {
  try {
    const some = await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })

    // start server after conect to mongodb
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`))
  } catch (err) {
    console.error(`server error ${err}`)
    process.exit(1)
  }
}

start()

