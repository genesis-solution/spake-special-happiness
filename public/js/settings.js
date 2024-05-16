var CANVAS_WIDTH = 1360;
var CANVAS_HEIGHT = 768;

var CANVAS_WIDTH_HALF = CANVAS_WIDTH * 0.5;
var CANVAS_HEIGHT_HALF = CANVAS_HEIGHT * 0.5;

var EDGEBOARD_X = 175;
var EDGEBOARD_Y = 90;

var DISABLE_SOUND_MOBILE = false;
var FONT_GAME = "palamecia_titlingregular";

var FPS = 100;

var FPS_TIME = 1 / FPS;

var SNAKE_TYPES = 5;

var FRAMES_NUM_HELP = [null, 16, 17, 22];

var BUFFER_ANIM_MONITOR = [null, 80, 80, 80];

var PLAYER = 0;
var ENEMY_SNAKES = [];

var AI_PLAYER = 0;
var AI_FOODS = 1;

var COLLISION_OFFSET_FOOD = [{x: -20, y: -10}];

var REG_FOOD_OFFSET = [{x: -12, y: 0}];

var OPEN_MOUNTH_DISTANCE_RATE = 2;
var MOUNTH_OFFSET_DETECT = -50;
var EATEN_OFFSET_DETECT = -30;

var SNAKES_TOKEN_RADIUS_FOOD_DETECT = 10;

var STATE_LOADING = 0;
var STATE_MENU = 1;
var STATE_HELP = 1;
var STATE_GAME = 3;

var STATE_INIT = 0;
var STATE_PLAY = 1;
var STATE_FINISH = 2;

var ON_MOUSE_DOWN = 0;
var ON_MOUSE_UP = 1;
var ON_MOUSE_OVER = 2;
var ON_MOUSE_OUT = 3;
var ON_DRAG_START = 4;
var ON_DRAG_END = 5;

var MENU_SNAKES_VELOCITY = 10;

var MENU_SNAKE_GOOD_ROTATION = 9;
var MENU_SNAKE_BAD_ROTATION = 5;

var MENU_SNAKE_GOOD_TIME_ROTATION = 150;
var MENU_SNAKE_BAD_TIME_ROTATION = 150;

var MENU_BAD_SNAKE_DELAY = 1500;

var WIDTH_OF_HORIZONTAL_RECT = 130;
var HEIGHT_OF_HORIZONTAL_RECT = 50;

var WIDTH_OF_VERTICAL_RECT = 60;
var HEIGHT_OF_VERTICAL_RECT = 320;

var MAX_AI_FOLLOW_PLAYER = 1;

var EATEN_FOOD_SNAKE_INTERVAL = 100;

var EDGES_PROPERTIES = {x: 0, y: 0, h: 2, w: 3, xMax: 0, yMax: 0};

var SCROLL_LIMIT = {xMin: -1712, yMin: -1330, xMax: 0, yMax: 0};

var PLAYER_CAMERA_OFFSET = {x: 680, y: 384};

var SPAWN_FOODS_RANGE = {xMin: EDGES_PROPERTIES.x + EDGEBOARD_X, yMin: EDGES_PROPERTIES.y + EDGEBOARD_Y, xMax: 2048, yMax: 1024};

var FIELD_SECTION_SUBDIVISION = {w: 5, h: 2, tot: 10}; //TOTAL SUBDIVIDIDED WITH FOOD  

var FOODS_OCCURRENCE = [100];

var MAX_FOODS_INSTANCE = 100;

var FOOD_STATE = [4];

var MS_TIME_SHOW_WIN_PANEL = 1000;

var WAIT_TIME_UPDATE_POS_QUEUE = 30;

var MS_DECREASE_TIME_EATEN_QUEUE = 250;

var LERP_RATE = 0.03;

var DISTANCE_SINGLE_QUEUE = 4;
var REG_Y_OFFSET_QUEUE = -36;

var INTERVAL_SPAWN_FOOD = 500;

var MS_FADE_TIME = 250;

var TIME_FOOD_SPAWN_ANIM = 1000;

var WAIT_TIME_SPAWN_QUEUE = 250;

var TIME_SPAWN_QUEUE = 1000;

var TIME_EATEN_EFFECT = 250;

var MAXT_TIME_WAIT_FOOD_SPAWN_ANIM = 250;

var MAX_AI_QUEUE_LENGTH = 5000;

var SINGLE_QUEUE_RADIUS = 14;

