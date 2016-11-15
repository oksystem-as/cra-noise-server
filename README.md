# cra-noise-statis-server

Služba pro vypočet statistických hodnot z hlukových čidel.

## Konfigurace
Konfigurace je uložena v `config.yaml`.
Nastavuje se zde:  
`token` pro přístup k senzorům.  
`basePath` určující kde běží služba poskytující data ze senzorů.
`serverPort` pod kterým se má nastartovat služba.
Seznam `devEUIs` senzorů pro které se mají spočítat statistiky.

## Předpoklady pro spuštění
Pro spuštění i vývoj aplikace je potřeba mít nainstalovaný [Node.js]

## Spuštění
Pokud chcete službu spustit, stáhněte a rozbalte [poslední verzi]. A spusťte souborem `start.bat`, nebo příkazen `npm run prod_start`. 

## Vývoj
Instalace balíčků: `npm install`
Instalace Ts definicí: `npm run typings install`  
Build: `npm run grunt`

## Licence
GPLv3

[poslední verzi]: <https://github.com/oksystem-as/cra-noise-statis-server/releases/latest>
[Node.js]: <https://nodejs.org/en/>   