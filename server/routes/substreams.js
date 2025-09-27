const { Router } = require('express')
const { getInfo, runStream } = require('../controllers/substreamsController')

const router = Router()

router.get('/substreams/info', getInfo)
router.post('/stream', runStream)

module.exports = router

