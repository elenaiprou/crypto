from flask import render_template, jsonify, request, Response
from crypto_project import app
from crypto_project.api_key_con_clase import CMC
from crypto_project.dataaccess import DBmanager
import sqlite3
from http import HTTPStatus


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
            if request.json['from_moneda'] != "EUR":
                
                query1 = "SELECT SUM(to_cantidad), to_moneda FROM crypto GROUP BY to_moneda"
                lista1 = dbManager.calculaSaldos(query1)
                
                for t in lista1:

                    if (t['to_moneda'] == request.json['from_moneda']) and (t['SUM(to_cantidad)'] <= float(request.json['from_cantidad'])):
                        return jsonify({"status": "fail", "mensaje": "saldo insuficiente"}), HTTPStatus.OK

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


#Cálcuos desde BBDD. --> JSON con las monedas finales invertidas menos los EUR.
@app.route('/api/v1/movimiento/operamos')
def calculos(quantity = None, _from =None):

    query2 = "SELECT SUM(from_cantidad), from_moneda FROM crypto GROUP BY from_moneda"
    query1 = "SELECT SUM(to_cantidad), to_moneda FROM crypto GROUP BY to_moneda"
    
    try:
        lista1 = dbManager.calculaSaldos(query1)
        lista2 = dbManager.calculaSaldos(query2)

        lista =[]
        saldoFinal = []

        for t in lista1:
            if t['to_moneda'] == "EUR":
                pass
            else:
                saldo = t['SUM(to_cantidad)']
                for f in lista2:
                    if t['to_moneda'] == f['from_moneda']:
                        saldo = t['SUM(to_cantidad)'] - f["SUM(from_cantidad)"]

                lista.append(t['to_moneda'])
                saldoFinal.append(saldo)
        diccfi = dict(zip(lista, saldoFinal))

        x=0
        EurosTot = 0
        for d in diccfi:
            x = diccfi[d]
            monedaEuros = cmc.eurosConversion(x, d)
            EurosTot += monedaEuros

        return jsonify({'status': 'success', 'crypto': EurosTot})
    
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})

#Cálcuos desde BBDD. --> JSON con calculo EUR final.
@app.route('/api/v1/movimiento/operamos/euros')
def calculosEuros():

    query2 = "SELECT SUM(from_cantidad), from_moneda FROM crypto GROUP BY from_moneda"
    query1 = "SELECT SUM(to_cantidad), to_moneda FROM crypto GROUP BY to_moneda"

    try:
        lista1 = dbManager.calculaSaldos(query1)
        lista2 = dbManager.calculaSaldos(query2)

        for t in lista1:
            if t['to_moneda'] == "EUR":
                for f in lista2:
                    if t['to_moneda'] == f['from_moneda']:
                        saldoEuros = f["SUM(from_cantidad)"] - t['SUM(to_cantidad)']
            else:
                pass

        return jsonify({'status': 'success', 'crypto': saldoEuros})

    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})