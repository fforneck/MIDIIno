#define NUMPADS 5  // number of pads

// config
unsigned int piezoThresholds[NUMPADS];
unsigned int relevantSamples[NUMPADS];
unsigned int irrelevantNoise[NUMPADS];

// data
byte state[NUMPADS];
unsigned int peak[NUMPADS];
unsigned long lastNoteStart[NUMPADS];
unsigned int sampleCount[NUMPADS];

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(57600);
  for(byte piezo = 0; piezo < NUMPADS; piezo++) {
    state[piezo] = 0;
    piezoThresholds[piezo] = 50;
    relevantSamples[piezo] = 15;
    irrelevantNoise[piezo] = 100;
  }
}

void loop() {

  int val;

  for(byte piezo = 0; piezo < NUMPADS; piezo++) {
    switch(state[piezo]) {
      case 0:
        val = analogRead(piezo);
        if (val >= piezoThresholds[piezo]) {
          state[piezo] = 1;
          lastNoteStart[piezo] = millis();
          sampleCount[piezo] = 1;
          peak[piezo] = val;
        }
        break;
      case 1:
        val = analogRead(piezo);
        if (val > peak[piezo]) {
          peak[piezo] = val;
        }
        sampleCount[piezo]++;
        if (sampleCount[piezo] >= relevantSamples[piezo]) {
          byte buf[3];
          buf[ 0] = piezo;
          buf[ 1] = highByte(peak[piezo]);
          buf[ 2] = lowByte(peak[piezo]);
          Serial.write(buf, 3);
          state[piezo] = 2;
        }
        break;
      case 2:
        if (millis() >= lastNoteStart[piezo] + irrelevantNoise[piezo]) {
          state[piezo] = 0;
        }
        break;
    }
  }
}

byte inputBytes[7];
byte bytesRead = 0;
void serialEvent(){  
  while (Serial.available()) {    
    inputBytes[bytesRead++] = Serial.read();
    if (bytesRead == 7) {
      piezoThresholds[inputBytes[0]] = (unsigned int) (inputBytes[1] << 8) | inputBytes[2];
      relevantSamples[inputBytes[0]] = (unsigned int) (inputBytes[3] << 8) | inputBytes[4];
      irrelevantNoise[inputBytes[0]] = (unsigned int) (inputBytes[5] << 8) | inputBytes[6];
      bytesRead = 0;
    }
  }
}
