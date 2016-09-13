var JS13KGlitch = function () {

    if (!(this instanceof JS13KGlitch)) {
        return new JS13KGlitch();
    }

    // all the global configurations
    this.global = {
        overlay: document.getElementById('olay'),
        introTxt: document.getElementById('intro-txt'),
        startTxt: document.getElementById('start'),
        playing: false,
        jumping: false,
        goingUp: true,
        isInShadow: false,
        primaryPlayerColor: '#303f9f',
        primaryObstacleColor: '#ff0000',
        shadowPlayerColor: '#dedede',
        shadowObstacleColor: '#dedede',
        hitObstacleColor: '#ff0000',
        health: 1000,
        maxHealth: 1000,
        counter: 1,
        obstacles: [],
        pause: false,
        playerHeight: 20,
        shadowSpeedMultiple : 1
    };

    // initialize the canvas
    this.canvasElement = document.getElementById("js13kCanvas");
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;

    this.canvasHeight = this.canvasElement.offsetHeight,
    this.canvasContext = this.canvasElement.getContext("2d"),
    this.canvasWidth = this.canvasElement.offsetWidth
    this.playerPosition = {
        x: this.canvasElement.offsetWidth/2,
        y: this.canvasElement.offsetHeight/2
    };
    this.debug = document.getElementById("debug");
    this.addKeyDownEvents();
};

