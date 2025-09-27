const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const substreamsRoutes = require('./routes/substreams')
const { errorHandler } = require('./middleware/error')

const app = express()

app.use(express.json())
app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(substreamsRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3002
app.listen(PORT, () => console.log(`Server listening on ${PORT}`))

