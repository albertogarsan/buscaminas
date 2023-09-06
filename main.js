const container = document.querySelector('.container')
const item = document.querySelector('.item')
const formulari = document.querySelector('#formulari')
const buttonFlag = document.querySelector('.buttonFlag')
let inputMode = "default"

buttonFlag.addEventListener('click', (e) => {
    if (inputMode == "default") {
        inputMode = "flag"
    } else if (inputMode == "flag"){
        inputMode = "default"
    }
})


let dimensio
let dificultat

formulari.addEventListener('submit', (e) => {
    e.preventDefault()
    dimensio = +e.target.dimensio.value
    dificultat = +e.target.dificultat.value

    container.style.gridTemplateColumns = `repeat(${dimensio}, 1fr)`
    createCanvas(dimensio)
    colocarMines()
})

container.addEventListener('click', (e) => {
    console.log(inputMode)
    if (inputMode == "default") {
        console.log("DEFAULT")
        const x = +e.target.dataset.x
        const y = +e.target.dataset.y

        console.log(`(${x}, ${y})`)
        //aci treballarem en la dificultat
        console.log("Nº total de casselles:", dimensio ** 2)
        console.log("Dificultat:", +dificultat)

        if (e.target.dataset.mina) {
            mostrarTotesLesMines()
            e.target.style.backgroundColor = "red"
            console.log("HAS PERDUT!")
            container.style.pointerEvents = "none"
        } else {
            const vegadesMina = minesColindants(x, y)
            e.target.style.backgroundColor = "green"
            //Crea automàticament el atribut data
            e.target.dataset.mostrat = "true"
            if (vegadesMina > 0) {
                e.target.textContent = `${vegadesMina}`
            } else {
                mostrarRegio(x, y)
            }
        }

        const resultatFinal = comprovarResultat()
        if (resultatFinal) {
            console.log("HAS GUANYAT!")
        }
    } else {
        console.log("FLAG")
        console.log(e.target)
        const x = +e.target.dataset.x
        const y = +e.target.dataset.y
        const div = document.querySelector(`[data-x='${x}'][data-y='${y}']`)

        if (div.dataset.mostrat) {
            return
        }

        if (div.textContent) {
            div.textContent = ''
            div.removeAttribute("data-flag")
        } else {
            div.textContent = '🚩'
            div.dataset.flag = true
        }

        const resultatFinal = comprovarResultat()
        if (resultatFinal) {
            console.log("HAS GUANYAT!")
        }
    }

})

container.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    console.log(e.target)
    const x = +e.target.dataset.x
    const y = +e.target.dataset.y
    const div = document.querySelector(`[data-x='${x}'][data-y='${y}']`)

    if (div.dataset.mostrat) {
        return
    }

    if (div.textContent) {
        div.textContent = ''
        div.removeAttribute("data-flag")
    } else {
        div.textContent = '🚩'
        div.dataset.flag = true
    }

    const resultatFinal = comprovarResultat()
    if (resultatFinal) {
        console.log("HAS GUANYAT!")
    }
})

function comprovarResultat() {
    let resultat = true
    for (let y = 1; y <= dimensio; y++) {
        for (let x = 1; x <= dimensio; x++) {
            const div = document.querySelector(`[data-x='${x}'][data-y='${y}']`)
            if (div.dataset.mina) {
                if (!div.dataset.flag) {
                    resultat = false
                }
            } else {
                if (!div.dataset.mostrat) {
                    resultat = false
                }
            }
        }
    }
    return resultat
}

function mostrarTotesLesMines() {

    for (let y = 1; y <= dimensio; y++) {
        for (let x = 1; x <= dimensio; x++) {
            const div = document.querySelector(`[data-x='${x}'][data-y='${y}']`)
            if (div.dataset.mina) {
                div.textContent = '💥'
            }
        }
    }
}

