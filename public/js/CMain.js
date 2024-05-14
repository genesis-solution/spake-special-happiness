function CMain(oData) {
    var _bUpdate;
    var _iCurResource = 0;
    var RESOURCE_TO_LOAD = 0;
    var _iState = STATE_LOADING;
    var _oData;

    var _oPreloader;
    var _oMenu;
    var _oHelp;
    var _oGame;

    this.initContainer = function () {
        var canvas = document.getElementById("canvas");
        s_oStage = new createjs.Stage(canvas);
        createjs.Touch.enable(s_oStage);
        s_oStage.preventSelection = false;

        s_bMobile = jQuery.browser.mobile;
        if (s_bMobile === false) {
            s_oStage.enableMouseOver(20);
            $('body').on('contextmenu', '#canvas', function (e) {
                return false;
            });
        }

        s_iPrevTime = new Date().getTime();

        createjs.Ticker.addEventListener("tick", this._update);
        createjs.Ticker.framerate = FPS;

        if (navigator.userAgent.match(/Windows Phone/i)) {
            DISABLE_SOUND_MOBILE = true;
        }

        s_oSpriteLibrary = new CSpriteLibrary();

        //ADD PRELOADER
        _oPreloader = new CPreloader();

        _bUpdate = true;
    };

    this.soundLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        _oPreloader.refreshLoader(iPerc);
    };
    
    this._initSounds = function(){
        Howler.mute(!s_bAudioActive);
        
        s_aSoundsInfo = new Array();
        s_aSoundsInfo.push({path: './sounds/',filename:'snake_eating',loop:false,volume:1, ingamename: 'snake_eating'});
        s_aSoundsInfo.push({path: './sounds/',filename:'click',loop:false,volume:1, ingamename: 'click'});
        s_aSoundsInfo.push({path: './sounds/',filename:'game_over',loop:false,volume:1, ingamename: 'game_over'});
        s_aSoundsInfo.push({path: './sounds/',filename:'snake_follow',loop:false,volume:1, ingamename: 'snake_follow'});
        s_aSoundsInfo.push({path: './sounds/',filename:'scream',loop:false,volume:1, ingamename: 'scream'});
        s_aSoundsInfo.push({path: './sounds/',filename:'soundtrack',loop:true,volume:1, ingamename: 'soundtrack'});
        
        RESOURCE_TO_LOAD += s_aSoundsInfo.length;

        s_aSounds = new Array();
        for(var i=0; i<s_aSoundsInfo.length; i++){
            this.tryToLoadSound(s_aSoundsInfo[i], false);
        }
        
    };  
    
    this.tryToLoadSound = function(oSoundInfo, bDelay){
        
       setTimeout(function(){        
            s_aSounds[oSoundInfo.ingamename] = new Howl({ 
                src: [oSoundInfo.path+oSoundInfo.filename+'.mp3'],
                autoplay: false,
                preload: true,
                loop: oSoundInfo.loop, 
                volume: oSoundInfo.volume,
                onload: s_oMain.soundLoaded,
                onloaderror: function(szId,szMsg){
                                    for(var i=0; i < s_aSoundsInfo.length; i++){
                                            if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                s_oMain.tryToLoadSound(s_aSoundsInfo[i], true);
                                                break;
                                            }
                                    }
                            },
                onplayerror: function(szId) {
                    for(var i=0; i < s_aSoundsInfo.length; i++){
                                            if ( szId === s_aSounds[s_aSoundsInfo[i].ingamename]._sounds[0]._id){
                                                s_aSounds[s_aSoundsInfo[i].ingamename].once('unlock', function() {
                                                s_aSounds[s_aSoundsInfo[i].ingamename].play();
                                                });
                                                break;
                                            }
                                        }
                            
                } 
            });

            
        }, (bDelay ? 200 : 0) );
        
        
    };
    
    this._loadImages = function () {
        s_oSpriteLibrary.init(this._onImagesLoaded, this._onAllImagesLoaded, this);

        s_oSpriteLibrary.addSprite("but_play", "./sprites/but_play.png");
        s_oSpriteLibrary.addSprite("but_exit", "./sprites/but_exit.png");
        s_oSpriteLibrary.addSprite("msg_box", "./sprites/msg_box.png");
        s_oSpriteLibrary.addSprite("bg_help", "./sprites/bg_help.png");
        s_oSpriteLibrary.addSprite("audio_icon", "./sprites/audio_icon.png");
        s_oSpriteLibrary.addSprite("arrow", "./sprites/arrow.png");
        s_oSpriteLibrary.addSprite("but_home", "./sprites/but_home.png");
        s_oSpriteLibrary.addSprite("but_restart", "./sprites/but_restart.png");
        s_oSpriteLibrary.addSprite("bg_game", "./sprites/bg_game.jpg");
        s_oSpriteLibrary.addSprite("food_0", "./sprites/food_0.png");
        s_oSpriteLibrary.addSprite("but_pause", "./sprites/but_pause.png");
        s_oSpriteLibrary.addSprite("but_continue", "./sprites/but_continue.png");
        s_oSpriteLibrary.addSprite("but_yes", "./sprites/but_yes.png");
        s_oSpriteLibrary.addSprite("but_not", "./sprites/but_not.png");
        s_oSpriteLibrary.addSprite("but_info", "./sprites/but_info.png");
        s_oSpriteLibrary.addSprite("logo_ctl", "./sprites/logo_ctl.png");

        s_oSpriteLibrary.addSprite("arrow_key", "./sprites/arrow_key.png");

        s_oSpriteLibrary.addSprite("edge_side_lr", "./sprites/edge_side_lr.png");
        s_oSpriteLibrary.addSprite("edge_side_ud", "./sprites/edge_side_ud.png");

        s_oSpriteLibrary.addSprite("logo", "./sprites/logo.png");
		s_oSpriteLibrary.addSprite("but_fullscreen", "./sprites/but_fullscreen.png");

        s_oSpriteLibrary.addSprite("buttonFacebook", "./sprites/button_facebook.png");
        s_oSpriteLibrary.addSprite("buttonTwitter", "./sprites/button_twitter.png");
        s_oSpriteLibrary.addSprite("buttonWhatsapp", "./sprites/button_whatsapp.png");
        s_oSpriteLibrary.addSprite("buttonTiktok", "./sprites/button_tiktok.png");
        s_oSpriteLibrary.addSprite("buttonContinue", "./sprites/button_continue.png");
        s_oSpriteLibrary.addSprite("itemPop", "./sprites/item_pop.png");
        s_oSpriteLibrary.addSprite("itemPopP", "./sprites/item_pop_p.png");
        s_oSpriteLibrary.addSprite("buttonConfirm", "./sprites/button_confirm.png");
        s_oSpriteLibrary.addSprite("buttonCancel", "./sprites/button_cancel.png");

        for (var j = 1; j < 4; j++) {
            for (var i = 0; i < FRAMES_NUM_HELP[j]; i++) {
                s_oSpriteLibrary.addSprite("help_" + j + "_" + i, "./sprites/help_" + j + "/help_" + j + "_" + i + ".jpg");
            }
        }

        for (var i = 0; i < SNAKE_TYPES; i++) {
            s_oSpriteLibrary.addSprite("snake_head_" + i, "./sprites/snake_head_" + i + ".png");
            s_oSpriteLibrary.addSprite("snake_parts_" + i, "./sprites/snake_parts_" + i + ".png");
        }
        RESOURCE_TO_LOAD += s_oSpriteLibrary.getNumSprites();
        s_oSpriteLibrary.loadSprites();
    };

    this._onImagesLoaded = function () {
        _iCurResource++;
        var iPerc = Math.floor(_iCurResource / RESOURCE_TO_LOAD * 100);
        _oPreloader.refreshLoader(iPerc);
    };

    this._onAllImagesLoaded = function () {

    };

    this.preloaderReady = function () {
        this._loadImages();
        
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            this._initSounds();
        }

        
        _bUpdate = true;
    };
    
    this._onRemovePreloader = function(){
        _oPreloader.unload();

        s_oSoundTrack = playSound("soundtrack", 1, true);

        this.gotoMenu();
    };

    this.gotoMenu = function () {
        _oMenu = new CMenu();
        _iState = STATE_MENU;

        if (socket == null) {

            createSocket();

            socket.on('startGamebySocket', (_players, TOTAL_PLAYER_COUNT) => {
                var players = _players[0];

                if (players != null && players.length > 0) {
                    TOTAL_PLAYERS = TOTAL_PLAYER_COUNT

                    ENEMY_SNAKES = [];
                    AI_SNAKES = [];
                    for (let index = 0; index < players.length; index++) {
                        
                        if (players[index].entityId == ME_SNAKE.entityId) {
                            PLAYER = index;
                            ME_SNAKE.type = index;
                            ME_SNAKE.isBot = 0;
                            ME_SNAKE.games_entryID = players[index].games_entryID;
                            ME_SNAKE.prizeUSD = players[index].prizeUSD;
                            ME_SNAKE.x = ENEMY_POSITIONS[index].x;
                            ME_SNAKE.y = ENEMY_POSITIONS[index].y;
                        }
                        else {

                            AI_SNAKES.push(
                                { 
                                    type: index, 
                                    x: ENEMY_POSITIONS[index].x, y: ENEMY_POSITIONS[index].y, 
                                    time_follow: 1, 
                                    name: players[index].username, 
                                    country: players[index].CountryName, 
                                    score: 1, die: false, 
                                    username: players[index].username,  
                                    CountryName: players[index].CountryName, 
                                    TokenId: players[index].TokenId, 
                                    betUsd: players[index].betUsd, 
                                    entityId: players[index].entityId, 
                                    Status: players[index].Status,
                                    isBot: players[index].isBot
                                }
                            )
                            ENEMY_SNAKES.push(index);
                        }
                    }
                    
                    _oMenu._onButPlayRelease();
                }

            });
        
            socket.on('nameTaken', () => {
                redirectToWithAuth('/login', "You are already playing", "");
            });

            socket.on('userPosition', (userPos) => {
                if (userPos == true)
                    PLAYER = 0;
                else
                    PLAYER = -1;
            })

        }

        if (_oData != null && _oData.data != null && _oData.data != undefined) {
            ME_SNAKE.name = _oData.data.username;
            ME_SNAKE.username = _oData.data.username;
            ME_SNAKE.country = _oData.data.CountryName;
            ME_SNAKE.CountryName = _oData.data.CountryName;
            ME_SNAKE.TokenId = _oData.data.TokenId;
            ME_SNAKE.betUsd = _oData.data.betUsd;
            ME_SNAKE.entityId = _oData.data.entityId;
            ME_SNAKE.Status = _oData.data.Status;

            joinGame(0);
        }
    };

    this.gotoGame = function () {
        _oGame = new CGame(_oData);
        
        setTimeout(() => {
            _iState = STATE_GAME;
        }, 500);
    };

    this.gotoHelp = function () {
        _oHelp = new CHelp();
        _iState = STATE_HELP;
    };

    this.getGameState = function () {
        return _iState;
    }

    this.stopUpdate = function(){
        _bUpdate = false;
        createjs.Ticker.paused = true;
        $("#block_game").css("display","block");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            Howler.mute(true);
        }
        
    };

    this.startUpdate = function(){
        s_iPrevTime = new Date().getTime();
        _bUpdate = true;
        createjs.Ticker.paused = false;
        $("#block_game").css("display","none");
        
        if(DISABLE_SOUND_MOBILE === false || s_bMobile === false){
            if(s_bAudioActive){
                Howler.mute(false);
            }
        }
        
    };

    this._update = function (event) {
        if (_bUpdate === false) {
            return;
        }
        var iCurTime = new Date().getTime();
        s_iTimeElaps = iCurTime - s_iPrevTime;
        s_iCntTime += s_iTimeElaps;
        s_iCntFps++;
        s_iPrevTime = iCurTime;

        if (s_iCntTime >= 1000) {
            s_iCurFps = s_iCntFps;
            s_iCntTime -= 1000;
            s_iCntFps = 0;
        }

        if (_iState === STATE_GAME) {
            _oGame.update();
        } else if (_iState === STATE_MENU) {
            _oMenu.update();
        }
        s_oStage.update(event);
    };

    s_oMain = this;

    _oData = oData;
    ENABLE_CHECK_ORIENTATION = oData.check_orientation;
    ENABLE_FULLSCREEN = oData.fullscreen;

    this.initContainer();
}
var s_bMobile;
var s_bAudioActive = false;
var s_iCntTime = 0;
var s_iTimeElaps = 0;
var s_iPrevTime = 0;
var s_iCntFps = 0;
var s_iCurFps = 0;
var s_iSpeedBlock;

var s_oDrawLayer;
var s_oStage;
var s_oScrollStage;
var s_oMain;
var s_oSpriteLibrary;
var s_oSoundTrack = null;
var s_bFullscreen = false;
var s_aSounds;
var s_aSoundsInfo;