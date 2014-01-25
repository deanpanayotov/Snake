/**
 * Created by dpanayotov on 24/01/14.
 */

function fiftyfifty() {
    return (Math.round(Math.random()) === 0);
}

function Snake() {

    this.pickDirection = function () {
        if (fiftyfifty()) {
            if (fiftyfifty()) {
                this.dirX = 1;
            } else {
                this.dirX = -1;
            }
            this.dirY = 0;
        } else {
            this.dirX = 0;
            if (fiftyfifty()) {
                this.dirY = 1;
            } else {
                this.dirY = -1;
            }
        }
        this.prevDirX = this.dirX;
        this.prevDirY = this.dirY;
    };

    this.initSegments = function(){
        //Pick a starting point
        var x = Math.floor(Math.random() * GRID_WIDTH);
        var y = Math.floor(Math.random() * GRID_HEIGHT);

        //
        this.segments = [];
        for (var i = 0; i < INITIAL_SEGMENT_COUNT; i++) {
            this.segments.push(new Segment((GRID_WIDTH + x) % GRID_WIDTH, (GRID_HEIGHT + y) % GRID_HEIGHT));
            x -= this.dirX;
            y -= this.dirY;
        }
    };

    this.draw = function () {
        this.segments.forEach(function (segment) {
            drawSquare(segment, COLOR_FRGR);
        })
    };

    this.update = function () {
        var head = new Segment((GRID_WIDTH + this.segments[0].x + this.dirX ) % GRID_WIDTH, (GRID_HEIGHT + this.segments[0].y + this.dirY) % GRID_HEIGHT);
        if (this.bite(head) == 0) {
            if (this.grow) {
                this.grow = false;
                changeGameSpeed(Math.max(MIN_GAME_SPEED, Math.round(gameSpeed - GAME_SPEED_STEP * gameSpeed)));
            } else {
                drawSquare(this.segments.pop(), COLOR_BGR);
            }
            this.segments.unshift(head);
            drawSquare(this.segments[0], COLOR_FRGR);
            this.prevDirX = this.dirX;
            this.prevDirY = this.dirY;
        }
    };

    this.bite = function (head) {
        for (var i = 1; i < this.segments.length - 1; i++) { // skipping head and tail
            if (this.segments[i].x === head.x && this.segments[i].y === head.y) {
                gameOver();
                return 1;
            }
        }
        if (food.segment.x === head.x && food.segment.y === head.y) {
            this.grow = true;
            dropFood();
        }
        return 0;
    };

    this.keyPress = function (e) {
        var key = e.keyCode ? e.keyCode : e.charCode;
        switch (key) {
            case KEY_w:
            case KEY_W:
            case KEY_UP:
                if (this.prevDirY != 1) {
                    this.dirX = 0;
                    this.dirY = -1;
                }
                break;
            case KEY_a:
            case KEY_A:
            case KEY_LEFT:
                if (this.prevDirX != 1) {
                    this.dirX = -1;
                    this.dirY = 0;
                }
                break;
            case KEY_s:
            case KEY_S:
            case KEY_DOWN:
                if (this.prevDirY != -1) {
                    this.dirX = 0;
                    this.dirY = 1;
                }
                break;
            case KEY_d:
            case KEY_D:
            case KEY_RIGHT:
                if (this.prevDirX != -1) {
                    this.dirX = 1;
                    this.dirY = 0;
                }
                break;
        }
    };

    var INITIAL_SEGMENT_COUNT = 4;
    this.grow = false;
    this.pickDirection();
    this.initSegments();
    this.draw();
}

function Segment(x, y) {
    this.x = x;
    this.y = y;
}

function Blinker(segment, color) {
    this.blinkTime = DEFAULT_BLINK_TIME;
    this.color = color ? color : COLOR_BGR;
    this.segment = segment;

    this.blink = function () {
        if (this.color === COLOR_BGR)
            this.color = COLOR_FRGR;
        else
            this.color = COLOR_BGR;
        if (this.segment) {
            drawSquare(this.segment, this.color);
        }
    };
    this.start = function () {
        var that = this;
        this.timer = setInterval(function () {
                that.blink()
            },
            this.blinkTime);
    };

    this.stop = function () {
        clearInterval(this.timer);
    };
}

/////////////////////////////////////////////////////

dropFood = function () {
    do {
        //floor not round because round can return GRID_WIDTH/GRID_HEIGHT which would be outside of canvas!
        food.segment = new Segment(Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT));
    } while (foodTouchesSnake());
};

changeGameSpeed = function (speed) {
    clearInterval(game);
    gameSpeed = speed;
    game = setInterval(function () {
        snake.update()
    }, gameSpeed);
};

//drawFood = function () {
//    if (foodColor === COLOR_BGR)
//        foodColor = COLOR_FRGR;
//    else
//        foodColor = COLOR_BGR;
//    drawSquare(food, foodColor);
//};

foodTouchesSnake = function () {
    for (var i = 0; i < snake.segments.length; i++) {
        if (snake.segments[i].x === food.segment.x && snake.segments[i].y === food.segment.y) {
            return true;
        }
    }
    return false;
};
gameOver = function () {
    console.log("gameOVer");
    clearScreen();
    snake = new Snake();
    changeGameSpeed(INITIAL_GAME_SPEED);
};

drawSquare = function (segment, color) {
    context.fillStyle = color;
    context.fillRect(segment.x * CELL_SIZE + CELL_PADDING, segment.y * CELL_SIZE + CELL_PADDING, CELL_SIZE - CELL_PADDING, CELL_SIZE - CELL_PADDING);
};


keyPress = function (e) {
    snake.keyPress(e);
};

clearScreen = function () {
    context.fillStyle = COLOR_BGR;
    context.fillRect(0, 0, canvas.width, canvas.height);
};

/////////////////////////////////////////////////////


var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var CELL_SIZE = 10;
var CELL_PADDING = 1;
var GRID_WIDTH = 20;
var GRID_HEIGHT = 20;

var COLOR_BGR = "#334467";
var COLOR_FRGR = "#DAEF6B";

var KEY_w = 119;
var KEY_W = 87;
var KEY_UP = 38;
var KEY_a = 97;
var KEY_A = 65;
var KEY_LEFT = 37;
var KEY_s = 115;
var KEY_S = 83;
var KEY_DOWN = 40;
var KEY_d = 100;
var KEY_D = 68;
var KEY_RIGHT = 39;

var INITIAL_GAME_SPEED = 140;
var GAME_SPEED_STEP = 0.05;
var MIN_GAME_SPEED = 20;
var DEFAULT_BLINK_TIME = 100;

var gameSpeed = INITIAL_GAME_SPEED;

canvas.width = CELL_SIZE * GRID_WIDTH;
canvas.height = CELL_SIZE * GRID_HEIGHT;

var food = new Blinker(undefined, undefined);
food.start();
var game;

clearScreen();
var snake = new Snake();
dropFood();
game = setInterval(function () {
    snake.update()
}, gameSpeed);