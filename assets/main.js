const canvas = document.querySelector(".o-canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;


// Util functions
function distance(x1, y1, x2, y2){
    return Math.floor(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
}

function lerp(v0, v1, t) {
    return v0 + t * (v1 - v0);
}

function getRandomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const gameTime = {
    deltaTime: 0,
    time: 0
}

const keys = {}

const State = {game: 1, menu: 2}

// Borrowing function
let drawFunction = function() {
    let x = gameController.startPoint + this.x * gameController.unit;
    let y = this.y * gameController.unit;
    let width = this.width * gameController.unit;
    let height = this.height * gameController.unit;
    c.drawImage(this.img, x, y, width, height);
};

// Objects
function GameController() {
    this.state = State.menu;
    this.interface = document.querySelector(".o-interface");
    this.unit = ((innerWidth / 1600)*900 <= innerHeight) ? (innerWidth / 1600) : (innerHeight / 900); // get game unit
    this.startPoint = (innerWidth - this.unit * 1600) / 2; // origin of the coordinate system 
    this.startButton = document.getElementById("start-button");

    this.startGame = function () {
        this.interface.classList.add("hide");
        this.state = State.game;
    }

    this.startMenu = function () {
        this.interface.classList.remove("hide");
        this.state = State.menu;
    }
}

function Player(x, y, img) {
    this.width = 120;// unit
    this.height = 80;// unit
    this.x = x-this.width/2;
    this.y = y-this.height-10;
    this.dx = 0;
    this.dxLimit = 20;
    this.img = new Image(); this.img.src = img;
    this.inertness = false;
    this.inertnessTimer = 0;

    this.update = function () {
        if(!this.inertness) {
            if(keys[65] || keys[37]){
                this.dx = lerp(this.dx, -this.dxLimit, 0.6);
            } else if(keys[68] || keys[39]) {
                this.dx = lerp(this.dx, this.dxLimit, 0.6);
            } else {
                this.dx = lerp(this.dx, 0, 0.07);
            }
        } else if(this.inertnessTimer < 500) {
            this.inertnessTimer += gameTime.deltaTime;
            this.dx = lerp(this.dx, 0, 0.07);
        } else {
            this.inertness = false;
            this.inertnessTimer = 0;
        }
        

        if(this.x < 0){
            this.dx = 2 * Math.abs(this.dx); 
            this.inertness = true;
        } else if (this.x + this.width> 1600) {
            this.dx = -2 * Math.abs(this.dx);
            this.inertness = true;
        }

        this.x += this.dx;
        this.draw();
    };

    this.draw = drawFunction;
    
}

function Star(x, y, radius, isStatic) {
    // Position and movment
    this.x = x;
    this.y = y;
    this.radius = radius;
    // Look 
    this.fillColor = "#ffffff";
    this.strokeColor = "#777777";
    this.isStatic = isStatic; // !!!!
    // Opacity
    this.minOpacity = (Math.random() / 5) + 0.1;
    this.maxOpacity = (Math.random() / 10) + 0.8;
    this.currentOpacity = this.minOpacity;

    this.update = function(){
        // calc opacity
        if (distance(this.x, this.y, mouse.x, mouse.y) <= 120 && this.currentOpacity < this.maxOpacity){
            this.currentOpacity += 0.02;
        } else if (this.currentOpacity > this.minOpacity) {
            this.currentOpacity -= 0.02;
        }
        this.draw();
    };

    this.draw = function() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.save();
        c.globalAlpha = this.currentOpacity;
        c.fillStyle = this.fillColor;
        c.fill();
        c.strokeStyle = this.strokeColor;
        c.stroke();
        c.restore();
    };  

}

function Background() {
    this.numberOfStars = Math.ceil(innerWidth * innerHeight / 4000);
    this.arrayOfStars = [];

    this.generate = function () {
        this.arrayOfStars = [];
        for(let i=0; i<this.numberOfStars; i++){
            let x = getRandomInt(0, innerWidth);
            let y = getRandomInt(0, innerHeight);
            let radius = getRandomInt(1, 3);
            let noCollision = true; // flag
            for(let j=0; j<i; j++){
                //detect collision
                if(distance(x, y, this.arrayOfStars[j].x, this.arrayOfStars[j].y) < radius + this.arrayOfStars[j].radius){ 
                    noCollision = false;
                }
            }
            if(noCollision){
                this.arrayOfStars.push(new Star(x, y, radius, true));
            } else {
                // re random
                i--;
                continue;
            }
        }
    }

    this.draw = function () {
        for(let i=0; i<this.numberOfStars; i++){
            this.arrayOfStars[i].update();
        }
    }
}

// Implementation
const background = new Background();
const gameController = new GameController();
const player = new Player(800,900,"./assets/img/playerShip.png");
function init() {
    background.generate();
}

// Event Listeners
addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

gameController.startButton.addEventListener("click", function() {
    gameController.startGame();
});
// Update key object
window.onkeyup = function(e) { keys[e.keyCode] = false; };
window.onkeydown = function(e) { keys[e.keyCode] = true; };

// Animation Loop
function animate(time) {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);

    //calc Time
    gameTime.deltaTime = time - gameTime.time;
    gameTime.time = time;

    background.draw();
    //c.fillRect(gameController.startPoint, 0, gameController.unit * 1600, gameController.unit * 900);
    if(gameController.state === State.game){
        player.update();
    }
    
}

init();
animate();