function mostrarRegio(x, y) {
    const objColindant = trobarColindants(x, y)

    for (const key in objColindant) {
        //Comprova que l'objecte tinga un atribut que es dia key
        if (Object.hasOwnProperty.call(objColindant, key)) {
            const element = objColindant[key];

            const coordX = element[0]
            const coordY = element[1]

            const divColindant = document.querySelector(`[data-x='${coordX}'][data-y='${coordY}']`)

            if (!divColindant || divColindant.dataset.mostrat || divColindant.dataset.mina) {
                continue
            }

            const minesAdjacents = minesColindants(coordX, coordY)
            divColindant.dataset.mostrat = "true"
            divColindant.style.backgroundColor = "green"

            if (minesAdjacents > 0) {
                divColindant.textContent = `${minesAdjacents}`
            } else {
                mostrarRegio(coordX, coordY)
            }

        }
    }
}

/**
 * @param {dimensio} dimensio en función de la dimensión pasada por parámetro crea en el DOM las casillas y le añadimos el atributo data para obtener referencia de donde estamos haciedo clic
 */
function createCanvas(dimensio) {
    //const numItems = dimensio ** 2
    container.innerHTML = ''

    /* for (let item = 1; item <= numItems; item++) {
        const div = document.createElement('div')
        div.classList.add('item')
        container.appendChild(div)
        div.setAttribute("data-x", item)
    } */

    for (let y = 1; y <= dimensio; y++) {
        for (let x = 1; x <= dimensio; x++) {
            const div = document.createElement('div')
            div.classList.add('item')
            container.appendChild(div)
            div.setAttribute("data-x", x)
            div.setAttribute("data-y", y)
        }
    }
}

/**
 * Coloca las minas random en coordenadas posibles en las casillas del contenedor habiendo la posibilidad de repetir posiciones de minas. Futuras iteraciones evaluar que esto no ocurra, por ejemplo.
 */
function colocarMines() {
    const numMines = Math.floor(dificultat * dimensio ** 2 / 100)

    //Colocar per a cada item(mina) tindrem que elegir aleatoriament dos cordenades x e y random, comprovar que no hi haja ja una mina en el mateix lloc en esta operació i afegir la nova mina, haurem de dur un track intern.

    for (let mina = 0; mina < numMines; mina++) {
        const randomX = Math.ceil(Math.random() * dimensio)
        const randomY = Math.ceil(Math.random() * dimensio)

        const divAmbMina = document.querySelector(`[data-x='${randomX}'][data-y='${randomY}']`)

        divAmbMina.setAttribute("data-mina", "true")
        /* divAmbMina.style.backgroundColor = "orange" */
    }
}

/** 
 * @param {*} x el eje X que esperamos que sean de tipo numérico.
 * @param {*} y el eje Y que esperamos que sean de tipo numérico.
 * @returns un number que es el número de minas colindantes.
 */
function minesColindants(x, y) {
    const objColindant = trobarColindants(+x, +y)
    const vegadesMina = contarMinesColindants(objColindant)

    return vegadesMina
}

function trobarColindants(x, y) {
    const objColindant = {
        dalt: [x, (y - 1)],
        baix: [x, (y + 1)],
        dreta: [(x + 1), y],
        esquerra: [(x - 1), y],
        daltEsquerra: [(x - 1), (y - 1)],
        daltDreta: [(x + 1), (y - 1)],
        baixEsquerra: [(x - 1), (y + 1)],
        baixDreta: [(x + 1), (y + 1)]
    }

    return objColindant
}

function contarMinesColindants(objColindant) {
    let vegadesMina = 0

    for (const key in objColindant) {
        //Comprova que l'objecte tinga un atribut que es dia key
        if (Object.hasOwnProperty.call(objColindant, key)) {
            const element = objColindant[key];
            //const [coordX, coordY] = objColindant[key]; Destructuring
            /* console.log(key)
            console.log(element)
            console.log("-------") */
            const coordX = element[0]
            const coordY = element[1]
            const divColindant = document.querySelector(`[data-x='${coordX}'][data-y='${coordY}']`)

            /* if (divColindant) {
                if (divColindant.hasAttribute("data-mina")){
                    console.log()
                }
            } */

            if (divColindant && divColindant.hasAttribute("data-mina")) {
                vegadesMina++
            }
        }
    }

    return vegadesMina
}