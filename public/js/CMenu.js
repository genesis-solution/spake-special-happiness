function CMenu() {
    var _pStartPosAudio;
    var _pStartPosPlay;
    var _pStartPosCredits;
    var _pStartPosFullscreen;
    
    var _oBg;
    var _oButPlay;
    var _oCreditsBut;
    var _oFade;
    var _oAudioToggle;
    var _oAnimMenu;
    var _oContainerMenuGUI;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var _endTime = null;

    this._init = function () {
        _oBg = CBackground(s_oStage);

        _oContainerMenuGUI = new createjs.Container();
        _oContainerMenuGUI.alpha = 0;
        s_oStage.addChild(_oContainerMenuGUI);

        // var oSprite = s_oSpriteLibrary.getSprite('but_play');
        // _pStartPosPlay = {x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 200};
        // _oButPlay = new CGfxButton(_pStartPosPlay.x, _pStartPosPlay.y, oSprite, _oContainerMenuGUI);
        // _oButPlay.addEventListener(ON_MOUSE_UP, this._onButPlayRelease, this);
        // _oButPlay.pulseAnimation();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: CANVAS_WIDTH - (oSprite.height / 2) - 10, y: (oSprite.height / 2) + 10};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, _oContainerMenuGUI);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
        }

        var oSpriteCredits = s_oSpriteLibrary.getSprite('but_info');
        _pStartPosCredits = {x: (oSpriteCredits.height / 2) + 10, y: (oSpriteCredits.height / 2) + 10};
        // _oCreditsBut = new CGfxButton((CANVAS_WIDTH / 2), CANVAS_HEIGHT - 240, oSpriteCredits, _oContainerMenuGUI);
        // _oCreditsBut.addEventListener(ON_MOUSE_UP, this._onCreditsBut, this);

        _oAnimMenu = new CAnimMenu(s_oStage);

        s_oStage.addChild(_oContainerMenuGUI);
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false){
            _fRequestFullScreen = false;
        }
        
        if (true){ // _fRequestFullScreen && screenfull.enabled
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            _pStartPosFullscreen = {x:_pStartPosCredits.x + oSprite.width/2 + 10,y:oSprite.height/2 + 10};

            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,_oContainerMenuGUI);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_TIME, createjs.Ease.cubicOut).call(function () {
            _oFade.visible = false;
        });

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);

        _endTime = Date.now() + 15 * 1000;
    };

    this.animContainerGUI = function () {
        createjs.Tween.get(_oContainerMenuGUI).to({alpha: 1}, 500, createjs.Ease.cubicOut);
    };

    this.refreshButtonPos = function (iNewX, iNewY) {
        // _oCreditsBut.setPosition(_pStartPosCredits.x + iNewX, iNewY + _pStartPosCredits.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosCredits.x + iNewX, iNewY + _pStartPosCredits.y); // (_pStartPosFullscreen.x + iNewX,_pStartPosFullscreen.y + iNewY);
        }
    };

    this.unload = function () {
        // _oButPlay.unload();
        // _oButPlay = null;

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }

        s_oStage.removeAllChildren();

        s_oMenu = null;
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onCreditsBut = function () {
        new CCreditsPanel();
    };

    this._onButPlayRelease = function () {
        _oFade.visible = true;

        createjs.Tween.get(_oFade).to({alpha: 1}, MS_FADE_TIME, createjs.Ease.cubicOut).call(function () {
           // s_oMenu.unload();
            s_oMain.gotoGame();
            $(s_oMain).trigger("start_session");
        });
    };
    
    this.resetFullscreenBut = function(){
	if (_fRequestFullScreen && screenfull.enabled){
		_oButFullscreen.setActive(s_bFullscreen);
	}
    };


    this._onFullscreenRelease = function(){
        if(s_bFullscreen) { 
		_fCancelFullScreen.call(window.document);
	}else{
		_fRequestFullScreen.call(window.document.documentElement);
	}
	
	sizeHandler();
    };

    this.update = function () {
        _oAnimMenu.update();

        var COUNT_OF_BOTS = 0;
        var savedCountOfBots = localStorage.getItem("bots");

        if (savedCountOfBots != undefined && savedCountOfBots != null) {
            COUNT_OF_BOTS = parseInt(savedCountOfBots);
        }

        if (_endTime != null && s_oMain.getGameState() != STATE_GAME && COUNT_OF_BOTS < 20) {
            (function frame(onJoinGameForBot, OWNER, _STATE_GAME) {
                // launch a few confetti from the left edge
                confetti({
                    particleCount: 15,
                    angle: 60,
                    spread: 180,
                    startVelocity: 150,
                    origin: { x: 0.5, y: 1 }
                });
    
                if (Date.now() > _endTime && OWNER == 0) {

                    localStorage.setItem("bots", COUNT_OF_BOTS + 1)

                    $.ajax({
                        url: '/bot/info',
                        type: 'GET',
                        data: {
                                't': localStorage.getItem('t'),
                                'gameID': 3,
                                betUsd: ME_SNAKE.betUsd
                            },
                        success: function(response) {
                            onJoinGameForBot(response, 1);
                        },
                        error: function(xhr, status, error) {
                            // Handle errors
                            
                            if (socket != null) {
                                socket.disconnect();
                            }
                            if (xhr.status === 400) {
                                redirectToWithAuth('https://www.player1.win/games/3/snakes', 'Token invalid', 0);
                            } else {
                                console.error('Error:', error);
                                // redirectToWithAuth('https://www.player1.win/games/3/snakes', 'Not found Bot', 0);
                            }
                        }
                    });   
                    
                }

            }(joinGameForBot, PLAYER, STATE_GAME));
        }
    };

    s_oMenu = this;

    this._init();
}

var s_oMenu = null;