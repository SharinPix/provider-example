express = require('express')
bodyParser = require('body-parser')
crypto = require('crypto')
request = require('request')

app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.set('port', (process.env.PORT || 5000))

signature = (content)->
  'sha1='+crypto
    .createHmac('sha1', process.env.SECRET)
    .update(content)
    .digest('hex')

app.get '/', (req, res)->
  res.send('SharinPix Example Provider')
  res.status(200)

app.post '/', (req, res)->
  if req.headers['x-sharinpix-signature'] != signature(req.body.p)
    console.log 'Wrong secret !'
    res.status(400)
    res.send('Wrong secret')
    return
  res.send('OK')
  res.status(200)
  payload = JSON.parse(req.body.p)

  console.log 'PAYLOAD :'
  console.log payload
  console.log "Callack : #{payload.callback}"
  request({
    auth:
        user: process.env.USER
        pass: process.env.PASS
        sendImmediately: false
    url: 'http://api.imagga.com/v1/tagging?url='+payload.image.full,
    method: 'get',
    json: true,
  }, (error, response, body)->
    request({
      url: payload.callback,
      method: 'post'
      json: true
      body: {
        payload: response.body
      },
    }, (error, response, body)->
      console.log error
      console.log body
    )
  )

app.listen app.get('port'), ->
  console.log("Node app is running at localhost:" + app.get('port'))
  console.log "Secret : #{process.env.SECRET}"
