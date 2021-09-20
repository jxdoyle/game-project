// game variables
var myGamePiece;
var myObstacles = [];
var myScore;
var myName;
var mySound;
var clickSound;
var winner;

// intilise game elements
function startGame() {
    myGamePiece = new component(30, 30, "white", 10, 120);
    myScore = new component("30px", "Consolas", "white", 20, 40, "text");
    myName = new component("30px", "Consolas", "white", 220, 40, "text");
    mySound = new sound("hit.wav");
    clickSound = new sound("button.ogg")
    winner = new component("72px", "Verdana", "white", 300, 200, "text");
    myGameArea.start();
    move();
}

// changes color of game based on radio button selection
function getColor() {
    var myColor;           
    if (document.getElementById('blue').checked) {
        myColor = '#00FFFF';
    }
    else if (document.getElementById('pink').checked) {
        myColor = '#FF1493';
    }
    else if (document.getElementById('green').checked) {
        myColor = '#7FFF00';
    }
    else if (document.getElementById('red').checked) {
        myColor = '#FF0000';
    }

    return myColor;
}

var myGameArea = {
    canvas : document.createElement("canvas"),

    // setup canvas / game
    start : function() {
        this.canvas.width = 1000;
        this.canvas.height = 400;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },

    // clear frames to prevent "trailing"            
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // gameOver
    stop : function() {
        stop.called = true;
        clearInterval(this.interval);
    }
}

// player object setup
function component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;    
    this.update = function() {
        ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = getColor();
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // movement
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;        
    }

    // collision detection
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

// update function
function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;

    // collision detection - play sound on hit & end game
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            mySound.play();
            myGameArea.stop();
            return;
        } 
    }

    // randomised game obstacles
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(150)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = 200;
        height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);
        minGap = 50;
        maxGap = 200;
        gap = Math.floor(Math.random()*(maxGap-minGap+1)+minGap);
        myObstacles.push(new component(10, height, "red", x, 0));
        myObstacles.push(new component(10, x - height - gap, "red", x, height + gap));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].speedX = -1;
        myObstacles[i].newPos();
        myObstacles[i].update();
    }

    // updates score per frame
    myScore.text="Score: " + myGameArea.frameNo;
    myScore.update();

    // updates player character
    myGamePiece.newPos();    
    myGamePiece.update();

    // gets and displays player username
    myName.text="Name: " + getParameterByName(window.location.href, 'username');
    myName.update();
}

// sound functions
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
    this.sound.play();
    }
    this.stop = function(){
    this.sound.pause();
    }    
}   

function everyinterval(n) {
    if ((myGameArea.frameNo / n) % 1 == 0) {return true;}
    return false;
}

// movement functions
function moveup() {
    myGamePiece.speedY = -1; 
}
function movedown() {
    myGamePiece.speedY = 1; 
}
function moveleft() {
    myGamePiece.speedX = -2; 
}
function moveright() {
    myGamePiece.speedX = 1; 
}
function clearmove() {
    myGamePiece.speedX = 0; 
    myGamePiece.speedY = 0; 
}

// dark mode
function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}

// progress bar
var i = 0;
function move() {
    if (i == 0) {
        i = 1;
        var elem = document.getElementById("myBar");
        var width = 1;
        var id = setInterval(frame, 10);
        function frame() {
            if (stop.called) {
                // do nothing - stop progress bar
            } else {
                if (width >= 100) {
                    clearInterval(id);
                    i = 0;
                    myGameArea.stop();
                    winner.text="YOU WIN!!";
                    winner.update();
                } else {
                    width = width + 0.01;
                    elem.style.width = width + "%";
                }
            }
        }
    }
}

// function to get params from url
getParameterByName = function(url, name) {
    searchParams = new URLSearchParams(url.split('?')[1]);
    return searchParams.get(name)
}

// add other options later
// search color selected, selection = checked
// if param = darkmode on, run darkmode()