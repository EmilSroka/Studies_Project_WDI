let dev = false;

const canvas = document.querySelector(".o-canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// Graphics
let meteorBrownImgPath = "./assets/img/meteorBrown.png";
let meteorGrayImgPath = "./assets/img/meteorGrey.png";
const arrayOfEnemyImgPath = [];
const arrayOfShotsImgPath = [];
const arrayOfEnemyHP = [];
arrayOfEnemyImgPath.push("./assets/img/enemy1.png");
arrayOfShotsImgPath.push("./assets/img/laserBlue.png");
arrayOfEnemyHP.push(60);

// 
/* 
let calcVelocityX1 = function(timer) {
    timer /= 2000;
    return 12.2*Math.sin(timer);
}

let calcVelocityY1 = function(timer) {
    timer /= 2000;
    timer += Math.PI/2;
    return Math.sin(timer) * Math.sin(timer);
}
*/

let calcVelocityX1 = function(timer) {
    timer /= 2000;
    return 6.1*Math.sin(timer);
}

let calcVelocityY1 = function(timer) {
    timer /= 2000;
    timer += Math.PI/2;
    return (Math.sin(timer) * Math.sin(timer))/2;
}

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

function getRandomBool() {
    return (Math.random() > 0.5) ? true : false;
}

function calcOpacity(timer) {
    opacity = (1/100000)*timer*(timer - 500) + 1; // Quadratic function, value from 1 to ~0.4
    return Math.min(1, opacity); // prevent opacity greater than 1 
}

const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const gameTime = {
    lastTime: 0,
    deltaTime: 0,
    time: 0
}

const keys = {}

// enumerators
const State = {game: 1, menu: 2}
const MeteorType = {brown: 1, grey: 2}
const EnemyType = {simple: 0}
const ShotType = {player0: 0}

// Borrowing functions
let drawFunction = function(opacity) {
    c.save();
    if(typeof(opacity) !== "undefined") {
        c.globalAlpha = opacity;
    }
    let x = gameController.startPoint + this.x * gameController.unit;
    let y = this.y * gameController.unit;
    let width = this.width * gameController.unit;
    let height = this.height * gameController.unit;
    c.drawImage(this.img, x, y, width, height);
    c.restore();
    if(dev){
        c.beginPath();
        c.arc(x + width/2, y + height/2, this.radius * gameController.unit, 0, 2 * Math.PI);
        c.strokeStyle = "#ffffff";
        c.stroke();
    }
};

// Objects
function GameController() {
    this.state = State.menu;
    this.unit = ((innerWidth / 1600)*900 <= innerHeight) ? (innerWidth / 1600) : (innerHeight / 900); // calc game unit
    this.startPoint = (innerWidth - this.unit * 1600) / 2; // origin of the coordinate system 
    // html elements
    this.interface = document.querySelector(".o-interface");
    this.startButton = document.getElementById("start-button");
    this.exitButton = document.getElementById("exit-button");
    this.hpBar = document.querySelector(".c-bar");
    this.hpBarProgress = this.hpBar.querySelector("span");
    this.score = 0;
    this.scoreP = document.querySelector(".c-score");
    this.scoreTimer = 0;
    // game objects 

    this.startGame = function () {
        this.interface.classList.add("hide");
        this.hpBar.classList.remove("hide");
        this.scoreP.classList.remove("hide");
        this.state = State.game;
        //gameTime = 0;
    }

    this.endGame = function () {
        let result = confirm("Przeglądarka może blokować możliwość zamknięcia strony przez skrypt. Czy chcesz spróbować zamknąć kartę ?"); 
        if (result) {
            window.close();
        }
    }

    this.startMenu = function () {
        this.interface.classList.remove("hide");
        this.hpBar.classList.add("hide");
        this.scoreP.classList.add("hide");
        this.state = State.menu;
    }

    this.update = function () {
        this.scoreTimer += gameTime.deltaTime;
        if(this.scoreTimer > 1000) {
            this.score += 1;
            this.scoreTimer = 0;
            this.updateScoreP(this.score);
        }
    }

    this.updateHpBar = function (hp) {
        // change hp bar style
        if(hp < 10){
            this.hpBar.classList.add("c-bar--danger");
            this.hpBar.classList.remove("c-bar--warning");
        } else if(hp < 30) {
            this.hpBar.classList.add("c-bar--warning");
            this.hpBar.classList.remove("c-bar--danger");
        } else {
            this.hpBar.classList.remove("c-bar--warning");
            this.hpBar.classList.remove("c-bar--danger");
        }
        this.hpBarProgress.style.width=hp+"%";
    }

    this.updateScoreP = function (score) {
        this.scoreP.innerText = "Wynik: " + score;
    }

    this.addScore = function (score) {
        this.score += score;
        this.updateScoreP(this.score);
    }
}

function Player(x, y, img) {
    // movement and position (game unit)
    this.width = 120;
    this.height = 80;
    this.radius = 40;
    this.x = x-this.width/2;
    this.y = y-this.height-10;
    this.dx = 0;
    this.dxLimit = 20;
    this.inertness = false;
    this.inertnessTimer = 0;
    // game mechanic
    this.hp = 100;
    this.damageEffect = false;
    this.damageEffectTimer = 0;
    this.img = new Image(); this.img.src = img;
    // shot
    this.shotCooldown = 300;
    this.shotCooldownTimer = 0;
    

    this.update = function () {
        // calc velocity
        if(!this.inertness) {
            if(keys[65] || keys[37]){
                this.dx = lerp(this.dx, -this.dxLimit, 0.6);
            } else if(keys[68] || keys[39]) {
                this.dx = lerp(this.dx, this.dxLimit, 0.6);
            } else {
                this.dx = lerp(this.dx, 0, 0.07);
            }
        } else if(this.inertnessTimer < 300) {
            this.inertnessTimer += gameTime.deltaTime;
            this.dx = lerp(this.dx, 0, 0.07);
        } else {
            this.inertness = false;
            this.inertnessTimer = 0;
        }
        // player get inertness when hit map border
        if(this.x < 0){
            this.dx = 2 * Math.abs(this.dx); 
            this.inertness = true;
        } else if (this.x + this.width> 1600) {
            this.dx = -2 * Math.abs(this.dx);
            this.inertness = true;
        }
        // shot (with cooldown)
        if(this.shotCooldownTimer === 0){
            if(keys[32] || keys[38] || keys[87]) {
                enemyController.addShot(this.x + this.width/2, this.y, -20, 20, ShotType.player0);
                this.shotCooldownTimer = 1;
            }
        } else {
            if(this.shotCooldownTimer > this.shotCooldown){
                this.shotCooldownTimer = 0;
            } else {
                this.shotCooldownTimer += gameTime.deltaTime;
            }
        }
        
        // !!!
        let opacity = 1;
        if(this.damageEffect){
            if(this.damageEffectTimer < 500){
                this.damageEffectTimer += gameTime.deltaTime;
                opacity = calcOpacity(this.damageEffectTimer);
            } else {
                this.damageEffect = false;
                this.damageEffectTimer = 0;
            }
        }

        // move and draw
        this.x += this.dx;
        this.draw(opacity);
    };

    this.getDamage = function (dmg) {
        // update hp and hpBar
        this.hp -= dmg;
        this.hp = Math.max(0, this.hp);
        gameController.updateHpBar(this.hp);
        // start damage effect
        this.damageEffect = true;
    }

    this.draw = drawFunction;
}

function EnemyController() {
    const arrayOfMeteors = [];
    const arrayOfEnemies = [];
    const arrayOfPlayerShots = [];

    this.update = function() {
        // meteors
        for(let i=0;i<arrayOfMeteors.length;i++){
            arrayOfMeteors[i].update(); 
            // delete when meteor get out of screen
            if( (arrayOfMeteors[i].y - arrayOfMeteors[i].width) * gameController.unit > innerHeight){
                if(!arrayOfMeteors[i].hitPlayer){
                    gameController.addScore(5);
                }
                arrayOfMeteors.splice(i, 1);
            }
        }
        // spawn new metheors 
        if(Math.random() < 0.001){
            this.spawnRandomMeteor();
        }

        // enemies
        for(let i=0;i<arrayOfEnemies.length;i++){
            arrayOfEnemies[i].update();
            // delet when enemies die
            if(arrayOfEnemies[i].isDeadTimer < 0){
                arrayOfEnemies.splice(i, 1);
                gameController.addScore(10);
            }
        }

        // shots
        for(let i=0;i<arrayOfPlayerShots.length;i++){
            arrayOfPlayerShots[i].update();
            // delete when shot get out of screen
            if( (arrayOfPlayerShots[i].y + arrayOfPlayerShots[i].height) * gameController.unit < -10){
                arrayOfPlayerShots.splice(i, 1);
            }
        }
    }

    this.collision = function() {
        // meteors and player
        for(let i=0;i<arrayOfMeteors.length;i++){
            let distancePlayerMeteor = distance(player.x + player.width/2, player.y + player.height/2, arrayOfMeteors[i].x, arrayOfMeteors[i].y);
            if( distancePlayerMeteor < player.radius + arrayOfMeteors[i].radius){
                if(!arrayOfMeteors[i].hitPlayer){
                    player.getDamage(arrayOfMeteors[i].dmg);
                    arrayOfMeteors[i].hitPlayer = true;
                    //console.log(player.x, player.y, player.x + player.width/2, player.y + player.height/2);
                    //console.log(arrayOfMeteors[i].x, arrayOfMeteors[i].y, arrayOfMeteors[i].x + arrayOfMeteors[i].width/2, arrayOfMeteors[i].y + arrayOfMeteors[i].height/2);
                }
            }
        }
        // enemies and player
        for(let i=0;i<arrayOfEnemies.length;i++){
            let distancePlayerEnemy = distance(player.x + player.width/2, player.y + player.height/2, arrayOfEnemies[i].x + arrayOfEnemies[i].width/2, arrayOfEnemies[i].y + arrayOfEnemies[i].height/2);
            if( distancePlayerEnemy < player.radius + arrayOfEnemies[i].radius){
                player.getDamage(100);
                arrayOfEnemies[i].getDamage(arrayOfEnemies[i].hp);
                // end game !!!
            }
        }
        // shots and enemies
        for(let i=0;i<arrayOfEnemies.length;i++){
            for(let j=0;j<arrayOfPlayerShots.length;j++){
                let distanceShotEnemy = distance(arrayOfPlayerShots[j].x+arrayOfPlayerShots[j].width/2, arrayOfPlayerShots[j].y, arrayOfEnemies[i].x + arrayOfEnemies[i].width/2, arrayOfEnemies[i].y + arrayOfEnemies[i].height/2);
                if(distanceShotEnemy < arrayOfEnemies[i].radius){
                    arrayOfEnemies[i].getDamage(arrayOfPlayerShots[j].dmg);
                    arrayOfPlayerShots.splice(j, 1);
                }
            }
        }
    }

    // dev

    this.spawnRandomMeteor = function() {
        let x, dx;
        let y = -50;
        let dy = getRandomBool() ? 1 : 2;
        let step = getRandomInt(1,3);
        let type = (gameTime.time > 300000 ? MeteorType.grey : MeteorType.brown);
        if(getRandomBool()){
            x = 50;
            dx = getRandomBool() ? 1 : 0.5;
        } else {
            x = 1550;
            dx = getRandomBool() ? -1 : -0.5;
        }
        arrayOfMeteors.push(new Meteor(x, y, dx, dy, step, type));
    }

    this.spawnEnemy = function(enemyType) {
        arrayOfEnemies.push(new Enemy(15,-100,enemyType));
    }

    this.addShot = function(x, y, dy, dmg, type) {
        arrayOfPlayerShots.push(new Shot(x, y, dy, dmg, type));
    }
}

function Enemy(x, y, type) {
    // position and movment
    this.width = 120;
    this.height = 85;
    this.radius = 40;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.timer = 0;
    // game mechanic
    this.img = new Image();
    this.img.src = arrayOfEnemyImgPath[type];
    this.hp = arrayOfEnemyHP[type];
    this.damageEffect = false;
    this.damageEffectTimer = 0;
    this.isDead - false;
    this.isDeadTimer = 500;

    this.update = function () {
        let opacity = 1;
        if(!this.isDead){
            this.timer += gameTime.deltaTime;
            this.dx = calcVelocityX1(this.timer);
            this.dy = calcVelocityY1(this.timer);
            this.x += this.dx;
            this.y += this.dy;

            if(this.damageEffect){
                if(this.damageEffectTimer < 500){
                    this.damageEffectTimer += gameTime.deltaTime;
                    opacity = calcOpacity(this.damageEffectTimer);
                } else {
                    this.damageEffect = false;
                    this.damageEffectTimer = 0;
                }
            }
        } else {
            this.isDeadTimer -= gameTime.deltaTime;
            opacity = Math.max(this.isDeadTimer/500, 0);
        } 
        

        this.draw(opacity);
    }

    this.getDamage = function(dmg) {
        this.hp -= dmg;
        if(this.hp > 0){
            this.damageEffect = true;
        } else {
            this.isDead = true;
        }
    }

    this.draw = drawFunction;
}

function Meteor(x, y, dx, dy, step, type) {
    // position and movment
    this.width = 100;
    this.height = 100;
    this.radius = 30;
    this.x = x - this.width/2;
    this.y = y - this.height/2;
    this.dx = dx;
    this.dy = dy;
    this.rotationAngle = 0;
    this.rotationStep = step;
    // game mechanic
    this.dmg = type === MeteorType.grey ? 40 : 20;
    this.img = new Image(); this.img.src = (type === MeteorType.grey ? meteorGrayImgPath : meteorBrownImgPath);
    this.hitPlayer = false;

    
    this.update = function() {
        this.x += this.dx;
        this.y += this.dy;
        this.rotationAngle += step;
        this.rotationAngle %= 360;
        
        this.draw();
    }

    this.draw = function() {
        c.save();
        let canvasX = gameController.startPoint + this.x*gameController.unit;
        let canvasY = this.y*gameController.unit;
        c.translate(canvasX,canvasY);
        c.rotate(this.rotationAngle*Math.PI/180);
        let width = this.width * gameController.unit;
        let height = this.height * gameController.unit;
        c.drawImage(this.img, -(1/2)*width, -(1/2)*height, width, height);
        c.restore();
    }
}

function Shot(x, y, dy, dmg, type) {
    // Position and movment
    this.width = 10;
    this.height = 30;
    this.x = x - this.width/2;
    this.y = y + this.height;
    this.dy = dy;
    //
    this.type = type
    this.img = new Image(); this.img.src = arrayOfShotsImgPath[type];
    this.dmg = dmg;

    this.update = function () {
        this.y += this.dy;
        this.draw();
    }

    this.draw = this.draw = drawFunction;
}

function Star(x, y, radius, isStatic) {
    // Position and movment
    this.x = x;
    this.y = y;
    this.radius = radius;
    // Look 
    this.fillColor = "#ffffff";
    this.strokeColor = "#777777";
    this.isStatic = isStatic;
    this.timer = 0;
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
        // calc move
        if(gameController.state === State.game){
            if(!this.isStatic){
                if(this.timer > 10) {
                    if(this.y > innerHeight + this.radius){
                        this.y = -5;
                    }
                    this.timer = 0;
                    this.y += 2;
                    
                } else {
                    this.timer += gameTime.deltaTime;
                }
            }
        }

        this.draw();
    };

    this.draw = function() {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
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
        // generate array of stars
        this.arrayOfStars = [];
        for(let i=0; i<this.numberOfStars; i++){
            let x = getRandomInt(0, innerWidth);
            let y = getRandomInt(0, innerHeight);
            let radius = getRandomInt(1, 3);
            // checking for collisions
            let noCollision = true;
            for(let j=0; j<i; j++){
                //detect collision
                if(distance(x, y, this.arrayOfStars[j].x, this.arrayOfStars[j].y) < radius + this.arrayOfStars[j].radius){ 
                    noCollision = false;
                }
            }
            if(noCollision){
                this.arrayOfStars.push(new Star(x, y, radius, getRandomBool()));
            } else {
                // re random
                i--;
                continue;
            }
        }
    }

    this.draw = function () {
        // draw all stars
        for(let i=0; i<this.numberOfStars; i++){
            this.arrayOfStars[i].update();
        }
    }
}

// Implementation
const background = new Background();
const gameController = new GameController();
const player = new Player(800,900,"./assets/img/playerShip.png");
const enemyController = new EnemyController();
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

gameController.exitButton.addEventListener("click", function() {
    gameController.endGame();
});
// Update key object
window.onkeyup = function(e) { keys[e.keyCode] = false; };
window.onkeydown = function(e) { keys[e.keyCode] = true; };

// Animation Loop
function animate(time) {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    background.draw();
    //c.fillRect(gameController.startPoint, 0, gameController.unit * 1600, gameController.unit * 900);
    if(gameController.state === State.game){
        // calc time 
        gameTime.deltaTime = Math.min(32 ,time - gameTime.lastTime);
        gameTime.time += gameTime.deltaTime;
        
        gameController.update();
        enemyController.update();
        player.update();

        // colisions
        enemyController.collision();
    }
    gameTime.lastTime = time;
}

init();
animate(0);