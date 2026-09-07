const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let jugando = false;

let jugador = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    tamaño: 25,
    velocidad: 5,
    vida: 100
};

let balas = [];
let enemigos = [];
let puntos = 0;

let teclas = {};

let mouse = {
    x: 0,
    y: 0
};

// -------------------------
// TECLADO
// -------------------------

document.addEventListener("keydown", (e) => {
    teclas[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    teclas[e.key.toLowerCase()] = false;
});

// -------------------------
// MOUSE
// -------------------------

canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

canvas.addEventListener("mousedown", () => {
    if (jugando) {
        disparar();
    }
});

// -------------------------
// INICIAR JUEGO
// -------------------------

function iniciarJuego() {

    jugador.x = canvas.width / 2;
    jugador.y = canvas.height / 2;
    jugador.vida = 100;

    balas = [];
    enemigos = [];

    puntos = 0;

    document.getElementById("vida").textContent = jugador.vida;
    document.getElementById("puntos").textContent = puntos;

    document.getElementById("menu").style.display = "none";
    document.getElementById("gameOver").style.display = "none";
    document.getElementById("hud").style.display = "block";

    jugando = true;

    crearEnemigo();

    juego();
}

// -------------------------
// MOVIMIENTO DEL JUGADOR
// -------------------------

function moverJugador() {

    if (teclas["w"]) jugador.y -= jugador.velocidad;
    if (teclas["s"]) jugador.y += jugador.velocidad;
    if (teclas["a"]) jugador.x -= jugador.velocidad;
    if (teclas["d"]) jugador.x += jugador.velocidad;

    // No salir de la pantalla

    jugador.x = Math.max(
        jugador.tamaño,
        Math.min(canvas.width - jugador.tamaño, jugador.x)
    );

    jugador.y = Math.max(
        jugador.tamaño,
        Math.min(canvas.height - jugador.tamaño, jugador.y)
    );
}

// -------------------------
// DISPARAR
// -------------------------

function disparar() {

    let dx = mouse.x - jugador.x;
    let dy = mouse.y - jugador.y;

    let distancia = Math.sqrt(dx * dx + dy * dy);

    let velocidadBala = 10;

    balas.push({
        x: jugador.x,
        y: jugador.y,
        dx: (dx / distancia) * velocidadBala,
        dy: (dy / distancia) * velocidadBala,
        tamaño: 5
    });
}

// -------------------------
// CREAR ENEMIGO
// -------------------------

function crearEnemigo() {

    let lado = Math.floor(Math.random() * 4);

    let x;
    let y;

    if (lado === 0) {
        x = 0;
        y = Math.random() * canvas.height;
    }

    if (lado === 1) {
        x = canvas.width;
        y = Math.random() * canvas.height;
    }

    if (lado === 2) {
        x = Math.random() * canvas.width;
        y = 0;
    }

    if (lado === 3) {
        x = Math.random() * canvas.width;
        y = canvas.height;
    }

    enemigos.push({
        x: x,
        y: y,
        tamaño: 20,
        velocidad: 1.5
    });
}

// -------------------------
// ACTUALIZAR BALAS
// -------------------------

function actualizarBalas() {

    for (let i = balas.length - 1; i >= 0; i--) {

        balas[i].x += balas[i].dx;
        balas[i].y += balas[i].dy;

        if (
            balas[i].x < 0 ||
            balas[i].x > canvas.width ||
            balas[i].y < 0 ||
            balas[i].y > canvas.height
        ) {
            balas.splice(i, 1);
        }
    }
}

// -------------------------
// ACTUALIZAR ENEMIGOS
// -------------------------

function actualizarEnemigos() {

    for (let i = enemigos.length - 1; i >= 0; i--) {

        let enemigo = enemigos[i];

        let dx = jugador.x - enemigo.x;
        let dy = jugador.y - enemigo.y;

        let distancia = Math.sqrt(dx * dx + dy * dy);

        enemigo.x += (dx / distancia) * enemigo.velocidad;
        enemigo.y += (dy / distancia) * enemigo.velocidad;

        // Si toca al jugador

        if (distancia < jugador.tamaño + enemigo.tamaño) {

            jugador.vida -= 1;

            document.getElementById("vida").textContent =
                jugador.vida;

            if (jugador.vida <= 0) {
                terminarJuego();
            }
        }
    }
}

// -------------------------
// COLISIONES
// -------------------------

function detectarColisiones() {

    for (let i = balas.length - 1; i >= 0; i--) {

        for (let j = enemigos.length - 1; j >= 0; j--) {

            let dx = balas[i].x - enemigos[j].x;
            let dy = balas[i].y - enemigos[j].y;

            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < balas[i].tamaño + enemigos[j].tamaño) {

                balas.splice(i, 1);
                enemigos.splice(j, 1);

                puntos += 10;

                document.getElementById("puntos").textContent =
                    puntos;

                break;
            }
        }
    }
}

// -------------------------
// DIBUJAR
// -------------------------

function dibujar() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo

    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Jugador

    ctx.fillStyle = "#3498db";

    ctx.beginPath();
    ctx.arc(
        jugador.x,
        jugador.y,
        jugador.tamaño,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Dirección del arma

    let dx = mouse.x - jugador.x;
    let dy = mouse.y - jugador.y;

    let distancia = Math.sqrt(dx * dx + dy * dy);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;

    ctx.beginPath();

    ctx.moveTo(jugador.x, jugador.y);

    ctx.lineTo(
        jugador.x + (dx / distancia) * 40,
        jugador.y + (dy / distancia) * 40
    );

    ctx.stroke();

    // Balas

    ctx.fillStyle = "yellow";

    balas.forEach((bala) => {

        ctx.beginPath();

        ctx.arc(
            bala.x,
            bala.y,
            bala.tamaño,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });

    // Enemigos

    ctx.fillStyle = "#e74c3c";

    enemigos.forEach((enemigo) => {

        ctx.beginPath();

        ctx.arc(
            enemigo.x,
            enemigo.y,
            enemigo.tamaño,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

// -------------------------
// JUEGO
// -------------------------

function juego() {

    if (!jugando) return;

    moverJugador();

    actualizarBalas();

    actualizarEnemigos();

    detectarColisiones();

    dibujar();

    requestAnimationFrame(juego);
}

// -------------------------
// GAME OVER
// -------------------------

function terminarJuego() {

    jugando = false;

    document.getElementById("gameOver").style.display = "flex";

    document.getElementById("puntuacionFinal").textContent =
        puntos;
}

// Crear enemigos automáticamente

setInterval(() => {

    if (jugando) {
        crearEnemigo();
    }

}, 1200);

// Ajustar pantalla

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});
