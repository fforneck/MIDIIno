'use strict';

var webMidiApi = require('web-midi-api'),
    serialPortApi = require('serialport'),
    midiPort = null,
    serialPort = null,
    notes = [39, 43, 51, 42, 49, 36];

serialPortApi.list(function(error, serialPortInfos) {
  serialPortInfos.forEach(function(serialPortInfo){
    if (serialPortInfo.manufacturer == "Arduino LLC (www.arduino.cc)") {
	  //console.log(serialPortInfo.comName);
      serialPort = new serialPortApi(serialPortInfo.comName, {
        baudRate: 57600,
        parser: serialPortApi.parsers.byteLength(15)
      }, function(error) {
        if (error) {
          console.log("ERROR: error opening serial port: " + error);
          process.exit(1);
        } else {
          serialPort.on("data", function(data) {
            var start = process.hrtime();
            /*if (data.readUInt16BE(7) > 0) {
              serialPort.write(Buffer.from([0x01]), function(error){
                if (error) {
                  console.log('error sending data back:');
                  console.log(error);
                }
              });              
            }*/
            //console.log(data.length);
            //for (var i=0; i<data.length; i++) {console.log(data.readUInt8(i));}
            var sensor = data.readUInt8(0),
              vel = data.readUInt16BE(1),
              noteStart = data.readUInt32BE(3),
              threshold = data.readUInt16BE(7),
              relevantSamples = data.readUInt16BE(9),
              irrelevantNoise = data.readUInt16BE(11),
              difference = data.readUInt16BE(13),
              adjustedVel = Math.round((vel - threshold) / (1023 - threshold) * 127);
            if (midiPort) {
              var step1 = process.hrtime();
              console.log((step1[0] - start[0]) + " " + ((step1[1] - start[1]) / 1000000));
              midiPort.send([0x99, notes[sensor], adjustedVel]);
              var step2 = process.hrtime();
              console.log((step2[0] - step1[0]) + " " + ((step2[1] - step1[1]) / 1000000));
              //midiPort.send([0x89, notes[sensor], adjustedVel]);
            }
            console.log(
              "sensor = " + sensor + 
              " velocity = " + vel + 
              " noteStart = " + noteStart + 
              " threshold " + threshold + 
              " relevantSamples = " + relevantSamples + 
              " irrelevantNoise = " + irrelevantNoise +
              " difference = " + difference);
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
    console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
    if (port.name == "LoopBe Internal MIDI") {
    //if (port.name == "Microsoft GS Wavetable Synth") {
      midiPort = port;
      port.open();
      midiPort.send([0x99, notes[0], 127]);
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