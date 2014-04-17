var canvas;
var ctx;
var enemies = [];
var bullets = [];
var framerate = 20;
var frameskip = framerate/5;

Math.clamp = function(num, min, max) {
  return Math.min(Math.max(num, min), max);
};

//Input management:
var InputManager = {
	keysPressed: [],
	//get key presses
	onKeyPress: function(e) {
		var haskey = this.keysPressed[e.keyCode];
		if(!haskey){
			this.keysPressed[e.keyCode] = true;	
		}
	},
	//key release
	onKeyRelease: function(e){
		this.keysPressed[e.keyCode] = false;
	},
	//is key pressed?
	isKeyPressed: function(key){
		return this.keysPressed[key];
	},
	//player actions
	proccessInput: function(){
		var mx = (this.isKeyPressed(37) ? -1 : 0) + (this.isKeyPressed(39) ? 1 : 0);
		var my = (this.isKeyPressed(38) ? -1 : 0) + (this.isKeyPressed(40) ? 1 : 0);
		player.move(mx, my);
		
		if(this.isKeyPressed(32)){
			player.shoot();
		}
	}
}
$(window).keydown( function(e){
	InputManager.onKeyPress(e);
	});
$(window).keyup(function(e){
	InputManager.onKeyRelease(e);
	});
//=================

//Objects
var game = {
	points: 0,
	level: 0,
	enemiesDown: 0,
	background: null,
	changeLevel: function(){
		this.level++;
		player.fireRate -= 25;
		this.enemiesDown++;
	},
	changeScore: function(score){
		this.points = Math.clamp(this.points+score, 0, 999999999);	
	}		
}
var player = {
	acceleration: 1.35,
	drag: 0.92,
	canShoot: true,
	x:140,
	y:400,
	max_speed:10,
	speed:1,
	dx:1,
	dy:1,
	fireRate:600,
	life:100,
	maxLife:100,
	graze:0,
	sprite:null,
	core: {
		x:500,
		y:500,
		sprite:null	
	},
	//player loop
	update: function(){
		this.speed = Math.clamp(this.speed, 1, this.max_speed);
		
		if((this.dx < 0 && this.x >= 0) ||
		(this.dx > 0 && this.x <= 320 - this.sprite.width) ){	
			this.x += this.dx * (this.speed-1) / frameskip;
		}
		if((this.dy < 0 && this.y >= 0) ||
		(this.dy > 0 && this.y <= 480 - this.sprite.height) ){
			this.y += this.dy * (this.speed-1) / frameskip;
		}
		
		this.core.x = this.x + this.sprite.width/2 - this.core.sprite.width/2;
		this.core.y = this.y + this.sprite.height/2 - this.core.sprite.height/2;
		
		this.graze -= this.drag / frameskip;
		this.graze = Math.clamp(this.graze, 0, 30);
		
		this.life = Math.clamp(this.life, 0, this.maxLife);
		/*if(this.life <= 0){
			window.location.reload();	
			//window.location.href = "end.html"
		}*/
	},
	//moves the player
	move: function(mx, my) {
		if(mx+my==0){
			this.speed *= this.drag;		
		} else {
			this.speed *= this.acceleration;
			this.dx = mx;
			this.dy = my;
		}		
	},
	//shoots bullets
	shoot: function(){
		if(!this.canShoot) return;
		b = Bullet(true, this);
		bullets.push(b);
		
		this.canShoot = false;
		setTimeout(function(){player.canShoot=true}, Math.clamp(this.fireRate - (this.graze*25), 200, 2500));
	}
}

var Enemy = function(tier){
	var sprite = new Image();
	if(tier==1){
		sprite.src= "img/alien.gif"
	}
	if(tier==2){
		sprite.src= "img/alien2.gif"
	}
	if(tier==3){
		sprite.src= "img/alien3.gif"
	}
	return {
		x:  Math.random() * 320,
		y: -5,
		speed: 2,
		life:tier,
		points:5 + tier*10,
		canShoot: true,
		fireRate: 3000 - (tier*100) - (game.level*25),
		sprite:sprite,
		shoot: function(){
			if(player.life <=0) return;
			if(!this.canShoot) return;
			b = Bullet(false, this);
			b.y += sprite.height;
			b.speedy = -6;
			bullets.push(b);
			
			if(tier>=2){
				b = Bullet(false, this);
				b.speedy = -3;
				b.speedx = -3
				bullets.push(b);	
				
				b = Bullet(false, this);
				b.speedy = -3;
				b.speedx = 3
				bullets.push(b);	
			}

			if(tier==3){
				b = Bullet(false, this);
				b.speedy = 0;
				b.speedx = -6
				bullets.push(b);	
				
				b = Bullet(false, this);
				b.speedy = 0;
				b.speedx = 6
				bullets.push(b);	
			}
						
			var who=this;
			
			this.canShoot = false;
			setTimeout(function(){who.canShoot=true}, this.fireRate);	
		}
	}	
}

var Bullet = function(friend, who) {
	if (bullets.length > 256){
		bullets.shift();
	}
	var sprite = new Image();
	if(friend)
		sprite.src = "img/bullet.png";
	else sprite.src = "img/bullet2.png";
	
	var sx = 0;
	var sy = 6;
	
	return {
		x: who.x + who.sprite.width/2 - sprite.width/2,
		y: who.y - 2,
		speedx: sx,
		speedy: sy,
		isFriend: friend,
		sprite:sprite
	}
}
//==================

