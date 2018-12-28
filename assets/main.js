let dev = false;

const canvas = document.querySelector(".o-canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// enumerators
const State = {game: 1, menu: 2}
const MeteorType = {brown: 0, grey: 1, brownSmall: 2, graySmall: 3}
const EnemyType = {simple: 0, fast: 1, tank: 2, simpleUpgraded: 3, fastUpgraded: 4, simpleDouble: 5, ufo: 6}
const ShotType = {player0: 0, enemy1: 1, enemy2: 2, enemy3: 3, player1: 4}
const PowerUpType = {hp:0, shield:1, power:2, double:3}

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
const arrayOfShotsImgPath = [];
const arrayOfParticleImgPath = [];
const arrayOfShieldImgPath = [];
const arrayOfPowerUpImgPath = [];
arrayOfParticleImgPath.push(["./assets/img/laserBlueP1.png", "./assets/img/laserBlueP2.png"]);
arrayOfParticleImgPath.push(["./assets/img/laserRedP1.png", "./assets/img/laserRedP2.png"]);
arrayOfShotsImgPath.push("./assets/img/laserBlue.png");
arrayOfShotsImgPath.push("./assets/img/laserRed.png");
arrayOfShotsImgPath.push("./assets/img/laserRed2.png");
arrayOfShotsImgPath.push("./assets/img/bomb.png");
arrayOfShotsImgPath.push("./assets/img/laserBlue2.png");
arrayOfPowerUpImgPath.push("./assets/img/puHealt.png");
arrayOfPowerUpImgPath.push("./assets/img/puShield.png");
arrayOfPowerUpImgPath.push("./assets/img/puPower.png");
arrayOfPowerUpImgPath.push("./assets/img/puDouble.png");

const arrayOfEnemyData = [];
// hp, dmg, speed, cooldown, prob, shottype, velX function, velY function, shot function, img path, width, height, radius;
arrayOfEnemyData.push([60, 10, 20, 300, 0.2, ShotType.enemy1, calcVelocityX1, calcVelocityY1, shot1, "./assets/img/enemy1.png", 120, 85, 50]);
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
    this.radius = 45;
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

    this.shotType = 0;
    this.shotSpeed = 20;
    this.shotDmg = 20;
    // shot
    this.shotCooldown = 300;
    this.shotCooldownTimer = 0;
    // powerups
    this.puDoubleShot = false;
    this.puBeterShot = false;
    this.puShield = false;
    this.shieldImg = new Image();  this.shieldImg.src = "./assets/img/shield.png";
    this.shieldOpacity = 0;

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
        if(this.x - this.width/2 < 0){
            this.dx = 2 * Math.abs(this.dx); 
            this.inertness = true;
        } else if (this.x + this.width/2> 1600) {
            this.dx = -2 * Math.abs(this.dx);
            this.inertness = true;
        }
        // shot (with cooldown)
        if(this.shotCooldownTimer === 0){
            if(keys[32] || keys[38] || keys[87]) {
                if(this.puDoubleShot){
                    enemyController.addPlayerShot(this.x - this.width/5, this.y - this.height/4, -this.shotSpeed, this.shotDmg, this.shotType);
                    enemyController.addPlayerShot(this.x + this.width/5, this.y - this.height/4, -this.shotSpeed, this.shotDmg, this.shotType);
                } else {
                    enemyController.addPlayerShot(this.x, this.y - this.height/4, -this.shotSpeed, this.shotDmg, this.shotType);
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
        //drav shield
        if(this.shieldOpacity >= 0){
            this.drawShield();
            if(!this.puShield){
                this.shieldOpacity -= gameTime.deltaTime/300;
            }
        }
    };

    this.getDamage = function (dmg) {
        if(!this.puShield){
            // update hp and hpBar
            if(!this.damageEffect){
                this.hp -= dmg;
            }
            if(dev){
                this.hp = 100;
            }
            this.hp = Math.max(0, this.hp);
            gameController.updateHpBar(this.hp);
            if(this.hp === 0){
                gameController.loseGame();
            }
            // start damage effect
            this.damageEffect = true;
            this.pUBetterShot(false);
            this.pUDoubleShot(false);
        } else {
            this.pUShield(false);
        }
    }

    this.drawShield = function() {
        c.save();
        let x = gameController.startPoint + this.x * gameController.unit;
        let y = this.y * gameController.unit;
        let width = (this.width+30) * gameController.unit;
        let height = (this.height+30) * gameController.unit;
        c.translate(x,y);
        c.globalAlpha = this.shieldOpacity;
        c.drawImage(this.shieldImg, -(1/2)*width, -(1/2)*height, width, height);
        c.restore();
    }

    this.pUDoubleShot = function (flag){
        this.puDoubleShot = flag;
    }

    this.pUBetterShot = function (flag){
        this.puBeterShot = flag;
        if(flag){
            this.shotType = 4;
            this.shotDmg = 40;
            this.shotSpeed = 25;
        } else {
            this.shotType = 0;
            this.shotDmg = 20;
            this.shotSpeed = 20;
        }
    }

    this.pUShield = function (flag){
        this.puShield = flag;
        if(flag){
            this.shieldOpacity = 1;
        } 
    }

    this.addHP = function (toAdd){
        this.hp += toAdd;
        this.hp = Math.min(100, this.hp);
        gameController.updateHpBar(this.hp);
    }

    this.draw = drawFunction;
}


function PowerUp(x, y, type) {
    this.width = 40;
    this.height = 50;
    this.radius = 20;
    this.x = x;
    this.y = y;
    this.dy = 3;
    this.img =new Image();
    this.img.src = arrayOfPowerUpImgPath[type];
    this.type = type;

    this.update = function () {
        this.y += this.dy;

        this.draw();
    }

    this.draw = drawFunction;
}

function EnemyController() {
    this.arrayOfMeteors = [];
    this.arrayOfEnemies = [];
    this.arrayOfPlayerShots = [];
    this.arrayOfEnemiesShots = [];
    this.arrayOfParticle = [];
    this.arrayOfPowerUps = [];
    this.waveTimer = -1;
    this.enemySpawnTimer = -1;
    this.currentWave = 0;

    this.update = function() {
        // wave start/end
        if(this.waveTimer < 0 || !this.arrayOfEnemies.length){
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
        for(let i=0;i<this.arrayOfMeteors.length;i++){
            this.arrayOfMeteors[i].update(); 
            // break when hp is lower then 0
            if( this.arrayOfMeteors[i].hp < 0){
                if(this.arrayOfMeteors[i].type < 2){
                    let dx = this.arrayOfMeteors[i].dx;
                    let dy = this.arrayOfMeteors[i].dy;
                    let x = this.arrayOfMeteors[i].x;
                    let y = this.arrayOfMeteors[i].y;
                    let type = this.arrayOfMeteors[i].type + 2;
                    let newMeteors = getRandomInt(0,2);
                    for(let j=0; j<newMeteors; j++){
                        this.spawnMiniMeteor(x + Math.random()*10 - 5, y + Math.random()*10 - 5, -1, -1, type);
                    }
                    this.spawnMiniMeteor(x, y, dx, dy, type);
                    this.spawnPowerUp(x, y, getRandomInt(0, 3));
                }   
                this.arrayOfMeteors.splice(i, 1);
                continue;
            }
            // delete when meteor get out of screen
            if( (this.arrayOfMeteors[i].y - this.arrayOfMeteors[i].width) * gameController.unit > innerHeight){
                if(!this.arrayOfMeteors[i].hitPlayer){
                    gameController.addScore(1);
                }
                this.arrayOfMeteors.splice(i, 1);
            }
            
        }
        // spawn new metheors 
        if(Math.random() < 0.001){
            this.spawnRandomMeteor();
        }

        // enemies
        for(let i=0;i<this.arrayOfEnemies.length;i++){
            this.arrayOfEnemies[i].update();
            // delet when enemies die
            if(this.arrayOfEnemies[i].isDeadTimer < 0){
                this.arrayOfEnemies.splice(i, 1);
                gameController.addScore(10);
            }
        }

        // power ups
        for(let i=0;i<this.arrayOfPowerUps.length;i++){
            this.arrayOfPowerUps[i].update();
        }

        // shots
        for(let i=0;i<this.arrayOfPlayerShots.length;i++){
            this.arrayOfPlayerShots[i].update();
            // delete when shot get out of screen
            if( (this.arrayOfPlayerShots[i].y + this.arrayOfPlayerShots[i].height) * gameController.unit < -10){
                this.arrayOfPlayerShots.splice(i, 1);
            }
        }
        for(let i=0;i<this.arrayOfEnemiesShots.length;i++){
            this.arrayOfEnemiesShots[i].update();
            // delete when shot get out of screen
            if(this.arrayOfEnemiesShots[i].y * gameController.unit > innerHeight + 10){
                this.arrayOfEnemiesShots.splice(i, 1);
            }
        }

        // particle
        for(let i=0;i<this.arrayOfParticle.length;i++){
            this.arrayOfParticle[i].update();
            // delete when animation end
            if(this.arrayOfParticle[i].counter === 2){
                this.arrayOfParticle.splice(i, 1);
            }
        }
    }

    this.collision = function() {
        // meteors and player
        for(let i=0;i<this.arrayOfMeteors.length;i++){
            let distanceV = distance(player.x, player.y, this.arrayOfMeteors[i].x, this.arrayOfMeteors[i].y);
            if( distanceV < player.radius + this.arrayOfMeteors[i].radius){
                if(!this.arrayOfMeteors[i].hitPlayer){
                    player.getDamage(this.arrayOfMeteors[i].dmg);
                    this.arrayOfMeteors[i].hitPlayer = true;
                }
            }
        }
        // enemies and player
        for(let i=0;i<this.arrayOfEnemies.length;i++){
            let distanceV = distance(player.x, player.y, this.arrayOfEnemies[i].x, this.arrayOfEnemies[i].y);
            if( distanceV < player.radius + this.arrayOfEnemies[i].radius){
                player.getDamage(100);
                this.arrayOfEnemies[i].getDamage(this.arrayOfEnemies[i].hp);
            }
        }
        // power ups and player
        for(let i=0;i<this.arrayOfPowerUps.length;i++){
            let distanceV = distance(this.arrayOfPowerUps[i].x, this.arrayOfPowerUps[i].y, player.x, player.y);
            if(distanceV < player.radius + this.arrayOfPowerUps[i].radius){
                switch(this.arrayOfPowerUps[i].type){
                    case PowerUpType.hp:
                        player.addHP(20);
                        break;
                    case PowerUpType.shield:
                        player.pUShield(true);
                        break;
                    case PowerUpType.power:
                        player.pUBetterShot(true);
                        break;
                    case PowerUpType.double:
                        player.pUDoubleShot(true);
                        break;
                }
                this.arrayOfPowerUps.splice(i, 1);
            }
        }
        // shots and player
        for(let i=0;i<this.arrayOfEnemiesShots.length;i++){
            let distanceV = distance(this.arrayOfEnemiesShots[i].x+this.arrayOfEnemiesShots[i].width/2, this.arrayOfEnemiesShots[i].y + this.arrayOfEnemiesShots[i].height, player.x, player.y);
            if(distanceV < player.radius){
                
                this.addParticle(this.arrayOfEnemiesShots[i].x+this.arrayOfEnemiesShots[i].width/2, this.arrayOfEnemiesShots[i].y + this.arrayOfEnemiesShots[i].height, 1);
                player.getDamage(this.arrayOfEnemiesShots[i].dmg);
                this.arrayOfEnemiesShots.splice(i, 1);
            }
        }
        // shots and enemies
        for(let i=0;i<this.arrayOfEnemies.length;i++){
            for(let j=0;j<this.arrayOfPlayerShots.length;j++){
                let distanceV = distance(this.arrayOfPlayerShots[j].x+this.arrayOfPlayerShots[j].width/2, this.arrayOfPlayerShots[j].y, this.arrayOfEnemies[i].x, this.arrayOfEnemies[i].y);
                if(distanceV < this.arrayOfEnemies[i].radius){
                    this.addParticle(this.arrayOfPlayerShots[j].x+this.arrayOfPlayerShots[j].width/2, this.arrayOfPlayerShots[j].y, 0);
                    this.arrayOfEnemies[i].getDamage(this.arrayOfPlayerShots[j].dmg);
                    this.arrayOfPlayerShots.splice(j, 1);
                }
            }
        }
        // shots and meteors
        for(let i=0;i<this.arrayOfMeteors.length;i++){
            for(let j=0;j<this.arrayOfPlayerShots.length;j++){
                let distanceV = distance(this.arrayOfPlayerShots[j].x+this.arrayOfPlayerShots[j].width/2, this.arrayOfPlayerShots[j].y, this.arrayOfMeteors[i].x, this.arrayOfMeteors[i].y);
                if(distanceV < this.arrayOfMeteors[i].radius){
                    this.addParticle(this.arrayOfPlayerShots[j].x+this.arrayOfPlayerShots[j].width/2, this.arrayOfPlayerShots[j].y, 0);
                    this.arrayOfMeteors[i].getDamage(this.arrayOfPlayerShots[j].dmg);
                    this.arrayOfPlayerShots.splice(j, 1);
                }
            }
        }
    }

    this.waveStart = function() {
        let randomWave;
        do {
            randomWave = getRandomInt(0, arrayOfWaveData.length-1);
        } while(arrayOfWaveData[randomWave][0] > gameTime.time && (arrayOfWaveData[randomWave][1] < gameTime.time || arrayOfWaveData[randomWave][1] !== -1));
        this.currentWave = arrayOfWaveData[randomWave].slice();
        this.currentWave.shift();
        this.currentWave.shift();
    }

    this.spawnRandomMeteor = function() {
        let x, dx;
        if(getRandomBool()){
            x = 50;
            dx =  Math.random() + 0.5;
        } else {
            x = 1550;
            dx = -(Math.random() + 0.5);
        }
        let y = -50;
        let dy = Math.ceil(Math.random()*2) + 1;
        let step = getRandomInt(1,3);
        let type = gameTime.time > 180000 ? 1 : 0; // brown when time is lower than 3 min, else grey
        
        this.arrayOfMeteors.push(new Meteor(x, y, dx, dy, step, type));
    }

    this.spawnMiniMeteor = function(x, y, dx, dy, type) {
        if(dx === -1 && dy === -1){
            dx = Math.random()*3 - 1.5;
            dy = Math.ceil(Math.random()*2) + 1;
        }
        let step = getRandomInt(2,4);
        
        this.arrayOfMeteors.push(new Meteor(x, y, dx, dy, step, type));
    }

    this.spawnEnemy = function(enemyType) {
        this.arrayOfEnemies.push(new Enemy(70,-80,enemyType));
    }

    this.addPlayerShot = function(x, y, dy, dmg, type) {
        this.arrayOfPlayerShots.push(new Shot(x, y, dy, dmg, type));
    }

    this.addEnemyShot = function(x, y, dy, dmg, type) {
        this.arrayOfEnemiesShots.push(new Shot(x, y, dy, dmg, type));
    }

    this.addParticle = function(x, y, type) {
        this.arrayOfParticle.push(new Particle(x, y, type));
    }

    this.spawnPowerUp = function(x, y, type) {
        this.arrayOfPowerUps.push(new PowerUp(x, y, type));
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
    this.img.src = arrayOfParticleImgPath[type][0];

    this.update = function() {
        let opacity = this.counter < 2 ? 1 : 0.5;
        if(this.counter === 1){
            this.img.src = arrayOfParticleImgPath[type][1];
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
    if(dev){
        c.fillRect(gameController.startPoint, 0, gameController.unit * 1600, gameController.unit * 900);
    }
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