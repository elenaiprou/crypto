<!-- HEADINGS -->
# Proyecto MyCrypto - BCZERO VII 2021 -

## Instalaciones

* Nombre del proyecto: crypto_project

* Trabajamos con la base de datos: sqlite3

* Instalar las dependencias del fichero requirements.txt:

        pip install -r requirements.txt

* Duplicar el fichero .env_template y renombrar a .env

Los valores deben ser:

    FLASK_APP=run.py

    FLASK_ENV=el que querais

* Duplicar el fichero confing_template.py y renombrar a config.py

Los valores deben ser:

    DATABASE = 'ruta de la base de datos'
    API_KEY = 'contraseña api'

* Ejecutar Flask run


## BBDD

Crear una carpeta "data" fuera de la carpeta del proyecto. Donde guardaremos nuestra BBDD:

    Para crear nuestra base de datos:
    
    * Duplicar el fichero crypto_template.db y renombrar a crypto.db.
    * Añadirlo en la carpeta data previamente creada. 


## Conexión con API CoinMarket

Generamos la conexion con CoinMarket mediante la clase CMC. Donde uso headers para introducir la clave. que me la proporciona el archivo config.py mediante la API_KEY. 

