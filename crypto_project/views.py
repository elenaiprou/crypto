from flask import render_template, jsonify, request
from crypto_project import app
from crypto_project.dataaccess import DBmanager
import sqlite3
from http import HTTPStatus

dbManager = DBmanager(app.config.get('DATABASE'))

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

@app.route('/api/v1/movimiento/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@app.route('/api/v1/movimiento', methods=['POST'])
def detalleMovimiento(id=None):

    try:
        if request.method in ('GET', 'PUT', 'DELETE'):
            movimiento = dbManager.consultaUnaSQL("SELECT * FROM crypto WHERE id = ?", [id])
        
        if request.method == 'GET':
            if movimiento:
                return jsonify({
                    "status": "success",
                    "crypto": movimiento
                })
            else:
                return jsonify({"status": "fail", "mensaje": "movimiento no encontrado"}), HTTPStatus.NOT_FOUND

        if request.method == 'PUT':
            dbManager.modificaTablaSQL("""
                UPDATE crypto 
                SET fecha=:fecha, concepto=:concepto, esGasto=:esGasto, categoria=:categoria, cantidad=:cantidad 
                WHERE id = {}""".format(id), request.json)
            
            return jsonify({"status": "success", "mensaje": "registro modificado"})
        
        if request.method == 'DELETE':
            dbManager.modificaTablaSQL("""
                DELETE FROM crypto
                WHERE id = ?""", [id])

            return jsonify({"status": "success", "mensaje": "registro borrado"})

        if request.method == 'POST':
            dbManager.modificaTablaSQL("""
                INSERT INTO crypto
                    (fecha, concepto, esGasto, categoria, cantidad)
                VALUES (:fecha, :concepto, :esGasto, :categoria, :cantidad)
                """, request.json)

            return jsonify({"status": "success", "mensaje": "registro creado"}), HTTPStatus.CREATED

    except sqlite3.Error as e:
        print("BBDD error:", e)
        return jsonify({"status": "fail", "mensaje": "Error en base de datos: {}".format(e)}), HTTPStatus.BAD_REQUEST
