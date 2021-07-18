<!-- HEADINGS -->
# Proyecto MyCrypto - BCZERO VII 2021 -

## Instalaciones

* Nombre del proyecto: crypto_project

* Trabajamos con la base de datos: sqlite3

* Instalar las dependencias del fichero requirements.txt:

        pip install -r requirements.txt

* Renombrar el fichero ".env_templat a .env

Los valores deben ser:

    FLASK_APP=run.py

    FLASK_ENV=el que querais (ej: development)

* Renombrar el fichero confing_template.py a config.py

Los valores deben ser:

    DATABASE = 'ruta de la base de datos' -- poner la ruta de la base de datos y el nombre del archivo (ej: 'data/crypto.db')
    API_KEY = 'contraseña api'

* Activar entorno virtual 
    mandato con windows: venv\Scripts\activate

* Ejecutar Flask run


## BBDD

Crear una carpeta "data" fuera de la carpeta crypto_projecr, mediante la consola. En esta carpeta es donde donde guardaremos nuestra BBDD. 
Usando la consola:

    1. Entramos en la carpeta creada "data" -- cd data.

    2. Escribimos: sqlite3 crypto.db

    3. Escribir mandato: .read ../migrations/initial.sql

    4. Para comprobar que se ha creado la base de datos escribimos: .tables
    
    5. Para salir de sqlite3 en la consola poner comando: .q


## Conexión con API CoinMarket

Darse de alta en la API CoinMarke: https://coinmarketcap.com/api/ para conseguir la api key siguiendo sus instrucciones.

Generamos la conexion con CoinMarket mediante la clase CMC. Donde usamos headers para introducir la clave, esta clave se guarda en el archivo config.py en API_KEY. 

