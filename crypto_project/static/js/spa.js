const categoria = {
    EUR: 'Euros',
    ETH: 'Ethereum',
    LTC: 'Litecoin',
    BNB: 'Binance Coin',
    EOS: 'EOS',
    XLM: 'Stellar',
    TRX: 'TRON',
    BTC: 'Bitcoin',
    XRP: 'XRP',
    BCH: 'Bitcoin Cash',
    USDT: 'Tether',
    BSV: 'Bitcoin SV',
    ADA: 'Cardano',
}

let losMovimientos //variable global sin nada, para guardar los movimientos "pa' luego"
// var folio = document.querySelector("#folio")

xhr = new XMLHttpRequest()
xhr.onload = muestraMovimientos

function recibeRespuesta() {
    if (this.readyState === 4 && (this.status ===200 || this.status === 201)) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status != "success"){
            alert("Se ha producido un error en acceso a servidor " + respuesta.mensaje)
            return
        }

        alert(respuesta.mensaje)

        llamaApiMovimientos()
    }
}

function detallaMovimiento(id) {

    //movimiento = losMovimientos.filter(item => item.id == id )[0]

    let movimiento
    for (let i=0; i<losMovimientos.length; i++) {
        const item = losMovimientos[i]
        if (item.id == id ) {
            movimiento = item
            break
        }
    }

    if (!movimiento) return //esto es si la variable movimiento no existe.

    document.querySelector("#idMovimiento").value = id
    document.querySelector("#Fecha").value = crypto.fecha
    document.querySelector("#De moneda").value = crypto.from_moneda
    document.querySelector("#Cantidad").value = crypto.from_cantidad.toFixed(8)
    document.querySelector("#A moneda").value = crypto.to_moneda
    document.querySelector("#Cantidad").value = crypto.to_cantidad.toFixed(8)
    
}


function muestraMovimientos() {
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en la consulta de movimientos")
            return
        }

        losMovimientos = respuesta.crypto
        const tbody = document.querySelector(".tabla-crypto tbody")
        tbody.innerHTML = ""

        for (let i = 0; i < respuesta.crypto.length; i++) {
            const movimiento = respuesta.crypto[i]
            const fila = document.createElement("tr")
            fila.addEventListener("click", () => {
                detallaMovimiento(movimiento.id)
            })

            const dentro = `
                <td>${movimiento.fecha}</td>
                <td>${movimiento.from_moneda}</td>
                <td>${movimiento.from_cantidad}</td>
                <td>${movimiento.to_moneda}</td>
                <td>${movimiento.to_cantidad}</td>
            `
            fila.innerHTML = dentro

            tbody.appendChild(fila)
        }
    }
}

function llamaApiMovimientos() {
    xhr.open('GET', `http://localhost:5000/api/v1/movimientos`, true)
    xhr.onload = muestraMovimientos
    xhr.send()
}

function capturaFormMovimiento() {
    const movimiento = {}
    let today = new Date().toISOString().slice(0, 10);
    console.log(today)

    movimiento.fecha = today
    movimiento.from_moneda = document.querySelector("#categoria").value
    movimiento.from_cantidad = document.querySelector("#from_cantidad").value
    movimiento.to_moneda = document.querySelector("#cambio").value
    movimiento.to_cantidad = document.querySelector("#precio").value
    return movimiento
}

function validar(movimiento) {
    if (movimiento.from_moneda == "EUR" && movimiento.to_moneda =='EUR') {
        alert("Cambio no permitido")
        return false
    }

    if (movimiento.from_cantidad <= 0) {
        alert("Cantidad ha de ser positiva")
        return false
    }

/*  
    if (document.querySelector("#gasto").checked && !document.querySelector("#ingreso").checked) {
        alert("Elija tipo de movimiento")
        return false
    }

    if (movimiento.esGasto && !movimient.categoria) {
        alert("Debe seleccionar categoria del gasto")
        return false
    }

    if (!movimiento.esGasto && movimient.categoria) {
        alert("Un ingewao no puede tener categoria")
        return false
    }
    
 */
    return true

}

function llamaApiCoinmarket(evento) { //por ahora tengo que baserme en esto 
    const movimiento = {}
    movimiento.from_moneda = document.querySelector("#categoria").value
    movimiento.from_cantidad = document.querySelector("#from_cantidad").value
    movimiento.to_moneda = document.querySelector("#cambio").value
    
    return movimiento
    }

function calculaApiCoinMarket (ev) {
    ev.preventDefault()
    const movimiento = llamaApiCoinmarket()
    if (!validar(movimiento)) {
        return
    }
    xhr.open("GET", `http://localhost:5000/api/v1/par/${movimiento.from_cantidad}/${movimiento.from_moneda}/${movimiento.to_moneda}`, true)
    xhr.onload = recibeRespuestaCoinmarket //me falta esta funcion 
    xhr.send()
    console.log("He lanzado petición a Coin Market")
}

function recibeRespuestaCoinmarket() {
    va = JSON.parse(this.responseText)
    fe = Object.keys(va.resultado.quote)[0]
    data = va.resultado.quote[fe].price
    precioUnitario = data / va.resultado.amount
    console.log(precioUnitario)

    document.querySelector("#precio").value = data.toFixed(8)
    document.querySelector("#unitario").value = precioUnitario.toFixed(8)
}

function llamaApiCreaMovimiento(ev) {
    ev.preventDefault()
    const movimiento = capturaFormMovimiento ()

    xhr.open("POST", `http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    
    xhr.send(JSON.stringify(movimiento))
}

window.onload = function() {
    llamaApiMovimientos()
    
        document.querySelector('#calcular')
        .addEventListener("click", calculaApiCoinMarket)

        document.querySelector("#realizar")
        .addEventListener("click", llamaApiCreaMovimiento)


}
