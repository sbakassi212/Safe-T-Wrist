#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);
Adafruit_MPU6050 mpu;
const int potPin = 34;

void setup() {
  Serial.begin(115200);
  
  // Initialisation OLED
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println("Erreur OLED");
    for(;;);
  }
  
  // Initialisation MPU6050
  if (!mpu.begin()) {
    Serial.println("Erreur MPU6050");
    while (1) yield();
  }

  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("Bracelet Connecte");
  display.display();
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  display.clearDisplay();
  display.setCursor(0,0);
  display.print("AccX: "); display.println(a.acceleration.x);
  display.print("AccY: "); display.println(a.acceleration.y);
  display.display();
  delay(500);
  // 1. Lire la valeur brute (0 à 4095)
  int valeurBrute = analogRead(potPin);

  // 2. Transformer cette valeur en BPM (40 à 180)
  int bpm = map(valeurBrute, 0, 4095, 40, 180);

  // 3. Afficher le résultat
  Serial.print("Simul. Rythme Cardiaque : ");
  Serial.print(bpm);
  Serial.println(" BPM");

  // 4. Logique d'alerte
  if (bpm > 150) {
    Serial.println("ATTENTION : Rythme trop élevé !");

    bool sosSend = false;
    if (!sosSend) {
      display.println("Envoi du SOS...");
      sosSend = true;
    }

  }
}
