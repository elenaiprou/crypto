<!-- HEADINGS -->
# Proyecto MyCrypto - BCZERO VII 2021 -

## Instalaciones

### Creación entorno virtual

* python -m venv venv (el segundo nombre es el nombre de la carpeta del entorno virtual)

* Activar entorno virtual 

    mandato con Windows: venv\Scripts\activate
    
    mandato con Mac: . venv/bin/activate

### Creación del proyecto (repositorio)

* Carpeta del proyecto (fuera de la carpeta venv): crypto_project

* Trabajamos con la base de datos: sqlite3

* Instalar las dependencias del fichero requirements.txt:

        pip install -r requirements.txt

* Renombrar el fichero ".env_templat" a ".env"

* Renombrar el fichero "confing_template.py" a "config.py"

#### BBDD

Crear una carpeta "data" fuera de la carpeta crypto_project, mediante la consola. En esta carpeta es donde guardaremos nuestra BBDD. 
Usando la consola:

    1. Entramos en la carpeta creada "data" -- cd data.

    2. Escribimos: sqlite3 "nombre_de_la_BBDD.db" (ej: crypto.db)

    3. Escribir mandato: .read ../migrations/initial.sql

    4. Para comprobar que se ha creado la base de datos escribimos: .tables
    
    5. Para salir de sqlite3 en la consola poner comando: .q

Una vez creada la base de datos:

* En el fichero .env se han de colocar los siguientes valores:

    FLASK_APP=run.py

    FLASK_ENV=el que querais (ej: development)

* En el fichero config.py los valores deben ser:

    DATABASE = 'ruta de la base de datos' -- poner la ruta de la base de datos y el nombre del archivo (ej: 'data/crypto.db')
    
    API_KEY = 'contraseña api entre comillas' (ver apartado Conexión API CoinMarket)

* Ejecutar: Flask run

* Abrir servidor: http://localhost:5000/


## Conexión con API CoinMarketcap

Darse de alta en la API CoinMarketcap: https://coinmarketcap.com/api/ para conseguir la api key siguiendo sus instrucciones.

Generamos la conexion con CoinMarket mediante la clase CMC. Donde usamos headers para introducir la clave, esta clave se guarda en el archivo config.py en API_KEY. 

