const canvas = document.querySelector('.o-canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

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