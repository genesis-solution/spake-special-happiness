function CInterface() {
    var _pStartPosAudio;
    var _pStartPosExit;
    var _pStartPosScore;
    var _pStartPosBest;
    var _pStartPosPause;
    var _pStartPosArrowLeft;
    var _pStartPosArrowRight;
    var _pStartPosFullscreen;
    
    var _oButExit;
    var _oButPause;
    var _oScoreText;
    var _oBestScoreText;
    var _oHelpPanel;
    var _oAudioToggle;
    var _oArrowLeft;
    var _oArrowRight;
    var _oPause;
    var _oEndPanel;
    var _oButFullscreen;
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    var confirmContainer;
    var canvasContainer;
    var canvas1 = document.getElementById("canvas");
    var context = canvas1.getContext("2d");
    var possibleColors = [
        "DodgerBlue",
        "OliveDrab",
        "Gold",
        "Pink",
        "SlateBlue",
        "LightBlue",
        "Gold",
        "Violet",
        "PaleGreen",
        "SteelBlue",
        "SandyBrown",
        "Chocolate",
        "Crimson"
      ];
    
    var maxConfettis = 150;

    this._init = function () {

        _pStartPosScore = {x: (CANVAS_WIDTH / 2) - 50, y: 55};
        _oScoreText = new createjs.Text(TEXT_SCORE + ": 0", "32px " + FONT_GAME, "#ffffff");
        _oScoreText.x = _pStartPosScore.x;
        _oScoreText.y = _pStartPosScore.y;
        _oScoreText.textAlign = "left";
        _oScoreText.regY = _oScoreText.getBounds().height * 0.5;
        s_oStage.addChild(_oScoreText);

        _pStartPosBest = {x: (CANVAS_WIDTH / 2) - 600, y: 45};
        _oBestScoreText = new createjs.Text(TEXT_BEST_SCORE + ": 0", "32px " + FONT_GAME, "#ffffff");
        _oBestScoreText.x = _pStartPosBest.x;
        _oBestScoreText.y = _pStartPosBest.y;
        _oBestScoreText.visible = false;
        _oBestScoreText.textAlign = "left";

        _oTimerText = new createjs.Text("10:00", "26px " + FONT_GAME, "#ffffff");
        _oTimerText.x = _pStartPosBest.x;
        _oTimerText.y = _pStartPosBest.y;
        _oTimerText.textAlign = "center";
        s_oStage.addChild(_oTimerText);

        _oBestScoreText.regX = _oBestScoreText.getBounds().width * 0.5;
        _oBestScoreText.regY = _oBestScoreText.getBounds().height * 0.5;
        s_oStage.addChild(_oBestScoreText);

        // Added by Sup man
        _userListContainer = new createjs.Container();
        _userListContainer.x = _pStartPosBest.x;
        _userListContainer.y = _pStartPosBest.y + 30;
        _userListContainer.textAlign = "left";
        s_oStage.addChild(_userListContainer);

        var oSprite = s_oSpriteLibrary.getSprite('but_exit');
        _pStartPosExit = {x: CANVAS_WIDTH - (oSprite.height / 2) - 20, y: (oSprite.height / 2) + 20};
        _oButExit = new CGfxButton(_pStartPosExit.x, _pStartPosExit.y, oSprite, s_oStage);
        _oButExit.addEventListener(ON_MOUSE_UP, this._onExit, this);

        var oSprite = s_oSpriteLibrary.getSprite('but_pause');
        _pStartPosPause = {x: _pStartPosExit.x - oSprite.height - 20, y: _pStartPosExit.y};

        _oButPause = new CGfxButton(_pStartPosPause.x, _pStartPosPause.y, oSprite, s_oStage);
        _oButPause.addEventListener(ON_MOUSE_UP, this._onPause, this);

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            var oSprite = s_oSpriteLibrary.getSprite('audio_icon');
            _pStartPosAudio = {x: _pStartPosExit.x - oSprite.height - 20, y: _pStartPosExit.y};
            // _pStartPosAudio = {x: _pStartPosPause.x - oSprite.height - 20, y: _pStartPosExit.y};
            _oAudioToggle = new CToggle(_pStartPosAudio.x, _pStartPosAudio.y, oSprite, s_bAudioActive, s_oStage);
            _oAudioToggle.addEventListener(ON_MOUSE_UP, this._onAudioToggle, this);
            
            _pStartPosFullscreen = {x:_pStartPosAudio.x - oSprite.width/2 - 20,y:_pStartPosPause.y};
        }else{
            _pStartPosFullscreen = {x: _pStartPosPause.x - oSprite.height - 20, y: _pStartPosExit.y};
        }
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        if(ENABLE_FULLSCREEN === false) {
            _fRequestFullScreen = false;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            oSprite = s_oSpriteLibrary.getSprite('but_fullscreen');
            
            _oButFullscreen = new CToggle(_pStartPosFullscreen.x,_pStartPosFullscreen.y,oSprite,s_bFullscreen,s_oStage);
            _oButFullscreen.addEventListener(ON_MOUSE_UP, this._onFullscreenRelease, this);
        }
        
        if (s_bMobile) {
            _pStartPosArrowLeft = {x: CANVAS_WIDTH * 0.5 - 430 - EDGEBOARD_X, y: CANVAS_HEIGHT * 0.5 + 220 + EDGEBOARD_Y};
            var oSpriteArrow = s_oSpriteLibrary.getSprite("arrow");
            _oArrowLeft = createBitmap(oSpriteArrow);
            _oArrowLeft.regX = oSpriteArrow.width * 0.5;
            _oArrowLeft.regY = oSpriteArrow.height * 0.5;
            _oArrowLeft.x = _pStartPosArrowLeft.x;
            _oArrowLeft.y = _pStartPosArrowLeft.y;
            _oArrowLeft.scaleX = -1;
            s_oStage.addChild(_oArrowLeft);

            _pStartPosArrowRight = {x: CANVAS_WIDTH * 0.5 + 430 + EDGEBOARD_X, y: CANVAS_HEIGHT * 0.5 + 220 + EDGEBOARD_Y};
            _oArrowRight = createBitmap(oSpriteArrow);
            _oArrowRight.regX = oSpriteArrow.width * 0.5;
            _oArrowRight.regY = oSpriteArrow.height * 0.5;
            _oArrowRight.x = _pStartPosArrowRight.x;
            _oArrowRight.y = _pStartPosArrowRight.y;
            s_oStage.addChild(_oArrowRight);
        }

        _oHelpPanel = new CHelpPanel(0, 0, s_oSpriteLibrary.getSprite('bg_help'));

        this.refreshButtonPos(s_iOffsetX, s_iOffsetY);


        // Added by Sup coder
        // Result page:
        confirmContainer = new createjs.Container();
        itemResult = new createjs.Bitmap(s_oSpriteLibrary.getSprite('itemPop'));
        
        resultShareTxt = new createjs.Text();
        resultShareTxt.font = "25px " + FONT_GAME;
        resultShareTxt.color = '#ffffff';
        resultShareTxt.textAlign = "center";
        resultShareTxt.textBaseline='alphabetic';
        resultShareTxt.text = 'SHARE YOUR SCORE:';
        
        resultTitleTxt = new createjs.Text();
        resultTitleTxt.font = "60px " + FONT_GAME;
        resultTitleTxt.color = '#ffffff';
        resultTitleTxt.textAlign = "center";
        resultTitleTxt.textBaseline='alphabetic';
        resultTitleTxt.text = 'GAME OVER';
        
        resultDescTxt = new createjs.Text();
        resultDescTxt.font = "20px " + FONT_GAME;
        resultDescTxt.lineHeight = 28;
        resultDescTxt.color = '#ffffff';
        resultDescTxt.textAlign = "center";
        resultDescTxt.textBaseline='alphabetic';
        resultDescTxt.text = '';

        resultPriceTxt = new createjs.Text();
        resultPriceTxt.font = "25px " + FONT_GAME;
        resultPriceTxt.lineHeight = 35;
        resultPriceTxt.color = '#ffffff';
        resultPriceTxt.textAlign = "center";
        resultPriceTxt.textBaseline='alphabetic';
        resultPriceTxt.text = 'SCORE : 100 TILES';
        
        
        buttonFacebook = new createjs.Bitmap(s_oSpriteLibrary.getSprite('buttonFacebook'));
        buttonWhatsapp = new createjs.Bitmap(s_oSpriteLibrary.getSprite('buttonWhatsapp'));
        buttonTiktok = new createjs.Bitmap(s_oSpriteLibrary.getSprite('buttonTiktok'));
        buttonContinue = new createjs.Bitmap(s_oSpriteLibrary.getSprite('buttonContinue'));

        buttonFacebook.cursor = "pointer";
        buttonFacebook.addEventListener("click", function(evt) {
            share('facebook');
        });
        
        buttonTiktok.cursor = "pointer";
        buttonTiktok.addEventListener("click", function(evt) {
            share('tiktok');
        });

        buttonWhatsapp.cursor = "pointer";
        buttonWhatsapp.addEventListener("click", function(evt) {
            share('whatsapp');
        });
        buttonContinue.cursor = "pointer";
        buttonContinue.addEventListener("click", function(evt) {
            window.location.href = 'https://www.player1.win/games/3/snakes?rb=1';
        });
	    centerReg(buttonContinue);
        centerReg(buttonFacebook);
        createHitarea(buttonFacebook);
        centerReg(buttonWhatsapp);
        createHitarea(buttonWhatsapp);
        centerReg(buttonTiktok);
        createHitarea(buttonTiktok);
        
        itemExit = new createjs.Bitmap(s_oSpriteLibrary.getSprite('itemPop'));

        itemExit.x = CANVAS_WIDTH/2 - itemExit.image.width / 2;

        buttonWhatsapp.x = CANVAS_WIDTH/100*43;
        buttonWhatsapp.y = CANVAS_HEIGHT/100*57;
        buttonTiktok.x = CANVAS_WIDTH/2;
        buttonTiktok.y = CANVAS_HEIGHT/100*57;
        buttonFacebook.x = CANVAS_WIDTH/100*57;
        buttonFacebook.y = CANVAS_HEIGHT/100*57;
        
        buttonContinue.x = CANVAS_WIDTH/2;
        buttonContinue.y = CANVAS_HEIGHT/100 * 68;

        resultShareTxt.x = CANVAS_WIDTH/2;
        resultShareTxt.y = CANVAS_HEIGHT/100 * 51;

        resultTitleTxt.x = CANVAS_WIDTH/2;
        resultTitleTxt.y = CANVAS_HEIGHT/100 * 35;

        resultDescTxt.x = CANVAS_WIDTH/2;
        resultDescTxt.y = CANVAS_HEIGHT/100 * 40;

        resultPriceTxt.x = CANVAS_WIDTH/2;
        resultPriceTxt.y = CANVAS_HEIGHT/100 * 44;

        confirmContainer.addChild(itemExit, buttonContinue, resultTitleTxt, resultDescTxt, resultPriceTxt, resultShareTxt, buttonFacebook, buttonTiktok, buttonWhatsapp);
        confirmContainer.visible = false;
        canvasContainer = new createjs.Container();
        canvasContainer.addChild(confirmContainer);
        s_oStage.addChild(confirmContainer);

    };

    this.toggleResultContainer = function(con, winStatus) {
        if (con == true) {

            if (confirmContainer.visible == false)
            {
                _oButPause.visible = false;
                _oButFullscreen.visible = false;
                _oButExit.visible = false;

                if (winStatus == 'win') {
                    textTitle = "You won!!!!";
                    textMessage = "Congratulations, you won:"
                    resultPriceTxt.text = "$" + ME_SNAKE.betUsd;
                    resultTitleTxt.font = "60px " + FONT_GAME;

                    particles = [];
					for (var i = 0; i < maxConfettis; i++) {
						particles.push(new confettiParticle(context, possibleColors));
					}
					Draw();
                }
                else {
                    textTitle = "The outcome of this game favors the opponent.\n\n 🙁  \n\n"
                    textMessage = "\n\nOne more try,\nyou've got this!";
                    resultTitleTxt.font = "20px " + FONT_GAME;

                    resultShareTxt.visible = false;
                    buttonFacebook.visible = false;
                    buttonTiktok.visible = false;
                    buttonWhatsapp.visible = false;
                    resultPriceTxt.visible = false;
                }

                resultTitleTxt.text = textTitle;
			    resultDescTxt.text = textMessage;
                confirmContainer.visible = true;
                
            }

        } else {
            confirmContainer.visible = false;
        }
    }
    
    this.refreshButtonPos = function (iNewX, iNewY) {
        _oButExit.setPosition(_pStartPosExit.x - iNewX, iNewY + _pStartPosExit.y);
        _oButPause.setPosition(_pStartPosPause.x - iNewX, iNewY + _pStartPosPause.y);
        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.setPosition(_pStartPosAudio.x - iNewX, iNewY + _pStartPosAudio.y);
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.setPosition(_pStartPosFullscreen.x - iNewX,_pStartPosFullscreen.y + iNewY);
        }

        _oBestScoreText.x = _pStartPosBest.x + iNewX;
        _oBestScoreText.y = _pStartPosBest.y + iNewY;

        _oTimerText.x = _pStartPosBest.x + iNewX;
        _oTimerText.y = _pStartPosBest.y + iNewY;

        
        _userListContainer.x = _pStartPosBest.x + iNewX;
        _userListContainer.y = _pStartPosBest.y + iNewY + 30;
        if (s_bMobile) {
            _oArrowLeft.x = _pStartPosArrowLeft.x + iNewX;
            _oArrowLeft.y = _pStartPosArrowLeft.y - iNewY;

            _oArrowRight.x = _pStartPosArrowRight.x - iNewX;
            _oArrowRight.y = _pStartPosArrowRight.y - iNewY;
        }
        _oScoreText.y = _pStartPosScore.y + iNewY;

        s_oGame.updateScrollLimit(iNewX, iNewY);

    };

    this.unload = function () {
        _oButExit.unload();
        _oButExit = null;

        _oHelpPanel.unload();

        if (DISABLE_SOUND_MOBILE === false || s_bMobile === false) {
            _oAudioToggle.unload();
            _oAudioToggle = null;
        }
        
        if (_fRequestFullScreen && screenfull.enabled){
            _oButFullscreen.unload();
        }
        
        s_oInterface = null;
    };

    this.refreshScore = function (iScore) {
        _oScoreText.text = TEXT_SCORE + ": " + iScore;
    };

    this.refreshBestScore = function (iScore, bAnim) {
        _oBestScoreText.text = TEXT_BEST_SCORE + ": " + iScore;
        if (bAnim) {
            _oBestScoreText.color = "#ffff00";
            createjs.Tween.get(_oBestScoreText, {override: true}).to({scaleX: 1.1, scaleY: 1.1},
                    500, createjs.Ease.cubicOut).to({scaleX: 1, scaleY: 1}, 500, createjs.Ease.cubicIn).set({color: "#fff"});
        }
    };

    // Added by Sup man
    this.dispPlayers = function (players) {
        _userListContainer.removeAllChildren();
        var userListTitle = new createjs.Text("Players:", "32px " + FONT_GAME, "#ffffff");
        _userListContainer.addChild(userListTitle);

        for (var i = 0; i < players.length; i++) {
            
            var flagImage = new Image();
            flagImage.src = `https://www.player1.win/assets/images/flags/`+players[i].country+`.png`

			const flagWidth = 36; // Set your desired width here
			const flagHeight = 27; // Set your desired height here

            flagImage.onload = (function(index) {
                return function() {
                    var listItem = new createjs.Container();
                    listItem.y = (index + 1) * 38; // Adjust the positioning according to your needs

                    var usernameText = new createjs.Text(players[index].name + '(' + players[index].score + ')', "28px " + FONT_GAME, "#ffffff");

                    var bitmap = new createjs.Bitmap(this);
                    bitmap.scaleX = flagWidth / bitmap.image.width;
                    bitmap.scaleY = flagHeight / bitmap.image.height;
                    // Center the bitmap within the container
                    // bitmap.regX = bitmap.image.width / 2;
                    // bitmap.regY = 80;
    
                    usernameText.regX = usernameText.regX - bitmap.image.width - 20;
    
                    listItem.addChild(bitmap, usernameText);
    
                    _userListContainer.addChild(listItem);
                };
              })(i);
        }
    };

    //
    this.displayTimer = function(milli) {
        var milliseconds = milli % 1000;
        var seconds = Math.floor((milli / 1000) % 60);
        var minutes = Math.floor((milli / (60 * 1000)) % 60);
        
        if(seconds<10){
            seconds = '0'+seconds;  
        }
        
        if(minutes<10){
            minutes = '0'+minutes;  
        }
        
        var disp_content = '';
        if (milli > 0)
        {
            disp_content =minutes+':'+seconds;
        }
        _oTimerText.text = disp_content;

        if (milli < 59000) {
            _oTimerText.color = '#F00';
        } else {
            _oTimerText.color = '#FFF';
        }
    }

    this._onPause = function () {
        if (confirmContainer == null || confirmContainer.visible == false) {
            s_oGame.unpause(false);
            this.createPauseInterface();
        }
    };

    this.createPauseInterface = function () {
        _oPause = new CPause();
    };

    this.createEndPanel = function (iScore) {
        _oEndPanel = new CEndPanel(s_oSpriteLibrary.getSprite("msg_box"));
        _oEndPanel.show(iScore);
    };

    this.unloadPause = function () {
        _oPause.unload();
        _oPause = null;
    };

    this.onExitFromHelp = function () {
        _oHelpPanel.unload();
    };

    this._onAudioToggle = function () {
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
    };

    this._onExit = function () {
        if (confirmContainer == null || confirmContainer.visible == false) {
            var _oAreYouSure = new CAreYouSurePanel(s_oStage);
            _oAreYouSure.show();
        }
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
    
    s_oInterface = this;

    this._init();

    return this;
}

var s_oInterface = null;