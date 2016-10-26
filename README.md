## Spuštění

### Zakladní Spuštění
`docker run -d -P --name=iot-cra-cache hndocker.oksystem.local:40003/iot/iot-lora-cra-cache` 
Takto se API vystavý na nějaký volný port a začne cachovat zařízení s devEUI: 
- "0018B20000000336"
- "0018B20000000165"
- "0018B2000000016E"
- "0018B20000000337"
- "0018B2000000033C"
- "0018B2000000033A"
- "0018B20000000339"
- "0018B20000000335"
- "0004A30B001AEE16"
- "0004A30B001AE4D3"
- "0004A30B001968C8"
- "0004A30B00199234"
- "0004A30B0019D03E" 

### Spustění se změnou kofigurace 
`docker run -d -P --name=iot-cra-cache -v {config_file}://usr/src/iot-lora-cra-cache/config.yaml hndocker.oksystem.local:40003/iot/iot-lora-cra-cache`  
Kofigurace je v souboru `config.yaml`, pokud tedy chcete cachovat jiné zařízení, nebo změnit token, tak do konterneru namapujre změněný konfigurační soubor.