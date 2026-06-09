#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MPU6050.h>
#include <WiFi.h>       // <--- AJOUTÉ
#include <HTTPClient.h> // <--- AJOUTÉ

Adafruit_SSD1306 display(128, 64, &Wire, -1);
Adafruit_MPU6050 mpu;

const int potPin = 34;
const int btnPin = 12;

void setup() {
  Serial.begin(115200);
  
  // 1. DÉMARRAGE WIFI (Indispensable pour envoyer à Soulaimane)
  WiFi.begin("Wokwi-GUEST", ""); 
  Serial.print("Connexion au WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connecté !");

  Wire.begin(21, 22); 

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println("OLED non trouvé");
  }
  
  if (!mpu.begin()) {
    Serial.println("MPU6050 non trouvé");
  }

  pinMode(btnPin, INPUT_PULLUP);

  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setCursor(0,10);
  display.println("BRACELET CONNECTE");
  display.display();
}

void loop() {
  // 1. Lecture des capteurs
  int valeurBrute = analogRead(potPin);
  int bpm = map(valeurBrute, 0, 4095, 40, 180);
  bool sos = (digitalRead(btnPin) == LOW);

  // 2. Affichage local
  display.clearDisplay();
  display.setCursor(0,0);
  display.setTextSize(2); // Un peu plus gros pour mieux voir
  display.print("BPM: "); display.println(bpm);
  if(sos) {
    display.setTextSize(1);
    display.println("!!! SOS ENVOYE !!!");
  }
  display.display();

  // 3. ENVOI TOUTES LES 5 SECONDES
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 5000) { 
    envoyerDonnees(bpm, sos);
    lastSend = millis();
  }

  delay(100);
}

void envoyerDonnees(int b, bool s) {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // 1. La nouvelle route précise
    http.begin("http://172.29.20.243:3000/api/measures"); 
    http.addHeader("Content-Type", "application/json");

    // 2. Le JSON avec les noms exacts : id_bracelet, bpm, batterie
    // On simule une batterie à 85% pour le test
    String json = "{\"id_bracelet\":\"BRACELET_01\", \"bpm\":" + String(b) + ", \"batterie\":85}";
    
    int response = http.POST(json);
    
    Serial.print("Envoi... Code réponse : ");
    Serial.println(response); 

    if(response == 201) {
      Serial.println("Victoire ! Données dans la BDD.");
    }

    http.end();
  }
}