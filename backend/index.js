'use strict';

var webMidiApi = require('web-midi-api'),
    serialPortApi = require('serialport'),
    express = require('express'),
    app = express(),
    expressWs = require('express-ws')(app),
    bodyParser = require('body-parser'),
    Storage = require('node-storage'),
    store = new Storage('./storage.json'),
    midiPort = null,
    serialPort = null,
    slots = store.get('slots'),
    HTTP_PORT = 3000;

console.log('Listing serial ports...');
serialPortApi.list(function(error, serialPortInfos) {
  serialPortInfos.forEach(function(serialPortInfo){
    console.log('Port=' + serialPortInfo.manufacturer);
    if (serialPortInfo.manufacturer == "Arduino LLC (www.arduino.cc)") {
	  console.log('Opening serial port...');
      serialPort = new serialPortApi(serialPortInfo.comName, {
        baudRate: 57600,
        parser: serialPortApi.parsers.byteLength(3)
      }, function(error) {
        if (error) {
          console.log("ERROR: error opening serial port: " + error);
          process.exit(1);
        } else {
          console.log('Serial port is open.');
          console.log('Setting sensor parameters...');
          slots.forEach(function(slot){
            communicateChange(slot);
          });

          serialPort.on("data", function(data) {
            var sensor = data.readUInt8(0),
              vel = data.readUInt16BE(1),
              adjustedVel = Math.min(127, Math.round((vel - slots[sensor].threshold) / (1023 - slots[sensor].threshold) / 50 * slots[sensor].gain * 127));
            if (midiPort) {
              midiPort.send([0x99, slots[sensor].note, adjustedVel]);
            }
            console.log(
              "sensor = " + sensor + 
              " velocity = " + vel);
          });
        }
      });

      serialPort.on("error", function(errorMsg){
        console.log("ERROR: " + errorMsg);
      });
    }
  });
});

console.log('Requesting MIDI access...')
webMidiApi.requestMIDIAccess().then(function(midiAccess){
  console.log('Listing MIDI outputs...');
  midiAccess.outputs.forEach(function(port){
    console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
    if (port.name == "LoopBe Internal MIDI") {
    //if (port.name == "Microsoft GS Wavetable Synth") {
      console.log('Opening MIDI port...');
      port.open();
      console.log('MIDI port is ready.');
      midiPort = port;
    }
  });
}, function(msg){
  console.log('Failed to get MIDI access - ' + msg);
  process.exit(1);
});

console.log('Setting app to server static content from public folder...')
app.use(express.static('../frontend/dist'));

app.use(bodyParser.urlencoded({extended: true}));

app.get('/pads', function(req, res) {
  res.send(JSON.stringify(slots));
});

app.put('/pad/:id', function(req, res) {
  console.log(req.body);
  slots[req.params.id] = req.body;
  communicateChange(req.params.id, req.body.threshold, req.body.relevantSamples, req.body.irrelevantNoise);
});

function communicateChange(slot) {
  console.log('Communicating changes: id=' + slot.id + ' threshold=' + slot.threshold + ' relevantSamples=' + slot.relevantSamples + ' irrelevantNoise=' + slot.irrelevantNoise);
  if (serialPort) {
    var buf = new Buffer.alloc(7);
    buf.writeUInt8(slot.id, 0);
    buf.writeUInt16BE(slot.threshold, 1);
    buf.writeUInt16BE(slot.relevantSamples, 3);
    buf.writeUInt16BE(slot.irrelevantNoise, 5);
    serialPort.write(buf);	  
  }
}

console.log('Opening HTTP port ' + HTTP_PORT + '...')
app.listen(HTTP_PORT, function () {
  console.log('App listening on port ' + HTTP_PORT + '!')
})