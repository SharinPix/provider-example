express = require('express')
bodyParser = require('body-parser')
crypto = require('crypto')
request = require('request')
fs = require 'fs'

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
  request.get(payload.image.original, ()->
      request.post(
        {
          url: 'http://detection.orpix-inc.com:8000/api/classify_image/mmr/',
          headers: {
            'Authorization': 'Token c409c3378d08c247d874fc7495e7d1120c3d84a8'
          },
          formData: {
            file: fs.createReadStream('test.jpg')
          }
        },
        (err, response, body)->
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
          console.log 'Response', err, body
      )
  ).pipe(fs.createWriteStream('test.jpg'))
app.listen app.get('port'), ->
  console.log("Node app is running at localhost:" + app.get('port'))
  console.log "Secret : #{process.env.SECRET}"
