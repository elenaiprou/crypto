from flask import render_template, jsonify, request, Response
from crypto_project import app
from api_key_con_clase import CMC
from crypto_project.dataaccess import DBmanager
import sqlite3
from http import HTTPStatus
import requests


dbManager = DBmanager(app.config.get('DATABASE'))
cmc = CMC(app.config.get('API_KEY'))

@app.route('/')
def listaMovimientos():
    return render_template('spa.html')

@app.route('/api/v1/movimientos')
def movimientosAPI():
    query = "SELECT * FROM crypto ORDER BY fecha;"

    try:
        lista = dbManager.consultaMuchasSQL(query)
        return jsonify({'status': 'success', 'crypto': lista})
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})

@app.route('/api/v1/movimiento/<int:id>', methods=['GET'])
@app.route('/api/v1/movimiento', methods=['POST'])
def detalleMovimiento(id=None):

    try:
        if request.method in ('GET'):
            movimiento = dbManager.consultaUnaSQL("SELECT * FROM crypto WHERE id = ?", [id])

        if request.method == 'GET':
            if movimiento:
                return jsonify({
                    "status": "success",
                    "crypto": movimiento
                })
            else:
                return jsonify({"status": "fail", "mensaje": "movimiento no encontrado"}), HTTPStatus.NOT_FOUND

        if request.method == 'POST':


            dbManager.modificaTablaSQL("""
                INSERT INTO crypto
                    (fecha, from_moneda, from_cantidad, to_moneda, to_cantidad)
                VALUES (:fecha, :from_moneda, :from_cantidad, :to_moneda, :to_cantidad)
                """, request.json)

            return jsonify({"status": "success", "mensaje": "registro creado"}), HTTPStatus.CREATED

    except sqlite3.Error as e:
        print("BBDD error:", e)
        return jsonify({"status": "fail", "mensaje": "Error en base de datos: {}".format(e)}), HTTPStatus.BAD_REQUEST

#para hacer el cambio y comprar 
@app.route('/api/v1/par/<quantity>/<_from>/<_to>')
@app.route('/api/v1/par/<_from>/<_to>')
def buscaApi(quantity, _from, _to):
    try:
        res = cmc.priceConversion(quantity, _from, _to)
        return jsonify({'status': 'success', 'resultado': res})
    
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})

#para hacer los calculos monedas invertidas
@app.route('/api/v1/cal/<quantity>/<_from>/<_to>')
def monedasInv(quantity, _from, _to):
    try:
        res = cmc.priceConversion(quantity, _from, _to)
        return jsonify({'status': 'success', 'resultado': res})
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})


#intentando hacer los calcuos desde BBDD. Por ahora no sigo por aquí
@app.route('/api/v1/movimiento/operamos')
def calculos():

    query = "SELECT SUM(to_cantidad) FROM crypto GROUP BY to_moneda"

    try:
        lista = dbManager.calculaSaldos(query)
        return jsonify({'status': 'success', 'crypto': lista})
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})
