let dev = false;

const canvas = document.querySelector(".o-canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// enumerators
const State = {game: 1, menu: 2}
const MeteorType = {brown: 0, grey: 1, brownSmall: 2, graySmall: 3}
const EnemyType = {simple: 0, fast: 1, tank: 2, simpleUpgraded: 3, fastUpgraded: 4, simpleDouble: 5, ufo: 6}
const ShotType = {player0: 0, enemy1: 1, enemy2: 2, enemy3: 3}

// velocity functions
let calcVelocityX1 = function(timer) {
    timer /= 2000;
    return 6.1*Math.sin(timer);
}

let calcVelocityY1 = function(timer) {
    timer /= 2000;
    timer += Math.PI/2;
    return (Math.sin(timer) * Math.sin(timer))/2;
}

let calcVelocityX2 = function(timer) {
    timer /= 1000;
    return 12.2*Math.sin(timer);
}

let calcVelocityY2 = function(timer) {
    timer /= 1000;
    timer += Math.PI/2;
    return Math.sin(timer) * Math.sin(timer);
}

let calcVelocityX3 = function(timer) {
    timer /= 2000;
    timer += Math.PI/4;
    let tmp = Math.floor(timer / (Math.PI * 9));
    let sign = (tmp % 2 == 0 ? 1 : -1);
    return sign * Math.sin(timer) * Math.sin(timer);
}

let calcVelocityY3 = function(timer) {
    timer /= 2000;
    return 2 * Math.sin(timer);
}
// shots functions
let shot1 = function(){
    if(this.shotCooldownTimer === 0){
        if(Math.abs(this.x - player.x) < 40) {
            if(Math.random() < this.probability){
                enemyController.addEnemyShot(this.x, this.y + this.height/4, this.shotSpeed, this.dmg, this.shotType);
            }
            this.shotCooldownTimer = 1;
        }
    } else {
        if(this.shotCooldownTimer > this.shotCooldown){
            this.shotCooldownTimer = 0;
        } else {
            this.shotCooldownTimer += gameTime.deltaTime;
        }
    }
}

let shot2 = function(){
    if(this.shotCooldownTimer < this.shotCooldown){
        if(Math.abs(this.x - player.x) < 40) {
            this.shotCooldownTimer += gameTime.deltaTime;
        }
    } else {
        enemyController.addEnemyShot(this.x, this.y + this.height/4, this.shotSpeed, this.dmg, this.shotType);
        this.shotCooldownTimer = 0;
    }
}

let shot3 = function(){
    if(this.shotCooldownTimer === 0){
        if(Math.abs(this.x - player.x) < 40) {
            if(Math.random() < this.probability){
                enemyController.addEnemyShot(this.x - this.width/4, this.y + this.height/4, this.shotSpeed, this.dmg, this.shotType);
                enemyController.addEnemyShot(this.x + this.width/4, this.y + this.height/4, this.shotSpeed, this.dmg, this.shotType);
            }
            this.shotCooldownTimer = 1;
        }
    } else {
        if(this.shotCooldownTimer > this.shotCooldown){
            this.shotCooldownTimer = 0;
        } else {
            this.shotCooldownTimer += gameTime.deltaTime;
        }
    }
}


// Graphics
let meteorBrownImgPath = "./assets/img/meteorBrown.png";
let meteorGrayImgPath = "./assets/img/meteorGrey.png";

const arrayOfShotsImgPath = [];
const arrayOfParticle = [];
arrayOfParticle.push(["./assets/img/laserBlueP1.png", "./assets/img/laserBlueP2.png"]);
arrayOfParticle.push(["./assets/img/laserRedP1.png", "./assets/img/laserRedP2.png"]);
arrayOfShotsImgPath.push("./assets/img/laserBlue.png");
arrayOfShotsImgPath.push("./assets/img/laserRed.png");
arrayOfShotsImgPath.push("./assets/img/laserRed2.png");
arrayOfShotsImgPath.push("./assets/img/bomb.png");

const arrayOfEnemyData = [];
// hp, dmg, speed, cooldown, prob, shottype, velX function, velY function, shot function, img path, width, height, radius;
arrayOfEnemyData.push([60, 10, 20, 300, 0.2, ShotType.enemy1, calcVelocityX1, calcVelocityY1, shot1, "./assets/img/enemy1.png", 120, 85, 40]);
arrayOfEnemyData.push([40, 10, 20, 300, 0.1, ShotType.enemy1, calcVelocityX2, calcVelocityY2, shot1, "./assets/img/enemy2.png", 100, 110, 50]);
arrayOfEnemyData.push([200, 40, 30, 1500, 1, ShotType.enemy2, calcVelocityX3, calcVelocityY3, shot2, "./assets/img/enemy3.png", 140, 140, 70]);
arrayOfEnemyData.push([120, 20, 30, 500, 0.2, ShotType.enemy2, calcVelocityX1, calcVelocityY1, shot1, "./assets/img/enemy4.png", 120, 85, 40]);
arrayOfEnemyData.push([80, 20, 30, 500, 0.1, ShotType.enemy2, calcVelocityX2, calcVelocityY2, shot1, "./assets/img/enemy5.png", 100, 110, 50]);
arrayOfEnemyData.push([80, 10, 20, 600, 0.2, ShotType.enemy1, calcVelocityX1, calcVelocityY1, shot3, "./assets/img/enemy6.png", 120, 85, 40]);
arrayOfEnemyData.push([200, 60, 3, 1000, 1, ShotType.enemy3, calcVelocityX3, calcVelocityY3, shot2, "./assets/img/enemy7.png", 140, 60, 40]);

const arrayOfMeteorData = [];
// width, height, radius, dmg, hp, img path, 
arrayOfMeteorData.push([100, 100, 45, 50, 40, "./assets/img/meteorBrown.png"]);
arrayOfMeteorData.push([100, 100, 45, 30, 80, "./assets/img/meteorGrey.png"]);
arrayOfMeteorData.push([40, 40, 20, 5, 10, "./assets/img/meteorBrownSmall.png"]);
arrayOfMeteorData.push([40, 40, 20, 10, 10, "./assets/img/meteorGreySmall.png"]);

const arrayOfWaveData = [];
// time, number (id) of enemy
arrayOfWaveData.push([0, 119000, 0, 0, 0, 0, 0, 0]);
arrayOfWaveData.push([0, 119000, 0, 1, 0, 1, 0]);
arrayOfWaveData.push([59000, 239000, 2, 0, 0, 0]);
arrayOfWaveData.push([59000, 239000, 1, 1, 1, 1, 1]);
arrayOfWaveData.push([119000, 290000, 3, 3, 3, 3, 3, 3]);
arrayOfWaveData.push([119000, 290000, 0, 5, 3, 0, 5, 3]);
arrayOfWaveData.push([119000, 290000, 2, 5, 5, 5, 5]);
arrayOfWaveData.push([119000, 290000, 4, 1, 4, 1, 3]);
arrayOfWaveData.push([119000, 290000, 0, 3, 5, 1, 4]);
arrayOfWaveData.push([239000, 400000, 6, 0, 0, 0, 0]);
arrayOfWaveData.push([239000, 400000, 2, 2, 2, 1, 1, 1]);
arrayOfWaveData.push([239000, 400000, 5, 5, 5, 5, 5, 5, 5, 5]);
arrayOfWaveData.push([239000, 400000, 5, 5, 5, 5, 4, 5, 5]);
arrayOfWaveData.push([239000, 400000, 5, 6, 5]);
arrayOfWaveData.push([290000, -1, 6, 5, 6, 5, 6]);
arrayOfWaveData.push([290000, -1, 6, 4, 6, 4, 6]);
arrayOfWaveData.push([290000, -1, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
arrayOfWaveData.push([290000, -1, 5, 5, 4, 5, 4, 5, 5, 5, 4, 5, 5]);
arrayOfWaveData.push([290000, -1, 6, 6, 6]);
arrayOfWaveData.push([290000, -1, 2, 6, 2]);
arrayOfWaveData.push([400000, -1, 1, 6, 1, 6, 1, 6, 1, 6, 1]);
arrayOfWaveData.push([400000, -1, 5, 6, 5, 2, 5, 5, 5, 5, 5, 4, 4, 4,]);

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

// Borrowing functions
let drawFunction = function(opacity, angle) {
    c.save();
    let x = gameController.startPoint + this.x * gameController.unit;
    let y = this.y * gameController.unit;
    let width = this.width * gameController.unit;
    let height = this.height * gameController.unit;
    c.translate(x,y);
    if(typeof(opacity) !== "undefined") {
        c.globalAlpha = opacity;
    }
    if(typeof(angle) !== "undefined") {
        c.rotate(angle*Math.PI/180);
    }
    c.drawImage(this.img, -(1/2)*width, -(1/2)*height, width, height);
    if(dev){
        // draw hitbox
        c.beginPath();
        c.arc(0, 0, this.radius * gameController.unit, 0, 2 * Math.PI);
        c.strokeStyle = "#ffffff";
        c.stroke();
    }
    c.restore();
};

// Objects
function GameController() {
    this.state = State.menu;
    this.unit = ((innerWidth / 1600)*900 <= innerHeight) ? (innerWidth / 1600) : (innerHeight / 900); // calc game unit
    this.startPoint = (innerWidth - this.unit * 1600) / 2; // origin of the coordinate system 
    // html elements
    this.endBoard = document.getElementById("end-game");
    this.reloadButton = document.getElementById("reload");
    this.interface = document.getElementById("menu");
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

    this.loseGame = function () {
        this.endBoard.classList.remove("hide");
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
    this.x = x;
    this.y = y - this.height/2 - 10;
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
                this.dx = lerp(this.dx, 0, 0.15);
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
                enemyController.addPlayerShot(this.x, this.y - this.height/4, -20, 20, ShotType.player0);
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
        if(!dev){
            // update hp and hpBar
            if(!this.damageEffect){
                this.hp -= dmg;
                
            } else {
                this.hp -= Math.floor(dmg/2);
            }
            this.hp = Math.max(0, this.hp);
            //console.log(this.hp, dmg);
            gameController.updateHpBar(this.hp);

            if(this.hp === 0){
                gameController.loseGame();
            }
        }
        // start damage effect
        this.damageEffect = true;
    }

    this.draw = drawFunction;
}

function EnemyController() {
    const arrayOfMeteors = [];
    const arrayOfEnemies = [];
    const arrayOfPlayerShots = [];
    const arrayOfEnemiesShots = [];
    const arrayOfParticle = [];
    this.waveTimer = -1;
    this.enemySpawnTimer = -1;
    this.currentWave = 0;

    this.update = function() {
        // wave start/end
        if(this.waveTimer < 0){
            this.waveStart();
            this.waveTimer = 30000;
        } else {
            this.waveTimer -= gameTime.deltaTime;
        }
        // spawn enemy
        if(this.enemySpawnTimer < 0){
            if(this.currentWave.length > 0){
                this.spawnEnemy(this.currentWave[0]);
                this.currentWave.shift();
            }
            this.enemySpawnTimer = 1000;
        } else {
            this.enemySpawnTimer -= gameTime.deltaTime;
        }

        // meteors
        for(let i=0;i<arrayOfMeteors.length;i++){
            arrayOfMeteors[i].update(); 
            // break when hp is lower then 0
            if( arrayOfMeteors[i].hp < 0){
                if(arrayOfMeteors[i].type < 2){
                    let dx = arrayOfMeteors[i].dx;
                    let dy = arrayOfMeteors[i].dy;
                    let x = arrayOfMeteors[i].x;
                    let y = arrayOfMeteors[i].y;
                    let type = arrayOfMeteors[i].type + 2;
                    let newMeteors = getRandomInt(0,2);
                    for(let j=0; j<newMeteors; j++){
                        this.spawnMiniMeteor(x + Math.random()*10 - 5, y + Math.random()*10 - 5, -1, -1, type);
                    }
                    this.spawnMiniMeteor(x, y, dx, dy, type);
                }   
                arrayOfMeteors.splice(i, 1);
                continue;
            }
            // delete when meteor get out of screen
            if( (arrayOfMeteors[i].y - arrayOfMeteors[i].width) * gameController.unit > innerHeight){
                if(!arrayOfMeteors[i].hitPlayer){
                    gameController.addScore(1);
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
        for(let i=0;i<arrayOfEnemiesShots.length;i++){
            arrayOfEnemiesShots[i].update();
            // delete when shot get out of screen
            if(arrayOfEnemiesShots[i].y * gameController.unit > innerHeight + 10){
                arrayOfEnemiesShots.splice(i, 1);
            }
        }

        // particle
        for(let i=0;i<arrayOfParticle.length;i++){
            arrayOfParticle[i].update();
            // delete when shot get out of screen
            if(arrayOfParticle[i].counter === 2){
                arrayOfParticle.splice(i, 1);
            }
        }
    }

    this.collision = function() {
        // meteors and player
        for(let i=0;i<arrayOfMeteors.length;i++){
            let distancePlayerMeteor = distance(player.x, player.y, arrayOfMeteors[i].x, arrayOfMeteors[i].y);
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
            let distancePlayerEnemy = distance(player.x, player.y, arrayOfEnemies[i].x, arrayOfEnemies[i].y);
            if( distancePlayerEnemy < player.radius + arrayOfEnemies[i].radius){
                player.getDamage(100);
                arrayOfEnemies[i].getDamage(arrayOfEnemies[i].hp);
                // end game !!!
            }
        }
        // shots and enemies
        for(let i=0;i<arrayOfEnemies.length;i++){
            for(let j=0;j<arrayOfPlayerShots.length;j++){
                let distanceShotEnemy = distance(arrayOfPlayerShots[j].x+arrayOfPlayerShots[j].width/2, arrayOfPlayerShots[j].y, arrayOfEnemies[i].x, arrayOfEnemies[i].y);
                if(distanceShotEnemy < arrayOfEnemies[i].radius){
                    this.addParticle(arrayOfPlayerShots[j].x+arrayOfPlayerShots[j].width/2, arrayOfPlayerShots[j].y, 0);
                    arrayOfEnemies[i].getDamage(arrayOfPlayerShots[j].dmg);
                    arrayOfPlayerShots.splice(j, 1);
                }
            }
        }
        // shots and player
        for(let i=0;i<arrayOfEnemiesShots.length;i++){
            let distanceShotEnemy = distance(arrayOfEnemiesShots[i].x+arrayOfEnemiesShots[i].width/2, arrayOfEnemiesShots[i].y + arrayOfEnemiesShots[i].height, player.x, player.y);
            if(distanceShotEnemy < player.radius){
                
                this.addParticle(arrayOfEnemiesShots[i].x+arrayOfEnemiesShots[i].width/2, arrayOfEnemiesShots[i].y + arrayOfEnemiesShots[i].height, 1);
                player.getDamage(arrayOfEnemiesShots[i].dmg);
                arrayOfEnemiesShots.splice(i, 1);
            }
        }
        // shots and meteors
        for(let i=0;i<arrayOfMeteors.length;i++){
            for(let j=0;j<arrayOfPlayerShots.length;j++){
                let distanceShotEnemy = distance(arrayOfPlayerShots[j].x+arrayOfPlayerShots[j].width/2, arrayOfPlayerShots[j].y, arrayOfMeteors[i].x, arrayOfMeteors[i].y);
                if(distanceShotEnemy < arrayOfMeteors[i].radius){
                    this.addParticle(arrayOfPlayerShots[j].x+arrayOfPlayerShots[j].width/2, arrayOfPlayerShots[j].y, 0);
                    arrayOfMeteors[i].getDamage(arrayOfPlayerShots[j].dmg);
                    arrayOfPlayerShots.splice(j, 1);
                }
            }
        }
    }

    this.waveStart = function() {
        let randomWave;
        do {
            randomWave = getRandomInt(0, arrayOfWaveData.length-1);
            //console.log(arrayOfWaveData[randomWave][0], gameTime.time)
        } while(arrayOfWaveData[randomWave][0] > gameTime.time && (arrayOfWaveData[randomWave][1] < gameTime.time || arrayOfWaveData[randomWave][1] !== -1));
        //console.log(randomWave);
        this.currentWave = arrayOfWaveData[randomWave].slice();
        this.currentWave.shift();
        this.currentWave.shift();
    }

    // dev

    this.spawnRandomMeteor = function() {
        let x, dx;
        if(getRandomBool()){
            x = 50;
            dx =  Math.random()*1.5;
        } else {
            x = 1550;
            dx = -Math.random()*1.5;
        }
        let y = -50;
        let dy = Math.ceil(Math.random()*2) + 1;
        let step = getRandomInt(1,3);
        let type = getRandomInt(0,1);
        
        arrayOfMeteors.push(new Meteor(x, y, dx, dy, step, type));
    }

    this.spawnMiniMeteor = function(x, y, dx, dy, type) {
        if(dx === -1 && dy === -1){
            dx = Math.random()*3 - 1.5;
            dy = Math.ceil(Math.random()*2) + 1;
        }
        let step = getRandomInt(2,4);
        
        arrayOfMeteors.push(new Meteor(x, y, dx, dy, step, type));
    }

    this.spawnEnemy = function(enemyType) {
        arrayOfEnemies.push(new Enemy(15,-220,enemyType));
    }

    this.addPlayerShot = function(x, y, dy, dmg, type) {
        arrayOfPlayerShots.push(new Shot(x, y, dy, dmg, type));
    }

    this.addEnemyShot = function(x, y, dy, dmg, type) {
        arrayOfEnemiesShots.push(new Shot(x, y, dy, dmg, type));
    }

    this.addParticle = function(x, y, type) {
        arrayOfParticle.push(new Particle(x, y, type));
    }
}

function Enemy(x, y, type) {
    // position and movment
    this.width = arrayOfEnemyData[type][10];
    this.height = arrayOfEnemyData[type][11];
    this.radius = arrayOfEnemyData[type][12];
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.timer = 0;
    // game mechanic
    this.img = new Image();
    this.img.src = arrayOfEnemyData[type][9];
    this.hp = arrayOfEnemyData[type][0];
    this.damageEffect = false;
    this.damageEffectTimer = 0;
    this.isDead - false;
    this.isDeadTimer = 500;
    // shot
    this.shotCooldown = arrayOfEnemyData[type][3];
    this.shotCooldownTimer = 0;
    this.shotType = arrayOfEnemyData[type][5];
    this.dmg = arrayOfEnemyData[type][1];
    this.shotSpeed = arrayOfEnemyData[type][2]

    this.calcDx = arrayOfEnemyData[type][6];
    this.calcDy = arrayOfEnemyData[type][7];
    this.probability = arrayOfEnemyData[type][4];

    this.shot = arrayOfEnemyData[type][8];

    this.update = function () {
        let opacity = 1;
        if(!this.isDead){
            this.timer += gameTime.deltaTime;
            this.dx = this.calcDx(this.timer);
            this.dy = this.calcDy(this.timer);
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

            if(this.y > 0){
                this.shot();
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
    this.width = arrayOfMeteorData[type][0];
    this.height = arrayOfMeteorData[type][1];
    this.radius = arrayOfMeteorData[type][2];
    this.x = x - this.width/2;
    this.y = y - this.height/2;
    this.dx = dx;
    this.dy = dy;
    this.rotationAngle = 0;
    this.rotationStep = step;
    // game mechanic
    this.type = type;
    this.hp = arrayOfMeteorData[type][4]
    this.dmg = arrayOfMeteorData[type][3];
    this.img = new Image(); this.img.src = arrayOfMeteorData[type][5];
    this.hitPlayer = false;
    
    this.update = function() {
        
        this.x += this.dx;
        this.y += this.dy;
        this.rotationAngle += step;
        this.rotationAngle %= 360;
        this.draw(1, this.rotationAngle);
    }

    this.draw = drawFunction;

    this.getDamage = function (dmg) {
        this.hp -= dmg;
    }
}

function Particle(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.type = type;
    this.counter = 0;
    this.img = new Image();
    this.img.src = arrayOfParticle[type][0];

    this.update = function() {
        let opacity = this.counter < 2 ? 1 : 0.5;
        if(this.counter === 1){
            this.img.src = arrayOfParticle[type][1];
        }
        this.counter++;
        this.draw(opacity);
    }

    this.draw = drawFunction;
}

function Shot(x, y, dy, dmg, type) {
    // Position and movment
    this.width = 10;
    this.height = 30;
    this.x = x;
    this.y = y;
    this.dy = dy;
    //
    this.type = type;
    this.img = new Image(); this.img.src = arrayOfShotsImgPath[type];
    this.dmg = dmg;
    //console.log(this.type, this.img);
    this.update = function () {
        this.y += this.dy;
        this.draw();
    }

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

gameController.reloadButton.addEventListener("click", function() {
    location.reload();
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