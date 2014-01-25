/**
 * Created by dpanayotov on 15/01/14.
 */

var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var CELL_SIZE = 10;
var CELL_PADDING = 1;
var GRID_WIDTH = 20;
var GRID_HEIGHT = 10;

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

var INITIAL_GAME_SPEED = 200;
var GAME_SPEED_STEP = 200;
var MIN_GAME_SPEED = 50;

var gameSpeed = INITIAL_GAME_SPEED;

canvas.width = CELL_SIZE * GRID_WIDTH;
canvas.height = CELL_SIZE * GRID_HEIGHT;

var prevDirX = 1;
var prevDirY = 0;
var dirX = 1;
var dirY = 0;

var food;
var foodColor = COLOR_BGR;

var game;

function Snake(segments) {
    this.segments = segments;
    if (segments === undefined) {
        this.segments = [
            new Segment(5, 0),
            new Segment(4, 0),
            new Segment(3, 0),
            new Segment(2, 0),
            new Segment(1, 0),
            new Segment(0, 0)
        ];
    }

    this.grow = false;

    this.draw = function () {
        this.segments.forEach(function (segment) {
            drawSquare(segment, COLOR_FRGR);
        })
    };

    this.update = function () {
        var head = new Segment((GRID_WIDTH + this.segments[0].x + dirX ) % GRID_WIDTH, (GRID_HEIGHT + this.segments[0].y + dirY) % GRID_HEIGHT);
        this.bite(head);
        if (this.grow) {
            this.grow = false;
            clearInterval(game);
            gameSpeed = Math.max(MIN_GAME_SPEED, gameSpeed - GAME_SPEED_STEP);
            game = setInterval(function () {
                snake.update()
            }, gameSpeed);
        } else {
            drawSquare(this.segments.pop(), COLOR_BGR);
        }
        this.segments.unshift(head);
        drawSquare(this.segments[0], COLOR_FRGR);
        prevDirX = dirX;
        prevDirY = dirY;
    };

    this.bite = function (head) {
        for (var i = 1; i < this.segments.length - 1; i++) { // skipping head and tail
            if (this.segments[i].x === head.x && this.segments[i].y === head.y) {
                gameOver();
            }
        }
        if (food.x === head.x && food.y === head.y) {
            this.grow = true;
            dropFood();
        }
    };

    this.draw();
}

function Segment(x, y) {
    this.x = x;
    this.y = y;
}

dropFood = function () {
    do {
        //floor not round because round can return GRID_WIDTH/GRID_HEIGHT which would be outside of canvas!
        food = new Segment(Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT));
    } while (foodTouchesSnake());
};

drawFood = function () {
    if (foodColor === COLOR_BGR)
        foodColor = COLOR_FRGR;
    else
        foodColor = COLOR_BGR;
    drawSquare(food, foodColor);
};

foodTouchesSnake = function () {
    for (var i = 0; i < snake.segments.length; i++) {
        if (snake.segments[i].x === food.x && snake.segments[i].y === food.y) {
            console.log("touch");
            return true;
        }
    }
    return false;
};
gameOver = function () {
    clearScreen();
    snake = new Snake();
};

drawSquare = function (segment, color) {
    context.fillStyle = color;
    context.fillRect(segment.x * CELL_SIZE + CELL_PADDING, segment.y * CELL_SIZE + CELL_PADDING, CELL_SIZE - CELL_PADDING, CELL_SIZE - CELL_PADDING);
};


keyPress = function (e) {
    var key = e.keyCode ? e.keyCode : e.charCode;
    switch (key) {
        case KEY_w:
        case KEY_W:
        case KEY_UP:
            if (prevDirY != 1) {
                dirX = 0;
                dirY = -1;
            }
            break;
        case KEY_a:
        case KEY_A:
        case KEY_LEFT:
            if (prevDirX != 1) {
                dirX = -1;
                dirY = 0;
            }
            break;
        case KEY_s:
        case KEY_S:
        case KEY_DOWN:
            if (prevDirY != -1) {
                dirX = 0;
                dirY = 1;
            }
            break;
        case KEY_d:
        case KEY_D:
        case KEY_RIGHT:
            if (prevDirX != -1) {
                dirX = 1;
                dirY = 0;
            }
            break;
    }
};

clearScreen = function () {
    context.fillStyle = COLOR_BGR;
    context.fillRect(0, 0, canvas.width, canvas.height);
};


clearScreen();
var snake = new Snake();
dropFood();
game = setInterval(function () {
    snake.update()
}, gameSpeed);
setInterval(function () {
    drawFood();
}, 100);