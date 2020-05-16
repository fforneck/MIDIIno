const webMidiApi = require('web-midi-api'),
    SerialPort = require('serialport'),
    ByteLength = require('@serialport/parser-byte-length'),
    express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    Storage = require('node-storage');

main().then(() => {
    console.log('finished processing');
}).catch((error) => {
    console.error('Error running main function:', error);
});

async function main() {

    const {serialPort, parser} = await getSerialPort();
    const sensors = getSensorsConfig();
    communicateConfigChanges(serialPort, sensors);
    const midiPort = await getMidiPort();

    serialPort.on('error', (error) => {
        console.log("ERROR: " + error);
    });

    parser.on('data', (data) => {
        const sensor = data.readUInt8(0),
            vel = data.readUInt16BE(1),
            adjustedVel = Math.min(127, Math.round((vel - sensors[sensor].threshold) / (1023 - sensors[sensor].threshold) / 50 * sensors[sensor].gain * 127));
        if (midiPort) {
            midiPort.send([0x99, sensors[sensor].note, adjustedVel]);
        }
        console.log(`sensor=${sensor} velocity=${vel}`);
    });

    startHttpServer();
}

function startHttpServer() {

    const app = express(),
        HTTP_PORT = 3000;
    
    console.log('Setting app to server static content from public folder...');
    app.use(express.static('../frontend/dist'));
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    
    app.get('/pads', function (req, res) {
        res.send(JSON.stringify(sensors));
    });
    
    app.put('/pad/:id', function (req, res) {
        console.log(req.body);
        sensors[req.params.id] = req.body;
        communicateChange(req.params.id, req.body.threshold, req.body.relevantSamples, req.body.irrelevantNoise);
    });
    
    console.log('Opening HTTP port ' + HTTP_PORT + '...');
    app.listen(HTTP_PORT, function () {
        console.log('App listening on port ' + HTTP_PORT + '!');
    });

}

function getSensorsConfig() {
    const file = fs.readFileSync('./storage.json', 'utf8');
    return JSON.parse(file).sensors;
}

function saveSensorConfig(sensors) {
    fs.writeFileSync('./storage.json', JSON.stringify({sensors: sensors}), 'utf-8');
}

async function getSerialPort() {

    console.log('Listing serial ports...');
    const serialPortInfoArray = await SerialPort.list();
        
    for (const serialPortInfo of serialPortInfoArray) {
        console.log('Port=' + serialPortInfo.manufacturer);
        if (serialPortInfo.manufacturer == "Arduino LLC (www.arduino.cc)") {
            console.log('Opening serial port...');
            const serialPort = new SerialPort(serialPortInfo.path, {
                baudRate: 57600
            });
            console.log('Serial port is open. Setting sensor parameters...');
            const parser = new ByteLength({length: 3});
            serialPort.pipe(parser);
            return {serialPort, parser};
        }
    }
    return null;
}

function communicateConfigChanges(serialPort, sensors) {
    for (const sensor of sensors) {
        console.log('Communicating changes: id=' + sensor.id + ' threshold=' + sensor.threshold + ' relevantSamples=' + sensor.relevantSamples + ' irrelevantNoise=' + sensor.irrelevantNoise);
        if (serialPort) {
            var buf = new Buffer.alloc(7);
            buf.writeUInt8(sensor.id, 0);
            buf.writeUInt16BE(sensor.threshold, 1);
            buf.writeUInt16BE(sensor.relevantSamples, 3);
            buf.writeUInt16BE(sensor.irrelevantNoise, 5);
            serialPort.write(buf);
        }
    }
}

async function getMidiPort() {
    
    console.log('Requesting MIDI access...');
    const midiAccess = await webMidiApi.requestMIDIAccess();
    
    const port = midiAccess.outputs.get("LoopBe Internal MIDI");
    if (!port) {
        throw new Error('MIDI port "LoopBe Internal MIDI" not found.');
    } else {
        console.log('id:', port.id, 'manufacturer:', port.manufacturer, 'name:', port.name, 'version:', port.version);
        console.log('Opening MIDI port...');
        await port.open();
        console.log('MIDI port is ready.');
        return port;
    }
}
