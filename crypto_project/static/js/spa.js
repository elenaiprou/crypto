const categoria = {
    EUR: 'Euros',
    ETH: 'Ethereum',
    LTC: 'Litecoin',
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
    document.querySelector("#Cantidad").value = crypto.from_cantidad.toFixed(2)
    document.querySelector("#A moneda").value = crypto.to_moneda
    document.querySelector("#Cantidad").value = crypto.to_cantidad.toFixed(2)
    
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
    movimiento.fecha = document.querySelector("#fecha").value
    movimiento.concepto = document.querySelector("#concepto").value
    movimiento.categoria = document.querySelector("#categoria").value
    movimiento.cantidad = document.querySelector("#cantidad").value
    if (document.querySelector("#gasto").checked) {
        movimiento.esGasto = 1
    } else {
        movimiento.esGasto = 0
    }
    return movimiento
}

function validar(movimiento) {
    if (!movimiento.fecha) {
        alert("fecha obligatoria")
        return false
    }

    if (movimiento.concepto === "") {
        alert("Se ha de informar del concepto")
        return false
    }

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
    
    if (movimiento.cantidad <= 0) {
        alert("Cantidad ha de ser positiva")
        return false
    }

    return true
}

/*
function llamaApiModificaMovimiento(ev) {
    ev.preventDefault()
    id = document.querySelector("#idMovimiento").value
    if (!id) {
        alert("Selecciona un movimiento antes!")
        return
    }

    const movimiento = capturaFormMovimiento ()
    if (!validar(movimiento)) {
        return
    }

    xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    xhr.send(JSON.stringify(movimiento))
}

function llamaApiBorraMovimiento(ev) {
    ev.preventDefault()
    id = document.querySelector("#idMovimiento").value
    if (!id) {
        alert("Selecciona un movimiento antes!")
        return
    }

    xhr.open("DELETE", `http://localhost:5000/api/v1/movimiento/${id}`, true)
    xhr.onload = recibeRespuesta
    xhr.send()
}
*/


function gestionaRespuestaAsincrona() {
    if (this.readyState === 4 && this.status === 200) {
        console.log(this.responseText)
        const respuesta = JSON.parse(this.responseText)

        if(respuesta.Response === 'False') {
            alert("No se han encontrado resultados")
            return
        }

        folio.innerHTML = "" //forma de resetear la pagina

        for (let i=0; i < respuesta.Search.length; i++) {
            const pelicula = respuesta.Search[i]

            const div = document.createElement("div")
            div.className = "pelicula"

            const img = document.createElement("img")
            img.setAttribute("src", pelicula.Poster)
            img.setAttribute("alt", "Carátula de la película")

            const p = document.createElement("p")
            const textoP = `${pelicula.Title} (${pelicula.Year})`
            p.innerHTML = textoP

            const btn = document.createElement("a")
            btn.setAttribute("href", `https://www.imdb.com/title/${pelicula.imdbID}/`)
            btn.setAttribute("target", "_blank")
            btn.className = "button"
            btn.classList.add("info")
            btn.innerHTML = "Más info..."

            p.appendChild(btn)
            
            div.appendChild(img)
            div.appendChild(p)


            folio.appendChild(div)

        }
    }
}

const xhr = new XMLHttpRequest() //lanza peticiones en forma asincrona
xhr.onload = gestionaRespuestaAsincrona //es un metodo con una funcion que me devuelve la petición

document.querySelector("#buscar")
    .addEventListener("click", () => {
        const palabras = document.querySelector("#entrada").value
        xhr.open('GET', `http://www.omdbapi.com/?s=${palabras}&apikey=fa18b2e1-adbb-4d52-8173-db21b646d7f1`, true)
        xhr.send()
        console.log("He lanzado petición")
    })

function llamaApiCreaMovimiento(ev) {
    ev.preventDefault()
    const movimiento = capturaFormMovimiento ()
    if (!validar(movimiento)) {
        return
    }

    xhr.open("POST", `http://localhost:5000/api/v1/movimiento`, true)
    xhr.onload = recibeRespuesta

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
    
    xhr.send(JSON.stringify(movimiento))
}

window.onload = function() {
    llamaApiMovimientos()
    
        document.querySelector("#Realizar")
        .addEventListener("click", llamaApiCreaMovimiento)
}