JS13KGlitch.prototype.addKeyDownEvents = function () {
    var self = this;

    /**
     * activating fullscreen mode when the enter key is hit
     */
    document.addEventListener("keydown", function(e) {
        var container = document.getElementById('container');
        e = e || window.event;

        switch (e.keyCode) {
        case 13:
            if (!document.mozFullScreen && !document.webkitFullScreen) {
                if (container && container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else {
                    container.webkitRequestFullScreen();
                }
            } else {
                if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else {
                    document.webkitCancelFullScreen();
                }
            }
        break;
        case 38: // if the UP arrow is pressed
            if (!self.global.jumping) {
                console.log('Jumped up..');
                self.global.something = true;
                self.global.jumping = true;
                self.global.goingUp = true;
            }
        break;
        case 32: // if the spacebar is pressed
            self.global.isInShadow = !self.global.isInShadow;
            if(self.global.isInShadow) {
                self.global.shadowSpeedMultiple = ( Math.floor(Math.random() * 8)  ) + 2 ;
            }

        break;
        case 88:
            self.global.pause = !self.global.pause;
        }
    }, false);
};

JS13KGlitch.prototype.drawMap = function () {
    var context = this.canvasContext;

    context.beginPath();
    context.rect(0, 0, this.canvasWidth, this.canvasHeight/2);
    context.fillStyle = '#ffffff';
    context.fill();

    context.moveTo(0, this.canvasHeight/2);
    context.lineTo(this.canvasWidth, this.canvasHeight/2);
    context.stroke();

    context.beginPath();
    context.rect(0, this.canvasHeight/2, this.canvasWidth, this.canvasWidth/2);
    context.fillStyle = '#000000';
    context.fill();
};

JS13KGlitch.prototype.handleJumps = function () {
    if (this.global.jumping) {
        if(this.global.goingUp){
            if (this.playerPosition.y + this.global.playerHeight > this.canvasHeight/2 - 200) {
                this.playerPosition.y = this.playerPosition.y - 5;
            } else {
                this.global.goingUp = false;
            }
        }

        if (!this.global.goingUp) {
            if (this.playerPosition.y + this.global.playerHeight<= this.canvasHeight/2) {
                this.playerPosition.y = this.playerPosition.y + 5;
            } else {
                this.global.jumping = false;
            }
        }
    }
};

JS13KGlitch.prototype.getShadowY = function (realY) {
    return (realY + ((this.canvasHeight/2 - realY) * 2) );
};

// draw player
JS13KGlitch.prototype.drawPlayer = function () {
    var context = this.canvasContext;

    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawMap();

    context.beginPath();
    context.strokeStyle = '#ffffff';
    context.arc(this.playerPosition.x, this.playerPosition.y - this.global.playerHeight, 20, 20, 0, Math.PI*2, true); // Outer circle
    context.arc(this.playerPosition.x, this.playerPosition.y - this.global.playerHeight-20, 10, 20, 0, Math.PI*2, true); // Outer circle
    context.fillStyle = this.global.isInShadow ? this.global.shadowPlayerColor : this.global.primaryPlayerColor;
    context.fill();
    context.stroke();

    context.beginPath();
    context.arc(this.playerPosition.x, this.getShadowY(this.playerPosition.y - this.global.playerHeight) , 20, 20, 0, Math.PI*2, true); // Outer circle
    context.arc(this.playerPosition.x, this.getShadowY(this.playerPosition.y - this.global.playerHeight-20) , 10, 20, 0, Math.PI*2, true); // Outer circle
    context.fillStyle = !this.global.isInShadow ? this.global.shadowPlayerColor : this.global.primaryPlayerColor;
    context.fill();
    context.stroke();
    context.strokeStyle = '#000000';
};


JS13KGlitch.prototype.createObstacle = function () {
    var section;
    var rate = this.global.isInShadow ? 26 : 42;
    if (this.global.counter%rate === 0) {
        section = Math.floor(Math.random() * 4);
        this.global.obstacles.push({ x: this.canvasWidth + 1, y: this.canvasHeight/4 + ( this.canvasHeight/16 * section ) });
        if(this.global.isInShadow && this.global.shadowSpeedMultiple  < 10){
            this.global.shadowSpeedMultiple = this.global.shadowSpeedMultiple + 1;
        }
    }
}

JS13KGlitch.prototype.drawObstacle = function () {
    var i,
        context = this.canvasContext,
        l = this.global.obstacles.length,
        obstacles = this.global.obstacles,
        hit;

    this.createObstacle();

    for (i = 0; i < l; i++) {
        hit = null;

        if (obstacles[i].x < 0) {
            obstacles.splice(i, 1);
            l = obstacles.length;
            continue;
        }

        var x = obstacles[i].x - this.playerPosition.x,
            y = (obstacles[i].y + 20) - (this.playerPosition.y - this.global.playerHeight),
            distance = Math.sqrt((x*x) + (y*y));


        if (distance <= 20) {
            hit = 'shadow';
            this.global.health = this.global.health - 30;
        }

        context.beginPath();
        context.strokeStyle = '#ffffff';
        context.arc(obstacles[i].x, obstacles[i].y + 20, 15, 0, 2*Math.PI);
        context.fillStyle = this.global.isInShadow ? this.global.shadowObstacleColor : this.global.primaryObstacleColor;
        context.fill();
        context.stroke();

        context.beginPath();
        context.arc(obstacles[i].x, this.getShadowY(obstacles[i].y + 20), 15,0,2*Math.PI);

        if(hit === 'shadow'){
            context.fillStyle = this.global.hitObstacleColor;
        }else {
            context.fillStyle = !this.global.isInShadow ? this.global.shadowObstacleColor : this.global.primaryObstacleColor;
        }
        context.fill();
        context.stroke();
        context.strokeStyle = '#000000';
        obstacles[i].x = obstacles[i].x - (this.global.isInShadow ? (2 * this.global.shadowSpeedMultiple) : 8);
    }
};



JS13KGlitch.prototype.drawHealth = function () {
    var context = this.canvasContext;

    context.beginPath();
    context.rect(10, 10, this.canvasWidth/5, this.canvasHeight/30);
    context.strokeStyle = "#000";
    context.stroke();
    if(this.global.health > 0 && this.global.health  <= this.global.maxHealth){
        if(this.global.counter % 2381091){
            if( !this.global.isInShadow ) {
                this.global.health = this.global.health  - 0.5;
            }else{
                this.global.health = this.global.health  + 0.1;
            }
        }
        context.beginPath();
        context.rect(10, 10, this.canvasWidth/5 * (this.global.health/this.global.maxHealth), this.canvasHeight/30);
        context.fillStyle = 'red';
        context.fill();
        context.stroke();
    }
}

JS13KGlitch.prototype.startGame = function () {
    js13K.global.playing = true;
    js13K.global.health = js13K.global.maxHealth;
    js13K.global.overlay.style.display = 'none';

    setInterval(function () {
        if (!js13K.global.pause){
            if (js13K.global.health < 5) {
                js13K.global.introTxt.innerHTML = 'Too bad !! You\'re Roasted!';
                js13K.global.startTxt.innerHTML = 'Restart';
                js13K.global.overlay.style.display = 'block';
            } else {
                js13K.handleJumps();
                js13K.drawPlayer();
                js13K.drawObstacle();
                js13K.drawHealth();
                js13K.global.counter++;
            }
        } 
    }, 35);
};

var js13K = new JS13KGlitch();
document.getElementById('start').addEventListener('click', js13K.startGame);
