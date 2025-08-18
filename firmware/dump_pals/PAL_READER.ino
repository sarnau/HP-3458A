const int outputFirstPin = 22;
const int outputPinCount = 14;
const int inputFirstPin = 2;
const int inputPinCount = 8;

void setup() {
  Serial.begin(115200);
  for (unsigned idx = 0; idx < outputPinCount; idx++) {
    pinMode((idx * 2) + outputFirstPin, INPUT);
  }
  for (unsigned idx = 0; idx < inputPinCount; idx++) {
    pinMode(inputFirstPin + idx, OUTPUT);
  }
}

void loop() {
  for (unsigned adr = 0; adr < 256; ++adr) {
    for (unsigned idx = 0; idx < inputPinCount; idx++) {
      if (adr & (1 << idx)) {
        digitalWrite(inputFirstPin + idx, HIGH);
      } else {
        digitalWrite(inputFirstPin + idx, LOW);
      }
    }
    Serial.print(adr | 0x100, BIN); // set bit 8 for better formatting of the binary output
    Serial.print(" - ");
    unsigned long value = 0x10000; // set bit 16 for better formatting of the binary output
    for (unsigned idx = 0; idx < outputPinCount; idx++) {
      value |= digitalRead((idx * 2) + outputFirstPin) << idx;
    }
    Serial.println(value, BIN);
  }
  while(1) {}
}
