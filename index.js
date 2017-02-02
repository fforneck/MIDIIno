'use strict';

var webMidiApi = require('web-midi-api'),
    serialPortApi = require('serialport'),
    midiPort = null,
    serialPort = null,
    notes = [36, 37, 38, 39];

serialPortApi.list(function(error, serialPortInfos) {
  serialPortInfos.forEach(function(serialPortInfo){
    if (serialPortInfo.manufacturer == "Arduino LLC (www.arduino.cc)") {
      serialPort = new serialPortApi(serialPortInfo.comName, {
        baudRate: 38400,
        parser: serialPortApi.parsers.byteLength(4)
      }, function(error) {
        if (error) {
          console.log("ERROR: error opening serial port: " + error);
          process.exit(1);
        } else {
          serialPort.on("data", function(data) {
            var slot = data.readUInt16BE(0),
            	vel = data.readUInt16BE(2),
            	adjustedVel = Math.round(vel / 1023 * 127);
            if (midiPort) {
              midiPort.send([0x99, notes[slot], adjustedVel]);
              //midiPort.send([0x89, notes[slot], adjustedVel]);
            }
          });
        }
      });
      serialPort.on("error", function(errorMsg){
        console.log("ERROR: " + errorMsg);
      });
    }
  });
});

function onMIDIFailure(msg){
  console.log('Failed to get MIDI access - ' + msg);
  process.exit(1);
}

function onMIDISuccess(midiAccess){
  console.log('TRACE: onMIDISuccess');
  midiAccess.outputs.forEach(function(port){
    //console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
    if (port.name == "Microsoft GS Wavetable Synth") {
      midiPort = port;
      port.open();
      //scale(0x1b, 0x7f);
    }
  });
}

//function scale(note, velocity) {
//  console.log('Note: ' + note);
//  midiPort.send([0x99, note, velocity]);
//  setTimeout(function(){
//    //midiPort.send([0x89, note, velocity]);
//    if (note < 91) {
//      scale(note + 1, velocity);
//    } else {
//      process.exit(0);
//    }
//  }, 700);
//}

webMidiApi.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);