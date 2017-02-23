'use strict';

var webMidiApi = require('web-midi-api'),
    serialPortApi = require('serialport'),
    express = require('express'),
    app = express(),
    expressWs = require('express-ws')(app),
    midiPort = null,
    serialPort = null,
    notes = [39, 43, 51, 42, 49, 36],
    threshold = [50, 50, 50, 50, 50, 50],
    gain = [50, 50, 50, 50, 50, 50],
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
          serialPort.on("data", function(data) {
            var sensor = data.readUInt8(0),
              vel = data.readUInt16BE(1),
              adjustedVel = Math.min(127, Math.round((vel - threshold[sensor]) / (1023 - threshold[sensor]) / 50 * gain[sensor] * 127));
            if (midiPort) {
              midiPort.send([0x99, notes[sensor], adjustedVel]);
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
app.use(express.static('public'));


console.log('Opening HTTP port ' + HTTP_PORT + '...')
app.listen(HTTP_PORT, function () {
  console.log('App listening on port ' + HTTP_PORT + '!')
})