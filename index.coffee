express = require('express')
bodyParser = require('body-parser')
crypto = require('crypto')
request = require('request')
fs = require 'fs'
path = require("path")
temp_dir = path.join(process.cwd(), 'temp/')
fs.mkdirSync(temp_dir) if (!fs.existsSync(temp_dir))


RequestHelper = require('./RequestHelper')
Client = require('./Client')
ResponseHandler = require('./ResponseHandler')
Contact = require('./Contact')

evercontact = (content, callback)->
  console.log 'New evercontact request !', content
  requestHelper = (new RequestHelper).withSubject('FAKE TITLE').withHeaderFrom('contact@sharinpix.com').withHeaderTo('contact@sharinpix.com').withContent(content)
  client = Client.getDefault('sharinpix', process.env.EVERCONTACT)
  client.execute requestHelper.build(), (responseHandler) ->
    console.log 'EVERCONTACT REPLIED !:'
    if responseHandler.status == ResponseHandler.ResponseStatus.SUCCEED and responseHandler.hasDetectedContact()
      detectedContact = responseHandler.detectedContact
      console.log 'We have a Contact: ' + detectedContact.firstName + '\n'
      console.log 'VCard: ' + responseHandler.detectedContactAsVCard + '\n'
      callback(detectedContact)
      console.log detectedContact.debugInfo()
    else
      console.log 'EVERCONTACT ERROR !'
      console.log responseHandler.errors
      callback({})
    return

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

  console.log "Callack : #{payload.callback}"
  filename = path.join(temp_dir, "image#{Math.round(Math.random()*100000)}.jpg")
  console.log filename
  ws = fs.createWriteStream(filename)
  ws.on 'finish', ->
    fs.readFile filename, (err, content)->
      console.log 'Finished !' + content.toString('base64').length
      request.post(
        {
          url: 'http://evercontact-ocr.herokuapp.com/ocr/process/test.json',
          json: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': process.env.OCR
          },
          form: {
            img: content.toString('base64')
          }
        }, (err, response, body)->
          console.log 'response', payload.callback, body
          evercontact body.original, (contact)->
            console.log 'Response from evercontact : ' + contact
            request({
                url: payload.callback,
                method: 'post'
                json: true
                body: {
                  payload: {
                    ocr: body.original,
                    contact: contact,
                  }
                },
              }, (error, response, body)->
                console.log error
                console.log body
            )
      )
  request.get(payload.image.original).pipe(ws)

app.listen app.get('port'), ->
  console.log("Node app is running at localhost:" + app.get('port'))
  console.log "Secret : #{process.env.SECRET}"
