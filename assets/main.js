const canvas = document.querySelector('.o-canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// Util functions
function distance(x1, y1, x2, y2){
    return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

function lerp(v0, v1, t) {
    return v0 + t * (v1 - v0);
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

// Objects

// Implementation
function init() {

}

// Animation Loop
function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)

    c.fillText('HTML CANVAS BOILERPLATE', mouse.x, mouse.y)
}

init()
animate()