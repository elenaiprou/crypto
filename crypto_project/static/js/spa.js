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
let eurosInvertidos = 0

//let gastado = {}
//let invertido = {}
//let monedasFinal = {}
//let eurosGastados = 0
//let posiconActual = 0
//let contador = 0


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
    //calculos()
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

// validaciones antes de hacer el calculo de una moneda por otra
function validaCalcular(movimiento) {
    if (movimiento.from_moneda == "EUR" && movimiento.to_moneda =='EUR') {
        alert("Cambio no permitido")
        return false
    }

    if (movimiento.from_cantidad <= 0) {
        alert("Cantidad ha de ser positiva")
        return false
    }
    return true
}

// validaciones antes de grabar el cambio en la base de datos
function validaRealizar(movimiento) {
    
    if (movimiento.to_cantidad <= 0) {
        alert("Operación no valida")
        return false
    }

    gastado = resultsGastado()
    invertido = resultadosInvertido()
    monedasFinal = posicionMonedas(gastado, invertido)
    
    if (monedasFinal[movimiento.from_moneda] == 0) {
        alert("Cambio no permitido")
        return false
    }

    if (movimiento.from_moneda != "EUR" && (monedasFinal[movimiento.from_moneda]< movimiento.from_cantidad)){
        alert("No tienes saldo suficiente")
        return false
    }
    return true
}

function llamaApiCoinmarket() { 

    const movimiento = {}
    movimiento.from_moneda = document.querySelector("#categoria").value
    movimiento.from_cantidad = document.querySelector("#from_cantidad").value
    movimiento.to_moneda = document.querySelector("#cambio").value
    
    return movimiento
}

function calculaApiCoinMarket (ev) {
    ev.preventDefault()
    const movimiento = llamaApiCoinmarket()
    if (!validaCalcular(movimiento)) {
        return
    }
    xhr.open("GET", `http://localhost:5000/api/v1/par/${movimiento.from_cantidad}/${movimiento.from_moneda}/${movimiento.to_moneda}`, true)
    xhr.onload = recibeRespuestaCoinmarket 
    xhr.send()
    console.log("He lanzado petición a Coin Market")
}

function recibeRespuestaCoinmarket() {
    variable = JSON.parse(this.responseText)
    fe = Object.keys(variable.resultado.quote)[0] //le he pueste "fe" a la variable porque no sabia que poner
    data = variable.resultado.quote[fe].price
    precioUnitario = data / variable.resultado.amount
    console.log(precioUnitario)

    document.querySelector("#precio").value = data.toFixed(8)
    document.querySelector("#unitario").value = precioUnitario.toFixed(8)
}

function llamaApiCreaMovimiento(ev) {
    ev.preventDefault()
    const movimiento = capturaFormMovimiento ()
    if (!validaRealizar(movimiento)) {
        return
    }
    xhr.open("POST", `http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    
    xhr.send(JSON.stringify(movimiento))
}

// llama a la Api de CoinMarket para realizar el cambio a euros
function InversionApiCoinMarket (key, valor) {

    xhr.open("GET", `http://localhost:5000/api/v1/cal/${valor}/${key}/EUR`, true)
    xhr.onload = recibeInversionCoinmarket 
    xhr.send()
    console.log("He lanzado petición a Coin Market")
}

// me da el valor de las monedas invertidas en euros
function recibeInversionCoinmarket() {

    moneda = JSON.parse(this.responseText)
    fe = Object.keys(moneda.resultado.quote)[0]
    cambioAeuros = moneda.resultado.quote[fe].price
    //contador -=1
    calculaEuros(cambioAeuros)
    escribeResultados(eurosInvertidos)
    /*if (contadir == 1){
        escribeResultados(eurosInvertidos)
    }*/
}

//queria que sumara el valor total de los euros invertidos
function calculaEuros(cambioAeuros){

    eurosInvertidos += cambioAeuros
}

//calcula la posicon final de cada moneda y lo manda funcion InversionApiCoinMarket & recibeInversionCoinmarket que me devuelve el valor en euros. 
function calculos(ev) {
    ev.preventDefault()
        
    gastado = resultsGastado()
    invertido = resultadosInvertido()
    monedasFinal = posicionMonedas(gastado, invertido)

    EnviarMonedasApi(monedasFinal)
}

//funcion lista de monedas gastadas
function resultsGastado(){

    let gastado = {
        EUR: 0,
        ETH: 0,
        LTC: 0,
        BNB: 0,
        EOS: 0,
        XLM: 0,
        TRX: 0,  
        BTC: 0,
        XRP: 0,
        BCH: 0,
        USDT: 0, 
        BSV: 0,
        ADA: 0,
        }

    losMovimientos.forEach(element=> 
        gastado[element.from_moneda]+= element.from_cantidad
        )
    return gastado
    
}
//funcion lista de monedas ivertidas
function resultadosInvertido(){
    
    let invertido= {
        EUR: 0,
        ETH: 0,
        LTC: 0,
        BNB: 0,
        EOS: 0,
        XLM: 0,
        TRX: 0,  
        BTC: 0,
        XRP: 0,
        BCH: 0,
        USDT: 0, 
        BSV: 0,
        ADA: 0,
        }

        losMovimientos.forEach(element=> 
            invertido[element.to_moneda]+= element.to_cantidad
            )
        return invertido
}
//funcion posicion final de cada moneda, menos de los EUR
function posicionMonedas(gastado, invertido){
    let monedasFinal = {};

    Object.keys(invertido).forEach(key => {
        if (gastado.hasOwnProperty(key)) {
            if (key == "EUR"){
                return
            }
            monedasFinal[key] = invertido[key] - gastado[key]
        }
    })
    return monedasFinal
}
//Envia posicion final de cada moneda a la api para hacer la conversion a EUR
function EnviarMonedasApi (monedasFinal){

    var interval = 1000
    Object.keys(monedasFinal).forEach((key, index) => {
        setTimeout(function() {
            valor = monedasFinal[key]
            if (sentIfvalueExist(valor)){
                //contador += 1  
                InversionApiCoinMarket(key, valor)}},
                index*interval)
    })
}

// sirve para evitar que valor = 0 llegue a la API. Si no peta la web de
function sentIfvalueExist(valor){ 
    var res
    if (valor == 0)
        res = false
    else
        res = true    
    return res
}

//Funcion que es llamada por "calculos" y escibe los resultados en el formulario Situación actual
function escribeResultados(eurosInvertidos){

    eurosGastados = gastado.EUR - invertido.EUR
    posiconActual = eurosInvertidos - eurosGastados

    document.querySelector("#saldoEuros").value = eurosInvertidos.toFixed(2)
    document.querySelector("#gastado").value = eurosGastados.toFixed(2)
    document.querySelector("#posicionfinal").value = posiconActual.toFixed(2)
}
/*
function numeroContactosApi(){
    
    contador = 1
}*/

window.onload = function() {
    llamaApiMovimientos()
    
        document.querySelector('#calcular')
        .addEventListener("click", calculaApiCoinMarket)

        document.querySelector("#realizar")
        .addEventListener("click", llamaApiCreaMovimiento)

        document.querySelector("#actualizar")
        .addEventListener("click", calculos)

        //document.querySelector("#actualizar")
        //.addEventListener("click", numeroContactosApi)
}