window.onload = function() {
	startUp();
}

function startUp(){
	window.setInterval(gameLoop, framerate);
	window.setInterval(physicsUpdate, framerate);
	window.setTimeout(createEnemy, 2000);
	canvas = document.getElementById('game_canvas');
	ctx = canvas.getContext('2d');
	
	player.sprite = new Image();
	player.sprite.src = "img/nave.gif";
	player.core.sprite = new Image();
	player.core.sprite.src = "img/core.png"
	game.background = new Image();
	game.background.src = "img/bg.jpg";
}

function gameLoop(){
	if(game.enemiesDown % 20 == 1){
		game.changeLevel();
	}
	
	InputManager.proccessInput();
	
	drawBackground();
	drawPlayer();
	drawBullets();
	drawEnemies();
	drawHUD();
}

//"Physics"
function physicsUpdate(){
	if(player.life <=0) return;
	
	player.update();
		
	for(i=0; i<bullets.length;i++){
		if(bullets[i].isFriend){
		bullets[i].y -= bullets[i].speedy;
		bullets[i].x -= bullets[i].speedx;			
		}else{
		bullets[i].y -= bullets[i].speedy - Math.clamp(1 * player.graze, 0, 1);
		bullets[i].x -= bullets[i].speedx - Math.clamp(1 * player.graze, 0, 1);
		}
	}	
	
	for(i=0; i<enemies.length;i++){
		enemies[i].y += enemies[i].speed - Math.clamp(1 * player.graze, 0, 1);
	}
	
	calculateCollisions();
}

function calculateCollisions(){
	for(e=0; e<enemies.length; e++){
		if(enemies[e] == null) continue;
		
		graze = testCollision(enemies[e], player);
		if(graze){
			game.changeScore(1);
			player.graze += player.acceleration / frameskip;
			player.life += player.acceleration / (frameskip*10);	
		}
		
		c = testCollision(enemies[e], player.core);
		if(c == true){
			game.changeScore(-enemies[e].points);
			player.life -= enemies[e].points;	
			enemies.splice(e,1);
			player.graze = 0;
			return;
		}
		
		for(b=0; b<bullets.length; b++){
			
			if(bullets[b].isFriend == false){
				c = testCollision(player.core, bullets[b]);	
				if(c){
					game.changeScore(-15);
					player.life -= 15;	
					bullets.splice(b,1);
					player.graze = 0;
					continue
				}	
			}else{
		graze = testCollision(bullets[b], player);
		if(graze && !bullets[b].isFriend){
			game.changeScore(1);
			player.graze += player.acceleration / frameskip;	
			player.life += player.acceleration / (frameskip*10)
		}
		c = testCollision(enemies[e], bullets[b]);
		console.dir(c);
			if(c){
				bullets.splice(b,1);
				enemies[e].life--;
				//test if enemy down:
				if(enemies[e].life < 1){
				//Give Points:
					game.enemiesDown++;
					game.changeScore(enemies[e].points);
					enemies.splice(e,1);
				}
			continue;	
			}
		}
			
		}
	}	
}

function testCollision(obj1, obj2){
	console.dir(obj1.x + " - " + obj1.y + " - " + obj1.sprite.width);
	return!(obj1.x > obj2.x+obj2.sprite.width ||
			obj1.x+obj1.sprite.width < obj2.x ||
			obj1.y > obj2.y+obj2.sprite.height ||
			obj1.y+obj1.sprite.height < obj2.y);
}
//============

function createEnemy(){
	if(player.life <=0) return;
	
	var tier = Math.random() * game.level;
	if(tier < 0.5) tier = 1;
	else if (tier < 1.3) tier = 2;
	else tier = 3;

	e = Enemy(tier);
	enemies.push(e);
	
	window.setTimeout(createEnemy, Math.clamp(2000 - (game.level*70), 200, 3000));
}

function drawBackground(){
    ctx.drawImage(game.background, 0, 0, 320, 480);
}

function drawHUD(){
	ctx.textAlign = "left";
	ctx.font = "bold 12pt sans-serif";
	ctx.textBaseline = "bottom";
 	ctx.fillStyle = "rgb(255,255,255)";
 	ctx.fillText("Score: " + game.points, 5, 20);
 	ctx.fillText("Level: " + game.level, 100, 20)
 	if(player.life <=0){
	 	ctx.font = "bold 42pt sans-serif";
	 	ctx.textAlign = "center";
	 	ctx.fillText("GAME OVER", 160, 240);	 		
 	}
 	
 	ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect (213, 5, 102, 15); 		
	ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect (214, 6, Math.clamp(player.life,0,100), 13);
}

function drawPlayer(){
	ctx.drawImage(player.sprite, player.x, player.y);
	ctx.drawImage(player.core.sprite, player.core.x, player.core.y);
}

function drawBullets(){
	if(bullets[0]==undefined) return;
	for(i=0; i<bullets.length;i++){
		ctx.drawImage(bullets[i].sprite, bullets[i].x, bullets[i].y);	
		
		if(bullets[i].y < 0){
			bullets.splice(i,1);	
		}
	}
}

function drawEnemies(){
	if(enemies[0]==undefined) return;
	for(i=0; i<enemies.length;i++){
		enemies[i].shoot();
		ctx.drawImage(enemies[i].sprite, enemies[i].x, enemies[i].y);
		
		if(enemies[i].y > 500){
			enemies.splice(i,1);	
		}
	}
}