var VERTICAL_RECT_STYLE_BLOCK;
var HORIZONTAL_RECT_STYLE_BLOCK;

var MAX_SECOND_FOR_ANIM_VERTICAL_RECT = 10;

var DISPLAY_SHOCK_X = 30;
var DISPLAY_SHOCK_Y = 50;

var DISTANCE_AI_DETECT_FOOD = 500;

var AI_ANGLE_DETECT_FOODS = 30 * (Math.PI / 180);

var COLLISION_DISTANCE_AI_PLAYER_FACTOR = 100;

var AI_TIME_CHANGE_DIR = {min: 2000, max: 5000};

var AI_TIME_IGNORE_PLAYER = 1000;

var AI_WAIT_TIME_FOR_CHANGE_DIR = {min: 250, max: 1000};

var AI_SMALL_TIME_CHANGE_DIR = {min: 0, max: 1};
var AI_SMALL_WAIT_TIME_FOR_CHANGE_DIR = {min: 0, max: 1};

var CAN_PLAYER_EATEN_ENEMY = false;

var SHOW_COLLISION_SHAPE = false;

var SHOW_FIELD_OF_VIEW = false;

var SHOW_FOODS_ID = false;

var SHOW_SECTION_SHAPE = false;

var ALLOW_SPEED_UP = false;

var HERO_START_X = 1511;
var HERO_START_Y = 1024;

var ME_SNAKE = {
    type: 0, 
    x: 0, y: 0, 
    time_follow: 0, name: 'me', country: 'Israel', 
    score: 1, 
    die: false, 
    username: '',  
    CountryName: '', 
    TokenId: '', 
    betUsd: 1, 
    entityId: '', 
    Status: 0,
    games_entryID: '',
    prizeUSD: 0,
    isBot: 0
};
var AI_SNAKES = [];
var TOTAL_PLAYERS = 1;
// var ENEMY_POSITIONS = [
//     { x: 1511, y: 1024 },
//     { x: 500, y: 500 },
//     { x: 2762, y: 500 },
//     { x: 500, y: 1798 },
//     { x: 2762, y: 1798 },
//     { x: 1756, y: 1274 }
// ]

var ENEMY_POSITIONS = [
    { x: 788, y: 1024 },
    { x: 1182, y: 1024 },
    { x: 1576, y: 1024 },
    { x: 1970, y: 1024 },
    { x: 2364, y: 1024 },
    { x: 394, y: 1024 }
]

var HERO_ACCELLERATION;

var MAX_HERO_SPEED;
var ENABLE_FULLSCREEN;
var ENABLE_CHECK_ORIENTATION;

var MAX_TIMER = 600000;
var START_DATE;
var LAST_UPDATE_TIME = new Date();
var LAST_AI_UPDATE_TIME = new Date();

var MAX_SOCKET_ELAPS = 100;
var MAX_SUB_SOCKET_ELAPS = 100;

/*!
 * 
 * CANVAS MISC FUNCTIONS
 * 
 */
function centerReg(obj){
    if (obj != null && obj.image != null) {
        obj.regX=obj.image.naturalWidth/2;
	    obj.regY=obj.image.naturalHeight/2;
    }
}

function createHitarea(obj){
    if (obj != null && obj.image != null) {
        obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));	
    }
}

function randomFromTo(from, to) {
	return Math.floor(Math.random() * (to - from + 1) + from);
}
var _maxConfettis = 150;
function confettiParticle(context, possibleColors) {
    this.x = randomFromTo(0, Math.random() * CANVAS_WIDTH * 2); // x
    this.y = Math.random() * CANVAS_HEIGHT - CANVAS_HEIGHT; // y
    this.r = randomFromTo(11, 33); // radius
    this.d = Math.random() * _maxConfettis + 11;
    this.color =
      possibleColors[Math.floor(Math.random() * possibleColors.length)];
    this.tilt = Math.floor(Math.random() * 33) - 11;
    this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
    this.tiltAngle = 0;
  
    this.draw = function() {
        context.beginPath();
        context.lineWidth = this.r / 2;
        context.strokeStyle = this.color;
        context.moveTo(this.x + this.tilt + this.r / 3, this.y);
        context.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 5);
        return context.stroke();
    };
}
let particles = [];
function Draw() {
    const results = [];
  
    // Magical recursive functional love
    requestAnimationFrame(Draw);
  
    //context.clearRect(0, 0, windowW, window.innerHeight);
  
    for (var i = 0; i < particles.length; i++) {
        results.push(particles[i].draw());    
    }
  
    let particle = {};
    let remainingFlakes = 0;
    for (var i = 0; i < particles.length; i++) {
      particle = particles[i];
  
      particle.tiltAngle += particle.tiltAngleIncremental;
      particle.y += (Math.cos(particle.d) + 3 + particle.r / 2) / 2;
      particle.tilt = Math.sin(particle.tiltAngle - i / 3) * 15;
  
      if (particle.y <= CANVAS_HEIGHT) remainingFlakes++;
  
      // If a confetti has fluttered out of view,
      // bring it back to above the viewport and let if re-fall.
      if (particle.x > CANVAS_WIDTH * 2 + 20 || particle.x < -20 || particle.y > CANVAS_HEIGHT) {
        particle.x = Math.random() * CANVAS_WIDTH * 2;
        particle.y = -20;
        particle.tilt = Math.floor(Math.random() * 10) - 20;
      }
    }
  
    return results;
}

