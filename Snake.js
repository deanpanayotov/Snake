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
        var y;
        if (this.dirY == 1) {
            y = INITIAL_SEGMENT_COUNT - 1 + Math.floor(Math.random() * (GRID_HEIGHT - (INITIAL_SEGMENT_COUNT - 1)));
        } else if (this.dirY == -1) {
            y = Math.floor(Math.random() * (GRID_HEIGHT - (INITIAL_SEGMENT_COUNT - 1)));
        } else {
            y = Math.floor(Math.random() * GRID_HEIGHT);
        }
        var x;
        if (this.dirX == 1) {
            x = xBorders[y] + INITIAL_SEGMENT_COUNT - 1 + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2 - INITIAL_SEGMENT_COUNT));
        } else if (this.dirX == -1) {
            x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2 - INITIAL_SEGMENT_COUNT));
        } else if (this.dirY == 1) {
            if (y >= GRID_HEIGHT / 2 + INITIAL_SEGMENT_COUNT / 2) {
                x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
            } else {
                x = xBorders[y - (INITIAL_SEGMENT_COUNT - 1)] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y - (INITIAL_SEGMENT_COUNT - 1)] * 2));
            }
        } else {
            if (y <= GRID_HEIGHT / 2 - INITIAL_SEGMENT_COUNT / 2) {
                x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
            } else {
                x = xBorders[y + (INITIAL_SEGMENT_COUNT - 1)] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y + (INITIAL_SEGMENT_COUNT - 1)] * 2));
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
            drawSquare(segment, COLOR_FRGR.color);
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
                var tail = this.segments.pop();
                drawSquare(tail, bgrColors[tail.y][tail.x].color);
            }
            this.segments.unshift(head);
            drawSquare(this.segments[0], this.generateHeadColor().color);
            this.prevDirX = this.dirX;
            this.prevDirY = this.dirY;
        }
    };

    this.generateHeadColor = function () {
        var distX = Math.abs(this.segments[0].x - food.segment.x), distY = Math.abs(this.segments[0].y - food.segment.y);
        var distance = (distX < COLORING_DISTANCE && distY < COLORING_DISTANCE) ? Math.max(distX, distY) : COLORING_DISTANCE;
        if (distance < COLORING_DISTANCE) {
            return new Color(this.hue, 100, Math.round(100 - (50 / (COLORING_DISTANCE - 1) * (COLORING_DISTANCE - distance))));
        } else {
            var h = COLOR_FRGR.h + Math.round(Math.random() * COLOR_FRGR_DEVIATION.h);
            var s = COLOR_FRGR.s + Math.round(Math.random() * COLOR_FRGR_DEVIATION.s);
            var l = COLOR_FRGR.l + Math.round(Math.random() * COLOR_FRGR_DEVIATION.l);
            return new Color(h, s, l);
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

function Blinker(segment, steps) {
    this.blinkTime = DEFAULT_BLINK_TIME;
    if (segment) {
        this.setSegment(segment);
    }
    this.steps = steps;
    this.setSegment = function (segment) {
        this.segment = segment;
        this.bgrColor = bgrColors[this.segment.y][this.segment.x];
        this.variations = generateVariations(this.bgrColor, COLOR_FRGR, this.steps, true);
        this.val = 0;
        this.dir = 1;
    };
    this.blink = function () {
        if (this.segment) {
            this.val += this.dir;
            drawSquare(this.segment, this.variations[this.val].color);
            if ((this.val == this.steps - 1 ) || (this.val == 0)) {
                this.dir *= -1;
            }
        }
//        if (this.color === COLOR_FRGR.color)
//            this.color = bgrColors[this.segment.y][this.segment.x];
//        else
//            this.color = COLOR_FRGR.color;
//        if (this.segment) {
//            drawSquare(this.segment, this.color);
//        }
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

Color = function (h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
    this.color = "hsl(" + h + "," + s + "%," + l + "%)";
};

/////////////////////////////////////////////////////

dropFood = function () {
    do {
        var y = Math.floor(Math.random() * GRID_HEIGHT);
        var x = xBorders[y] + Math.floor(Math.random() * (GRID_WIDTH - xBorders[y] * 2));
        food.setSegment(new Segment(x, y));
    } while (foodTouchesSnake());
    snake.hue = Math.round(Math.random() * 360);
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
    context.fillStyle = COLOR_BGR.color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < GRID_HEIGHT; i++) {
        for (var j = xBorders[i]; j < GRID_WIDTH - xBorders[i]; j++) {
            drawSquare(new Segment(j, i), bgrColors[i][j].color);
        }
    }
};

calculateBorders = function () {
    var radius = GRID_HEIGHT / 2;
    var adjacent;
    var xBorders = [];
    for (var i = 0; i < GRID_HEIGHT / 2; i++) {
        adjacent = radius - (i + 0.2);
        xBorders[i] = Math.round((radius - Math.sqrt((radius * radius - adjacent * adjacent))) * (GRID_WIDTH / GRID_HEIGHT));
        xBorders[GRID_HEIGHT - (i + 1)] = xBorders[i];
    }
    return xBorders;
};


generateColors = function () {
    var cEdge = calculateEdge();
    var variations = generateVariations(COLOR_BGR3, COLOR_BGR, cEdge + 1, false);
    var edge;
    var colors = [];
    for (var i = 0; i < GRID_HEIGHT; i++) {
        colors[i] = [];
        edge = xBorders[i] + cEdge;
        for (var j = xBorders[i]; j < GRID_WIDTH - xBorders[i]; j++) {
            if (
                (i < cEdge || i >= GRID_HEIGHT - cEdge) &&
                    (
                        ((j >= xBorders[i] +
                            ((i > GRID_HEIGHT / 2) ? (GRID_HEIGHT - i - 1) : i)))
                            &&
                            ((j < GRID_WIDTH - xBorders[i] -
                                ((i > GRID_HEIGHT / 2) ? (GRID_HEIGHT - i - 1) : i)))
                        )
                ) {
                colors[i][j] = variations[(i > GRID_HEIGHT / 2 ? GRID_HEIGHT - i - 1 : i)];
            } else {
                if (j < edge || j >= GRID_WIDTH - edge) {
                    colors[i][j] = variations[(j > GRID_WIDTH / 2 ? GRID_WIDTH - j - 1 : j) - xBorders[i]];
                } else {
                    colors[i][j] = COLOR_BGR2;
                }
            }
        }
    }
    return colors
};

generateVariations = function (color1, color2, steps, includeSecond) {
    var variations = [];
    var color3 = new Color((color2.h - color1.h) / steps, (color2.s - color1.s) / steps, (color2.l - color1.l) / steps);
    for (var i = 0; i < steps + (includeSecond ? 1 : 0 ); i++) {
        variations[i] = new Color(color1.h + Math.round(color3.h * i), color1.s + Math.round(color3.s * i), color1.l + Math.round(color3.l * i));
    }
    return variations;
};

calculateEdge = function () {
    return Math.round(Math.max(GRID_WIDTH, GRID_HEIGHT) / 4);
};

averageColor = function (color1, color2, percentage) {
    return new Color(
        Math.round(color1.h - (color1.h - color2.h) * percentage),
        Math.round(color1.s - (color1.s - color2.s) * percentage),
        Math.round(color1.l - (color1.l - color2.l) * percentage)
    );
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

var xBorders = calculateBorders();

var COLOR_BGR = new Color(220, 34, 30); //#334467
var COLOR_BGR2 = new Color(220, 34, 30); //#243048
var COLOR_BGR3 = new Color(220, 20, 20);
var COLOR_FRGR = new Color(180, 100, 100); //white
var COLOR_FRGR_DEVIATION = new Color(10, 10, 10);


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

var INITIAL_GAME_SPEED = 130;
var GAME_SPEED_STEP = 0.05;
var MIN_GAME_SPEED = 20;
var DEFAULT_BLINK_TIME = 80;
var COLORING_DISTANCE = 6;

var gameSpeed = INITIAL_GAME_SPEED;

canvas.width = CELL_SIZE * GRID_WIDTH;
canvas.height = CELL_SIZE * GRID_HEIGHT;

var snake;
var gameScore;
var stopWatch = new Stopwatch(time, 100);
var food = new Blinker(undefined, 10);
var bgrColors = generateColors();
food.start();
var game;

newGame();