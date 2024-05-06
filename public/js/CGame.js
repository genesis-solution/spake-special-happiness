function CGame(oData) {

    var _pStartScroll;
    var _oPlayerSnake;
    var _oBg;
    var _oInterface;
    var _oEndPanel = null;
    var _oFade;
    var _oFoods;
    var _oEdges;
    var _oAiSnakes;
    var _oSection;
    var _oContainerEdges;
    var _bStartGame = false;
    var _bKeyDown = false;
    var _iScore;
    var _iGameState = STATE_INIT;
    var _iSection;
    var _iVelocityStep;
    var _iPlayerSpeed;
    var _iBestScore;
    var _aEnemySnakes;
    var _aSnakes;
    var _fRotationDir;
    var _fLerpCamera = LERP_RATE;
    var _oHitArea;
    var _oListenerMouseDown;
    var _oListenerMouseUp;

    this._init = function () {
        _oContainerEdges = new createjs.Container();
        s_oScrollStage = new createjs.Container();
        s_oStage.addChild(s_oScrollStage);

        _oBg = new CBackground(s_oScrollStage);

        _iScore = 0;

        _aSnakes = new Array();
        _aEnemySnakes = new Array();

        setVolume("soundtrack", 0.4);

        _iVelocityStep = 0;

        _iSection = 0;

        _fRotationDir = 0;

        _oEdges = new CEdges(_oContainerEdges);

        _oSection = new CManageSections();

        _oFoods = new CManageFoods(s_oScrollStage);

        _oAiSnakes = new CControlAiSnakes();

        _iPlayerSpeed = HERO_SPEED;

        this.createPlayerSnake();

        _iScore = _iBestScore = START_QUEUE_SNAKES[PLAYER];

        this.resetCameraOnPlayer();

        _pStartScroll = {xMax: SCROLL_LIMIT.xMax, xMin: SCROLL_LIMIT.xMin, yMax: SCROLL_LIMIT.yMax, yMin: SCROLL_LIMIT.yMin};

        this.addEnemySnakes();

        s_oScrollStage.addChild(_oContainerEdges);

        if (s_bMobile === false) {
            document.onkeydown = onKeyDown;
            document.onkeyup = onKeyUp;
        } else {
            this.createControl();
        }

        _oInterface = new CInterface();
        _oInterface.refreshScore(_iScore);
        _oInterface.refreshBestScore(_iBestScore, false);

        _oFade = new createjs.Shape();
        _oFade.graphics.beginFill("black").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        s_oStage.addChild(_oFade);

        START_DATE = new Date();

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_TIME, createjs.Ease.cubicOut).call(function () {
            _oFade.visible = false;
        });
    };

    this.resetCameraOnPlayer = function () {
        s_oScrollStage.x += _oPlayerSnake.getDir().getX() * HERO_SPEED + (PLAYER_CAMERA_OFFSET.x - _oPlayerSnake.getLocalPos().x);
        s_oScrollStage.y += _oPlayerSnake.getDir().getY() * HERO_SPEED + (PLAYER_CAMERA_OFFSET.y - _oPlayerSnake.getLocalPos().y);
    };

    this.unload = function () {
        _bStartGame = false;
        stopSound("soundtrack");
        
        if (s_bMobile) {
            _oHitArea.off('mousedown', _oListenerMouseDown);
            _oHitArea.off('pressup', _oListenerMouseUp);
        }

        s_oStage.removeAllChildren();
        createjs.Tween.removeAllTweens();
        s_oGame = null;
        _oInterface.unload();

    };

    this.createPlayerSnake = function () {
        // var iType = PLAYER;
        // var oSpritePlayer = s_oSpriteLibrary.getSprite('snake_head_' + iType);
        // _oPlayerSnake = new CSnake(HERO_START_X, HERO_START_Y, oSpritePlayer, iType, START_QUEUE_SNAKES[iType], null, s_oScrollStage);
        // _aSnakes.push(_oPlayerSnake);


        var iType = ME_SNAKE.type;
        var oSpritePlayer = s_oSpriteLibrary.getSprite('snake_head_' + iType);
        _oPlayerSnake = new CSnake(ME_SNAKE.x, ME_SNAKE.y, oSpritePlayer, iType, ME_SNAKE.score, null, s_oScrollStage);
        _aSnakes.push(_oPlayerSnake);
    };

    this.addEnemySnakes = function () {
        var iID = 0;
        for (var i = 0; i < AI_SNAKES.length; i++) {
            var iType = AI_SNAKES[i].type;
            var oSpriteSnake1 = s_oSpriteLibrary.getSprite('snake_head_' + iType);
            var oEnemySnake = new CSnake(AI_SNAKES[i].x, AI_SNAKES[i].y, oSpriteSnake1, iType, AI_SNAKES[i].score, iID, s_oScrollStage);
            _aEnemySnakes.push(oEnemySnake);
            _aSnakes.push(oEnemySnake);

            _oAiSnakes.addSnakeToAI(oEnemySnake);
            iID++;
        }
    };

    this.createControl = function () {
        _oHitArea = new createjs.Shape();
        _oHitArea.graphics.beginFill("rgba(255,0,0,0.01)").drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        s_oStage.addChild(_oHitArea);

        _oListenerMouseDown = _oHitArea.on('mousedown', this.onPressStart);
        _oListenerMouseUp = _oHitArea.on('pressup', this.onPressRelease);
    };

    this.onPressStart = function (evt) {
        if (evt.stageX < CANVAS_WIDTH * 0.5) {
            s_oGame.onLeft();
        } else if (evt.stageX > CANVAS_WIDTH * 0.5) {
            s_oGame.onRight();
        }
    };

    this.onPressRelease = function () {
        s_oGame.onKeyReleased();
    };

    this.onRestart = function () {
        _fRotationDir = 0;
        this.unloadASnake(_oPlayerSnake);

        for (var i = 0; i < _aEnemySnakes.length; i++) {
            this.unloadASnake(_aEnemySnakes[i]);
            _oAiSnakes.removeSnakeByID(i);
        }

        _aSnakes = new Array();
        _aEnemySnakes = new Array();

        _oAiSnakes.reset();

        _bKeyDown = false;

        this.createPlayerSnake();

        this.scrollStage(_oPlayerSnake, _iPlayerSpeed);

        //  this.resetCameraOnPlayer();
        _fLerpCamera = 0.1;
        createjs.Tween.get(this).wait(750).call(function () {
            _fLerpCamera = LERP_RATE;
        });

        this.addEnemySnakes();

        _iScore = _oPlayerSnake.getLengthQueue();
        ME_SNAKE.score = _iScore;
        _oInterface.refreshScore(_iScore);

        playExistingSound("soundtrack");
        s_oScrollStage.setChildIndex(_oContainerEdges, s_oScrollStage.numChildren - 1);

        _oFoods.restoresAllEatenFood();
        _iGameState = STATE_PLAY;
        s_oGame.unpause(true);

    };

    this.unloadASnake = function (oSnake) {
        oSnake.unloadQueue();
        oSnake.unload();
    };

    function onKeyUp(evt) {
        if (_bStartGame === false) {
            return;
        }

        switch (evt.keyCode) {
            case 38:
                s_oGame.onKeyUpUp();
                break;
            case 37:
            case 39:
                _bKeyDown = false;
                break;
        }
    }

    function onKeyDown(evt) {
        if (_bStartGame === false || _bKeyDown) {
            evt.preventDefault();
            return false;
        }

        if (!evt) {
            evt = window.event;
        }

        switch (evt.keyCode) {
            // left  
            case 37:
                s_oGame.onLeft();
                break;
                // right  
            case 39:
                s_oGame.onRight();
                break;
                //up
            case 38:
                s_oGame.onKeyDownUp();
                break;
        }

        evt.preventDefault();
        return false;
    }

    this.onKeyDownUp = function () {
        if (ALLOW_SPEED_UP) {
            _iPlayerSpeed = HERO_SPEED_UP;
        }
    };

    this.onKeyUpUp = function () {
        _iPlayerSpeed = HERO_SPEED;
    };

    this.getPlayerSnake = function () {
        return _oPlayerSnake;
    };

    this.getSnakesArray = function () {
        return _aSnakes;
    };

    this.onLeft = function () {
        if (_oPlayerSnake.getEaten()) {
            return;
        }
        _bKeyDown = true;

        _fRotationDir = -HERO_ROT_SPEED;
    };

    this.onRight = function () {
        if (_oPlayerSnake.getEaten()) {
            return;
        }
        _bKeyDown = true;

        _fRotationDir = HERO_ROT_SPEED;
    };

    this.onKeyReleased = function () {
        _bKeyDown = false;
    };

    this.onExit = function () {
        _oFade.visible = true;
        createjs.Tween.get(_oFade, {ignoreGlobalPause: true}).to({alpha: 1}, MS_FADE_TIME, createjs.Ease.cubicOut).call(function () {
            s_oGame.unpause(true);
            s_oGame.unload();
            $(s_oMain).trigger("end_session");
            
            playExistingSound("soundtrack");
            setVolume("soundtrack", 1);
            s_oMain.gotoMenu();
        });
    };

    this._onExitHelp = function () {
      //  _oInterface.onExitFromHelp();
        _bStartGame = true;

        _iGameState = STATE_PLAY;

        $(s_oMain).trigger("start_level", 1);
    };

    this.updateScrollLimit = function (iNewX, iNewY) {
        _pStartScroll.xMax = SCROLL_LIMIT.xMax + iNewX;
        _pStartScroll.xMin = SCROLL_LIMIT.xMin - iNewX;
        _pStartScroll.yMax = SCROLL_LIMIT.yMax + iNewY;
        _pStartScroll.yMin = SCROLL_LIMIT.yMin - iNewY;

    };

    this.scrollStage = function (oFollow) {
        s_oScrollStage.x += oFollow.getDir().getX() * HERO_SPEED + (PLAYER_CAMERA_OFFSET.x - oFollow.getLocalPos().x) * _fLerpCamera;
        s_oScrollStage.y += oFollow.getDir().getY() * HERO_SPEED + (PLAYER_CAMERA_OFFSET.y - oFollow.getLocalPos().y) * _fLerpCamera;

        if (s_oScrollStage.x < _pStartScroll.xMin) {
            s_oScrollStage.x = _pStartScroll.xMin;
        } else if (s_oScrollStage.x > _pStartScroll.xMax) {
            s_oScrollStage.x = _pStartScroll.xMax;
        }

        if (s_oScrollStage.y < _pStartScroll.yMin) {
            s_oScrollStage.y = _pStartScroll.yMin;
        } else if (s_oScrollStage.y > _pStartScroll.yMax) {
            s_oScrollStage.y = _pStartScroll.yMax;
        }
    };

    this.cutQueueAt = function (oSnake1, iQueueCol) {
        oSnake1.cutQueueAtPoint(iQueueCol);
    };

    this.unpause = function (bVal) {
        _bStartGame = bVal;
        createjs.Ticker.paused = !bVal;
    };

    this.snakeCloseMounthAnim = function (oSnake) {
        oSnake.changeState("close");
        oSnake.setIgnoreAnim(true);
        oSnake.onAnimationEnd();
    };

    this.manageCollision = function () {
        this.snakeSection();
        this.snakeFoodsCollision();
        this.snakeEdgesCollision();

        this.snakesCollisions();
    };

    this.snakesCollisions = function () {
        for (var i = 0; i < _aEnemySnakes.length; i++) {
            this.snakesHeadHeadCollision(_oPlayerSnake, _aEnemySnakes[i]);
            this.snakesHeadQueueCollision(_oPlayerSnake, _aEnemySnakes[i]);
        }
    };

    this.snakesHeadHeadCollision = function (oPlayerSnake, oEnemySnake) {
        if (oPlayerSnake.getEaten() || oEnemySnake.getEaten()) {
            return;
        }
        this.snakeOpenMounth(oPlayerSnake, oEnemySnake);
        if (this.circleToCircleCollision(oPlayerSnake.getPos(), oEnemySnake.getPos(), oPlayerSnake.getDim().h, oEnemySnake.getDim().h)) {
            _bKeyDown = false;
            oPlayerSnake.die();
            

            let liveUsers = [];
            for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                if (oEnemySnake.getType() != null && AI_SNAKES[i_AI].type == oEnemySnake.getType()) {
                    AI_SNAKES[i_AI].die = true
                }

                if (AI_SNAKES[i_AI].die == false) {
                    liveUsers.push(AI_SNAKES[i_AI]);
                }
            }

            oEnemySnake.die();


            ME_SNAKE.score = _iScore;
            let display_users = [];
            if (_oPlayerSnake.getEaten() == false) {
                display_users = [ME_SNAKE];
            }
            display_users = display_users.concat(liveUsers)
            display_users.sort((a, b) => {
                let scoreA = parseInt(a.score); // Ignore upper and lowercase
                let scoreB = parseInt(b.score); // Ignore upper and lowercase
                if (scoreA < scoreB) {
                    return 1;
                }
                if (scoreA > scoreB) {
                    return -1;
                }
                // names must be equal
                return 0;
            });
            _oInterface.dispPlayers(display_users);
          //  createjs.Tween.get(this).wait(MS_TIME_SHOW_WIN_PANEL).call(this.onDiePlayerSnake);
        }
    };

    this.snakesHeadQueueCollision = function (oSnake1, oSnake2) {
        // if (oSnake2.getTarget().target !== AI_PLAYER || oSnake1.getEaten()) {
        //     return;
        // }
        if (oSnake2.getEaten() || oSnake1.getEaten()) { // oSnake2.getTarget().target !== AI_PLAYER || 
            return;
        }

        var aQueue1 = oSnake1.getQueue();
        for (var j = aQueue1.length - 2; j > 0; j--) {
            this.snakeOpenMounth(oSnake2, aQueue1[j]);
            if (this.circleToCircleCollision(aQueue1[j].getPos(), oSnake2.getPos(), aQueue1[j].getDim().h, oSnake2.getDim().w)) {
              //  this.cutQueueAt(oSnake1, j);
                if (oSnake1.getCurrentAnimation() !== "damage_open" && oSnake1.getCurrentAnimation() !== "remain_damage") {
                    // oSnake2.changeState("damage_open");
                    
                    let liveUsers = [];
                    for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                        if (oSnake2.getType() != null && AI_SNAKES[i_AI].type == oSnake2.getType()) {
                            AI_SNAKES[i_AI].die = true
                        }

                        if (AI_SNAKES[i_AI].die == false) liveUsers.push(AI_SNAKES[i_AI])
                    }

                    oSnake2.die();
                    this.cutQueueAt(oSnake2, 0);

                    this.snakeCloseMounthAnim(oSnake2);

                    ME_SNAKE.score = _iScore;
                    let display_users = [];
                    if (_oPlayerSnake.getEaten() == false) {
                        display_users = [ME_SNAKE];
                    }
                    display_users = display_users.concat(liveUsers)
                    display_users.sort((a, b) => {
                        let scoreA = parseInt(a.score); // Ignore upper and lowercase
                        let scoreB = parseInt(b.score); // Ignore upper and lowercase
                        if (scoreA < scoreB) {
                            return 1;
                        }
                        if (scoreA > scoreB) {
                            return -1;
                        }
                        // names must be equal
                        return 0;
                    });
                    _oInterface.dispPlayers(display_users);
                }
                
                break;
            }
        }

        aQueue1 = oSnake2.getQueue();
        for (var j = aQueue1.length - 2; j > 0; j--) {
            this.snakeOpenMounth(oSnake1, aQueue1[j]);
            if (this.circleToCircleCollision(aQueue1[j].getPos(), oSnake1.getPos(), aQueue1[j].getDim().h, oSnake1.getDim().w)) {
              //  this.cutQueueAt(oSnake1, j);
                if (oSnake2.getCurrentAnimation() !== "damage_open" && oSnake2.getCurrentAnimation() !== "remain_damage") {
                    // oSnake1.changeState("damage_open");
                    oSnake1.die();
                    this.cutQueueAt(oSnake1, 0);
                    this.snakeCloseMounthAnim(oSnake1);
                }
                break;
            }
        }
    };

    this.snakeSection = function () {
        var aSections = _oSection.getSections();
        for (var i = 0; i < _aSnakes.length; i++) {
            for (var j = 0; j < aSections.length; j++) {
                if (aSections[j].getRect().intersects(_aSnakes[i].getRectangle())) {
                    _aSnakes[i].setSectionID(aSections[j].getID());
                    break;
                }
            }
        }
    };

    this.snakeEdgesCollision = function () {
        var aEdgesCol = _oEdges.getRectangles();
        for (var j = 0; j < _aSnakes.length; j++) {
            for (var i = 0; i < aEdgesCol.length; i++) {
                if (aEdgesCol[i].rect.intersects(_aSnakes[j].getRectangle())) {
                   // _aSnakes[j].bounce(aEdgesCol[i].normal);
                    // commit by Sup man, when Edge collision
                    _aSnakes[j].die();

                    for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                        if (_aSnakes[j].getType() != null && AI_SNAKES[i_AI].type == _aSnakes[j].getType()) {
                            AI_SNAKES[i_AI].die = true
                        }
                    }
                }
            }
        }
    };

    this.snakeEatenFood = function (oSnake, oFood) {
        if (oSnake.getType() === PLAYER) {
            this.updateScoreFood();
            oSnake.eatingSound();
        }
        oSnake.setTarget({result: false});
        oFood.setEaten(true);
        oFood.eatenAnim(oSnake.getPos());
        oSnake.eatenEffect();
        for (var i = 0; i < _aEnemySnakes.length; i++) {
            if (oSnake.getType() === ENEMY_SNAKES[i] && oSnake.getLengthQueue() >= MAX_AI_QUEUE_LENGTH) {
                return;
            }
        }
    };

    this.snakeFoodsCollision = function () {
        for (var i = 0; i < _aSnakes.length; i++) {
            var aFoods = _oSection.getSectionByID(_aSnakes[i].getSectionID()).getFoodsSection();
            for (var j = 0; j < aFoods.length; j++) {
                this.snakeOpenMounth(_aSnakes[i], aFoods[j]);
                if (!aFoods[j].getEaten()) {
                    var oPos = _aSnakes[i].getPos();
                    oPos.y += EATEN_OFFSET_DETECT * _aSnakes[i].getDir().getY();
                    oPos.x += EATEN_OFFSET_DETECT * _aSnakes[i].getDir().getX();
                    if (this.circleToCircleCollision(oPos, aFoods[j].getPos(), SNAKES_TOKEN_RADIUS_FOOD_DETECT, aFoods[j].getDim().w)) {
                        this.snakeEatenFood(_aSnakes[i], aFoods[j]);

                        var liveUsers = []
                        for (let i_enemy = 0; i_enemy < AI_SNAKES.length; i_enemy++) {
                            if (_aSnakes[i].getType() != null && ENEMY_SNAKES[i_enemy] == _aSnakes[i].getType())
                            {
                                var i_iScore = _aSnakes[i].getLengthQueue();
                                AI_SNAKES[i_enemy].score = i_iScore;
                            }

                            if (AI_SNAKES[i_enemy].die == false) {
                                liveUsers.push(AI_SNAKES[i_enemy]);
                            }
                        }

                        ME_SNAKE.score = _iScore;
                
                        let display_users = [];

                        if (_oPlayerSnake.getEaten() == false) {
                            display_users = [ME_SNAKE];
                        }

                        display_users = display_users.concat(liveUsers)
                        display_users.sort((a, b) => {
                            let scoreA = parseInt(a.score); // Ignore upper and lowercase
                            let scoreB = parseInt(b.score); // Ignore upper and lowercase
                            if (scoreA < scoreB) {
                                return 1;
                            }
                            if (scoreA > scoreB) {
                                return -1;
                            }
                            // names must be equal
                            return 0;
                        });

                        _oInterface.dispPlayers(display_users);
                    }
                }
            }
        }
    };

    this.snakeOpenMounth = function (oSnake, oFood) {
        var bFound = false;
        if (!oFood.getEaten()) {
            var oPos = oSnake.getPos();
            oPos.y += MOUNTH_OFFSET_DETECT * oSnake.getDir().getY();
            oPos.x += MOUNTH_OFFSET_DETECT * oSnake.getDir().getX();
            if (this.circleToCircleCollision(oPos, oFood.getPos(), oSnake.getOpenMounthDim().h, oFood.getDim().w)) {
                bFound = true;
            }
        }
        this.actionOpenMounth(oSnake, bFound);
    };

    this.actionOpenMounth = function (oSnake, bFound) {
        if (bFound) {
            if (oSnake.getCurrentAnimation() !== "open" && oSnake.getCurrentAnimation() !== "remain_open" && oSnake.getCurrentAnimation() !== "damage_close") {
                if (oSnake.getCurrentAnimation() === "remain_damage") {
                    oSnake.changeState("damage_close");
                } else {
                    oSnake.changeState("open");
                }
            }
        } else {
            if (oSnake.getCurrentAnimation() === "open" || oSnake.getCurrentAnimation() === "remain_open") {
                oSnake.changeState("close");
            }
        }
    };

    this.circleToCircleCollision = function (oPos1, oPos2, iDim1, iDim2) {
        var fDistance = distance(oPos1, oPos2);
        var fDim = iDim1 + iDim2;
        if (fDim > fDistance) {
            return true;
        }
        return false;
    };

    this.onDiePlayerSnake = function () {
        stopSound("soundtrack");
        _oInterface.createEndPanel(_iBestScore);
    };

    this.onDieEnemySnake = function (iID) {
        _aEnemySnakes.splice(iID, 1);
        _oAiSnakes.removeSnakeByID(iID);
    };

    this.updateScoreFood = function () {
        _iScore++;
        _oInterface.refreshScore(_iScore);
        if (_iScore > _iBestScore) {
            _iBestScore = _iScore;
            _oInterface.refreshBestScore(_iBestScore, true);
        }
    };

    this._updatePlay = function () {
        if (_bStartGame) {

            if (_bKeyDown) {
                _oPlayerSnake.rotation(_fRotationDir);
            }

            _oPlayerSnake.update(_iPlayerSpeed);

            this.scrollStage(_oPlayerSnake, _iPlayerSpeed);

            _oFoods.update();

            this.manageCollision();

            _oAiSnakes.update();

            var currentDate = new Date();
            if (START_DATE == null || START_DATE == '') {
                START_DATE = new Date();
            }
            var elapsedTime = Math.floor((currentDate.getTime() - START_DATE.getTime()));
			
            _oInterface.displayTimer(Math.floor(MAX_TIMER - elapsedTime));
        }
    };

    this.update = function () {
        switch (_iGameState) {
            case STATE_INIT:
                if (s_oHelp !== null) {
                    s_oHelp.update();
                }
                break;
            case STATE_PLAY:
                this._updatePlay();
                break;
            case STATE_FINISH:

                break;
        }
    };

    s_oGame = this;

    HERO_ROT_SPEED = oData.hero_rotation_speed;
    HERO_SPEED = oData.hero_speed;
    HERO_SPEED_UP = oData.hero_speed_up;
    FOOD_SCORE = oData.food_score;
    SNAKES_AI_SPEED = oData.snakes_AI_speed;
    
     
    this._init();
}

var s_oGame;