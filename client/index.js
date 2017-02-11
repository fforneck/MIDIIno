'use strict';

var webMidiApi = require('web-midi-api'),
    serialPortApi = require('serialport'),
    midiPort = null,
    serialPort = null,
    notes = [49, 42, 38, 43, 51, 36];

serialPortApi.list(function(error, serialPortInfos) {
  serialPortInfos.forEach(function(serialPortInfo){
    if (serialPortInfo.manufacturer == "Arduino LLC (www.arduino.cc)") {
      serialPort = new serialPortApi(serialPortInfo.comName, {
        baudRate: 57600,
        parser: serialPortApi.parsers.byteLength(13)
      }, function(error) {
        if (error) {
          console.log("ERROR: error opening serial port: " + error);
          process.exit(1);
        } else {
          serialPort.on("data", function(data) {
            //console.log(data.length);
            //for (var i=0; i<data.length; i++) {console.log(data.readUInt8(i));}
            var slot = data.readUInt8(0),
              vel = data.readUInt16BE(1),
              noteStart = data.readUInt32BE(3),
              sensitivity = data.readUInt16BE(7),
              relevantSamples = data.readUInt16BE(9),
              irrelevantNoise = data.readUInt16BE(11),
              adjustedVel = Math.round(vel / 1023 * 127);
            if (midiPort) {
              midiPort.send([0x99, notes[slot], adjustedVel]);
              //midiPort.send([0x89, notes[slot], adjustedVel]);
            }
            console.log(
              "slot = " + slot + 
              " velocity = " + vel + 
              " noteStart = " + noteStart + 
              " sensitivity " + sensitivity + 
              " relevantSamples = " + relevantSamples + 
              " irrelevantNoise = " + irrelevantNoise);
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