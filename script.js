var canvas;
var ctx;
var enemySpeed = 1;
var bulletSpeed = 2;
var speed = 15;
var enemies = [];
var bullets = [];
var canShoot = true;

var player = {
	hor: function(a){
		if((a < 0 && this.x >= 0) ||
			(a > 0 && this.x <= 320 - this.sprite.width) ){
			this.x += a;
		}
	},
	vert: function(a){
		if((a < 0 && this.y >= 0) ||
			(a > 0 && this.y <= 480 - this.sprite.height) ){
			this.y += a;
		}
	},
	shoot: function(){
		if(!canShoot) return;
		b = Bullet();
		bullets.push(b);
		
		canShoot = false;
		setTimeout(function(){canShoot=true}, 600);
	},
	x:160,
	y:240,
	sprite:null
}

var Enemy = function(){
	var sprite = new Image();
	sprite.src= "img/alien.gif"
	return {
		x:  Math.random() * 320,
		y: -5,
		sprite:sprite
	}	
}

var Bullet = function() {
	var sprite = new Image();
	sprite.src = "img/bullet.png";
	return {
		x:player.x + player.sprite.width/2,
		y:player.y - 2,
		sprite:sprite
	}
}

window.onkeydown = function(e) {
	var codes = {
		37: function() {
			player.hor(-speed);
		},
		38: function(){
			player.vert(-speed);	
		},
		39: function(){
			player.hor(speed);	
		},
		40: function(){
			player.vert(speed);
		},
		32: function(){
			player.shoot();
		}
	};
	
	if(e.keyCode in codes){
		codes[e.keyCode]();
	}
}

window.onload = function() {
	startUp();
}
function startUp(){
	window.setInterval(gameLoop, 20);
	window.setInterval(createEnemy, 2000);
	
	canvas = document.getElementById('game_canvas');
	ctx = canvas.getContext('2d');
	
	player.sprite = new Image();
	player.sprite.src = "img/nave.gif";
}

function gameLoop(){
	calculateCollisions();	
	drawBackground();
	drawPlayer();
	drawBullets();
	drawEnemies();
}

function calculateCollisions(){
	for(e=0; e<enemies.length; e++){
		if(enemies[e] == null) continue;
		c = testCollision(enemies[e], player);
		console.dir(c);
		if(c == true){
			enemies.splice(e,1);	
			return;
		}
		for(b=0; b<bullets.length; b++){
			c = testCollision(enemies[e], bullets[b]);
			if(c){
				enemies.splice(e,1);
				bullets.splice(b,1);
				return;
			}
		}
	}	
}

function testCollision(obj1, obj2){
	return!(obj1.x > obj2.x+obj2.sprite.width ||
			obj1.x+obj1.sprite.width < obj2.x ||
			obj1.y > obj2.y+obj2.sprite.height ||
			obj1.y+obj1.sprite.height < obj2.y);
}

function createEnemy(){
	e = Enemy();
	enemies.push(e);
}

function drawBackground(){
	ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect (0, 0, 320, 480);
}

function drawPlayer(){
	ctx.drawImage(player.sprite, player.x, player.y);
}

function drawBullets(){
	if(bullets[0]==undefined) return;
	for(i=0; i<bullets.length;i++){
		bullets[i].y -= bulletSpeed;
		ctx.drawImage(bullets[i].sprite, bullets[i].x, bullets[i].y);	
	}
	
	if(bullets[0].y < 0){
		bullets.shift();	
	}
}

function drawEnemies(){
	if(enemies[0]==undefined) return;
	for(i=0; i<enemies.length;i++){
		enemies[i].y += enemySpeed;
		ctx.drawImage(enemies[i].sprite, enemies[i].x, enemies[i].y);
	}
	
	if(enemies[0].y > 480){
		enemies.shift();	
	}
}
