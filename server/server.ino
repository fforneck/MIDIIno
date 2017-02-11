#define NUMPADS 6  // number of pads

int val;
String inputString = "";

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
  inputString.reserve(100);
  for(byte piezo = 0; piezo < NUMPADS; piezo++) {
    state[piezo] = 0;
    piezoThresholds[piezo] = 50;
    relevantSamples[piezo] = 15;
    irrelevantNoise[piezo] = 100;
  }
}

void loop() {

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
          /*Serial.print(piezo);
          Serial.print(";");
          Serial.print(peak[piezo]);
          Serial.print(";");
          Serial.print(lastNoteStart[piezo]);
          Serial.print(";");
          Serial.print(piezoThresholds[piezo]);
          Serial.print(";");
          Serial.print(relevantSamples[piezo]);
          Serial.print(";");
          Serial.print(irrelevantNoise[piezo]);
          Serial.println();*/
          byte buf[13];
          buf[ 0] = piezo;
          buf[ 1] = highByte(peak[piezo]);
          buf[ 2] = lowByte(peak[piezo]);
          buf[ 3] = (byte) (lastNoteStart[piezo] >> 24);
          buf[ 4] = (byte) (lastNoteStart[piezo] >> 16);
          buf[ 5] = (byte) (lastNoteStart[piezo] >> 8);
          buf[ 6] = (byte) lastNoteStart[piezo];
          buf[ 7] = highByte(piezoThresholds[piezo]);
          buf[ 8] = lowByte(piezoThresholds[piezo]);
          buf[ 9] = highByte(relevantSamples[piezo]);
          buf[10] = lowByte(relevantSamples[piezo]);
          buf[11] = highByte(irrelevantNoise[piezo]);
          buf[12] = lowByte(irrelevantNoise[piezo]);
          Serial.write(buf, 13);
          state[piezo] = 2;
        }
        break;
      case 2:
        if (lastNoteStart[piezo] + irrelevantNoise[piezo] <= millis()) {
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
    // get the new byte:
    /*char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag
    // so the main loop can do something about it:
    if (inChar == '\n') {
      int div1 = inputString.indexOf(";");
      int div2 = inputString.indexOf(";", div1 + 1);
      int div3 = inputString.indexOf(";", div2 + 1);
      int piezo = inputString.substring(0,div1).toInt();
      piezoThresholds[piezo] = inputString.substring(div1 + 1, div2).toInt();
      relevantSamples[piezo] = inputString.substring(div2 + 1, div3).toInt();
      irrelevantNoise[piezo] = inputString.substring(div3 + 1).toInt();
      Serial.print("Setting piezo ");
      Serial.print(piezo);
      Serial.print(" piezoThresholds ");
      Serial.print(piezoThresholds[piezo]);
      Serial.print(" relevantSamples ");
      Serial.print(relevantSamples[piezo]);
      Serial.print(" irrelevantNoise ");
      Serial.println(irrelevantNoise[piezo]);
      inputString = "";
    }*/

    
    inputBytes[bytesRead++] = Serial.read();
    if (bytesRead == 7) {
      piezoThresholds[inputBytes[0]] = (unsigned int) (inputBytes[1] << 8) | inputBytes[2];
      relevantSamples[inputBytes[0]] = (unsigned int) (inputBytes[3] << 8) | inputBytes[4];
      irrelevantNoise[inputBytes[0]] = (unsigned int) (inputBytes[5] << 8) | inputBytes[6];
      bytesRead = 0;
    }
  }
}