var shareTitle = 'Highscore on Play Checkers is [SCORE]';//social share score title
var shareMessage = 'I just won $[SCORE] on player1.win, Let’s play Connect Four with real money bets! Are you in? Join now.'; //social share score message

function gtag(){dataLayer.push(arguments);}

function share(action){
	gtag('event','click',{'event_category':'share','event_label':action});
	window.dataLayer = window.dataLayer || [];

	var loc = 'https://www.player1.win/games/3/snakes'//location.href

	var curr_loc = location.href
	curr_loc = curr_loc.substring(0, curr_loc.lastIndexOf("/") + 1);
	
	var title = '';
	var text = '';

	var prizeUSD = 0;

	if (ME_SNAKE.betUsd != null && parseInt(ME_SNAKE.betUsd) > 0)
	{
		prizeUSD = parseInt(ME_SNAKE.betUsd);
	}
	
	title = shareTitle.replace("[SCORE]", prizeUSD);
	text = shareMessage.replace("[SCORE]", prizeUSD);
	
	var shareurl = '';
	
	if( action == 'tiktok' ) {
		shareurl = 'https://www.tiktok.com/@exampleuser/video/1234567890123456789?text=' + encodeURIComponent(text) + " " + encodeURIComponent(loc);
	}else if( action == 'facebook' ){
		shareurl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(curr_loc+'share?desc='+text+'&title='+title+'&url='+loc+'&thumb='+loc+'share.jpg&width=590&height=300');
	}else if( action == 'google' ){
		shareurl = 'https://plus.google.com/share?url='+loc;
	}else if( action == 'whatsapp' ) {
		shareurl = "whatsapp://send?text=" + encodeURIComponent(text) + " " + encodeURIComponent(loc);
	}
	
	window.open(shareurl);
}

var ROOMNAME;
let socket;
function createSocket() {
    socket = io();

    socket.on('joinedRoom', (roomName) => {
		ROOMNAME = roomName
	});
}

function joinGame(isBot) {
    if (socket != null && ME_SNAKE.username != '')
	{
        socket.emit('joinGame', {playerName: ME_SNAKE.username, player: ME_SNAKE, isBot: isBot});
    }
}

function joinGameForBot(data, isBot) {
    if (socket != null && data.username != '')
	{
        socket.emit('joinGameForBot', {playerName: data.username, player: data, isBot: isBot});
    }
}

function redirectToWithAuth(url, authToken, noError) {
    var form = document.createElement('form');
    form.method = 'GET';
    form.action = url;

    var headerInput = document.createElement('input');
    headerInput.type = 'hidden';

    if (noError == 1)
    {
        headerInput.name = 't';
    } else {
        headerInput.name = 'e';
    }
    headerInput.value = authToken; 
    form.appendChild(headerInput);
    document.body.appendChild(form);
    form.submit();
}


function compareArrays(arr1, arr2) {
    // Check lengths
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Iterate through elements of arr1
    for (let i = 0; i < arr1.length; i++) {
        const obj1 = arr1[i];
        const obj2 = arr2[i];
        
        // Compare properties of objects
        if (!isEqual(obj1, obj2)) {
            return false;
        }
    }

    // If all elements match, arrays are equal
    return true;
}

// Define a custom equality check function
function isEqual(obj1, obj2) {
    // Define your custom comparison logic here
    // For example, compare properties of objects
    return obj1.country === obj2.country && obj1.name === obj2.name && obj1.score === obj2.score && obj1.die === obj2.die;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}