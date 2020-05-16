int sensorPin = A4;    // select the input pin for the potentiometer
int ledPin = 13;      // select the pin for the LED
int sensorValue = 0;  // variable to store the value coming from the sensor

//A0: vlue
//A1: green
//A2: yellow
//A3: red
 
void setup() {
  // declare the ledPin as an OUTPUT:
  pinMode(ledPin, OUTPUT);
  // begin the serial monitor @ 57600 baud
  Serial.begin(57600);
}
 
void loop() {
  // read the value from the sensor:
  sensorValue = analogRead(sensorPin);
 
  Serial.println(sensorValue);
  Serial.print(" ");
 
  delay(20);
}
