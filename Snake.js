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

    this.initSegments = function () {
        //Pick a starting point
        console.log("dirX:" + this.dirX + " dirY:" + this.dirY);
        var y;
        if (this.dirY == 1) {
            y = INITIAL_SEGMENT_COUNT - 1 + Math.floor(Math.random() * (GRID_HEIGHT - (INITIAL_SEGMENT_COUNT - 1)));
            console.log("case 6:" + y);
        } else if (this.dirY == -1) {
            y = Math.floor(Math.random() * (GRID_HEIGHT - (INITIAL_SEGMENT_COUNT - 1)));
            console.log("case 7:" + y);
        } else {
            y = Math.floor(Math.random() * GRID_HEIGHT);
            console.log("case 8:" + y);
        }
        var x;
        if (this.dirX == 1) {
            x = xBorders[y] + INITIAL_SEGMENT_COUNT - 1 + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2 - INITIAL_SEGMENT_COUNT));
            console.log("case 0:" + x);
        } else if (this.dirX == -1) {
            x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2 - INITIAL_SEGMENT_COUNT));
            console.log("case 1:" + x);
        } else if (this.dirY == 1) {
            if (y >= GRID_HEIGHT / 2 + INITIAL_SEGMENT_COUNT / 2) {
                x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
                console.log("case 2:" + x);
            } else {
                x = xBorders[y - (INITIAL_SEGMENT_COUNT - 1)] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y - (INITIAL_SEGMENT_COUNT - 1)] * 2));
                console.log("case 3:" + x);
            }
        } else {
            if (y <= GRID_HEIGHT / 2 - INITIAL_SEGMENT_COUNT / 2) {
                x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
                console.log("case 4:" + x);
            } else {
                x = xBorders[y + (INITIAL_SEGMENT_COUNT - 1)] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y + (INITIAL_SEGMENT_COUNT - 1)] * 2));
                console.log("case 5:" + x);
            }
        }

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
        this.warpHead(head);
        if (this.bite(head) == 0) {
            if (this.grow) {
                this.grow = false;
                changeGameSpeed(Math.max(MIN_GAME_SPEED, Math.round(gameSpeed - GAME_SPEED_STEP * gameSpeed)));
                score.innerHTML = ++gameScore;
            } else {
                drawSquare(this.segments.pop(), COLOR_BGR2);
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

    this.keyDown = function (e) {
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

    this.warpHead = function (segment) {
        if (segment.x < xBorders[segment.y] || segment.x >= GRID_WIDTH - xBorders[segment.y]) {
            segment.x = this.dirX ? GRID_WIDTH - 1 - segment.x + this.dirX : segment.x;
            segment.y = this.dirY ? GRID_HEIGHT - 1 - segment.y + this.dirY : segment.y;
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

///// STOPWATCH //////////////////////////////////////////////

function Stopwatch(text, updateInterval) {

    this.text = text;
    this.updateInterval = updateInterval ? updateInterval : 100;
    this.startAt = 0;
    this.lapTime = 0;

//returns current time
    this.now = function () {
        return (new Date()).getTime();
    };

    this.start = function () {
        this.startAt = this.startAt ? this.startAt : this.now();
        var that = this;
        this.timer = this.timer ? this.timer : setInterval(function () {
            that.update()
        }, this.updateInterval);
    };

    this.stop = function () {
        this.update();
        this.lapTime = this.startAt ? this.lapTime + this.now() - this.startAt : this.lapTime;
        clearInterval(this.timer);
        this.startAt = this.timer = 0;
    };

    this.reset = function () {
        this.lapTime = 0;
        this.startAt = this.startAt ? this.now() : 0;
        this.update();
    };

//adds zero padding to numbers
    this.pad = function (num, size) {
        var s = "00000" + num;
        return s.substr(s.length - size);
    };

    this.formattedTime = function () {
        var m, s, ms;
        var time = this.lapTime + (this.startAt ? this.now() - this.startAt : 0);

        time = time % (60 * 60 * 1000);
        m = Math.floor(time / (60 * 1000));
        time = time % (60 * 1000);
        s = Math.floor(time / 1000);
        ms = time % 1000;

        return m + ':' + this.pad(s, 2) + '.' + this.pad(ms, 3);
    };

    this.update = function () {
        this.text.innerHTML = this.formattedTime();
    };
}

/////////////////////////////////////////////////////

dropFood = function () {
    do {
        var y = Math.floor(Math.random() * GRID_HEIGHT);
        var x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
        food.segment = new Segment(x, y);
    } while (foodTouchesSnake());
};

changeGameSpeed = function (speed) {
    clearInterval(game);
    gameSpeed = speed;
    if (speed != undefined) {
        game = setInterval(function () {
            snake.update()
        }, gameSpeed);
    }
};

foodTouchesSnake = function () {
    for (var i = 0; i < snake.segments.length; i++) {
        if (snake.segments[i].x === food.segment.x && snake.segments[i].y === food.segment.y) {
            return true;
        }
    }
    return false;
};
gameOver = function () {
    stopWatch.stop();
    changeGameSpeed(undefined);
    game_over.style.visibility = 'visible';
};

newGame = function () {
    clearScreen();
    score.innerHTML = gameScore = 0;
    snake = new Snake();
    dropFood();
    changeGameSpeed(INITIAL_GAME_SPEED);
    game_over.style.visibility = 'hidden';
    stopWatch.reset();
    stopWatch.start();
};

drawSquare = function (segment, color) {
    context.fillStyle = color;
    context.fillRect(segment.x * CELL_SIZE + CELL_PADDING, segment.y * CELL_SIZE + CELL_PADDING, CELL_SIZE - CELL_PADDING, CELL_SIZE - CELL_PADDING);
};

keyDown = function (e) {
    var key = e.keyCode ? e.keyCode : e.charCode;
    if (key === 32 && gameSpeed === undefined) {
        newGame();
    }
    snake.keyDown(e);
};

clearScreen = function () {
    context.fillStyle = COLOR_BGR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < GRID_HEIGHT; i++) {
        for (var j = xBorders[i]; j < GRID_WIDTH - xBorders[i]; j++) {
            drawSquare(new Segment(j, i), COLOR_BGR2);
        }
    }
};

calculateBorders = function () {
    var coef = GRID_WIDTH / GRID_HEIGHT;
    var radius = GRID_HEIGHT / 2;
    var adjacent;
    for (var i = 0; i < GRID_HEIGHT / 2; i++) {
        adjacent = radius - (i + 0.2);
        xBorders[i] = Math.round((radius - Math.sqrt((radius * radius - adjacent * adjacent))) * coef);
        xBorders[GRID_HEIGHT - (i + 1)] = xBorders[i];
    }
};

/////////////////////////////////////////////////////

var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var game_over = document.getElementById('game_over');
var score = document.getElementById('score');
var time = document.getElementById('time');
var CELL_SIZE = 10;
var CELL_PADDING = 1;
var GRID_WIDTH = 25;
var GRID_HEIGHT = 25;

var xBorders = [];
calculateBorders();

var COLOR_BGR = "#334467";
var COLOR_BGR2 = "#243048";
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

var snake;
var gameScore;
var stopWatch = new Stopwatch(time);
var food = new Blinker(undefined, undefined);
food.start();
var game;

newGame();