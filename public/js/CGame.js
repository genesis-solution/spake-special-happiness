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
    var _GameData;
    var _iDataCount = 0;

    this._init = function () {
        _oContainerEdges = new createjs.Container();
        s_oScrollStage = new createjs.Container();
        s_oStage.addChild(s_oScrollStage);

        _oBg = new CBackground(s_oScrollStage);

        _iScore = 0;

        _aSnakes = new Array();
        _aEnemySnakes = new Array();

        _GameData = {};

        setVolume("soundtrack", 0.4);

        _iVelocityStep = 0;

        _iSection = 0;

        _fRotationDir = 0;

        _oEdges = new CEdges(_oContainerEdges);

        _oSection = new CManageSections();

        _oFoods = new CManageFoods(s_oScrollStage);

        if (PLAYER == 0)
        {
            _oFoods.createRandomFoods();
        }

        _oAiSnakes = new CControlAiSnakes();

        _iPlayerSpeed = parseInt(HERO_SPEED);

        this.createPlayerSnake();

        _iScore = _iBestScore = 1;

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

        createjs.Tween.get(_oFade).to({alpha: 0}, MS_FADE_TIME, createjs.Ease.cubicOut).call(function () {
            _oFade.visible = false;
        });

        if (socket != null) {
            socket.on('opponentMove', async (totalData) => {

                if (RESPONSE_TIME == null) {
                    RESPONSE_TIME = new Date();
                }
                else {

                    for (let index_player = 0; index_player <= AI_SNAKES.length; index_player++) {
                        
                        var sleepTime = 1000 / FPS;

                        if (totalData[index_player] && index_player != _oPlayerSnake.getType()) {

                            if (totalData[index_player].length > 0 && totalData[index_player][0].timer != '') {
                                _oInterface.displayTimer(parseFloat(totalData[index_player][0].timer));
                            }

                            for (let index_item = 0; index_item < totalData[index_player].length; index_item++) {
                                const moveData = totalData[index_player][index_item];

                                var indexAISnakes = -1;
                                for (let index_ai = 0; index_ai < AI_SNAKES.length; index_ai++) {
                                    if (moveData.type == AI_SNAKES[index_ai].type) {
                                        indexAISnakes = index_ai;
                                    }
                                }

                                for (let index_enemysnake = 0; index_enemysnake < _aSnakes.length; index_enemysnake++) {
                                    if (moveData.type == _aSnakes[index_enemysnake].getType()) {
                                        
                                        if (moveData.sender != ME_SNAKE.type)
                                        {
                                            _aSnakes[index_enemysnake].setPosition(moveData.pos.x, moveData.pos.y);
                                            _aSnakes[index_enemysnake].rotate(moveData.rotValue);
                                            _aSnakes[index_enemysnake].update(HERO_SPEED);
                                        }

                                        if (moveData.score > AI_SNAKES[indexAISnakes].score)
                                        {
                                            AI_SNAKES[indexAISnakes].score += 1;

                                            if (moveData.sender != ME_SNAKE.type) {
                                                _aSnakes[index_enemysnake].eatenEffect();

                                                var aFoods = _oSection.getSectionByID(_aSnakes[index_enemysnake].getSectionID()).getFoodsSection();
                                                for (var j = 0; j < aFoods.length; j++) {
                                                    this.snakeOpenMounth(_aSnakes[index_enemysnake], aFoods[j]);
                                                    if (!aFoods[j].getEaten()) {
                                                        var oPos = _aSnakes[index_enemysnake].getPos();
                                                        oPos.y += EATEN_OFFSET_DETECT * _aSnakes[index_enemysnake].getDir().getY();
                                                        oPos.x += EATEN_OFFSET_DETECT * _aSnakes[index_enemysnake].getDir().getX();
                                                        if (this.circleToCircleCollision(oPos, aFoods[j].getPos(), SNAKES_TOKEN_RADIUS_FOOD_DETECT, aFoods[j].getDim().w)) {
                                                            aFoods[j].setEaten(true);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        

                                        if (moveData.die == true) {
                                            AI_SNAKES[indexAISnakes].die = moveData.die;
                                            _aSnakes[index_enemysnake].die();
                                        }

                                        AI_SNAKES[indexAISnakes].x = moveData.pos.x;
                                        AI_SNAKES[indexAISnakes].y = moveData.pos.y;

                                        await sleep(sleepTime);

                                        this.manageCollision();
                                    }
                                }
                            }


                        }

                        if (false && totalData[index_player] && index_player == _oPlayerSnake.getType()) {

                            for (let index_item = 0; index_item < totalData[index_player].length; index_item++) {
                                const moveData = totalData[index_player][index_item];

                                if (true) { // 

                                    _oPlayerSnake.setPosition(moveData.pos.x, moveData.pos.y);
                                    _oPlayerSnake.rotate(moveData.rotValue);

                                    ME_SNAKE.score = moveData.score;
                                    _iScore = _iBestScore = moveData.score;

                                    ME_SNAKE.die = moveData.die;
                                    if (moveData.die == true) {
                                        _oPlayerSnake.die();
                                    }

                                    ME_SNAKE.x = moveData.pos.x;
                                    ME_SNAKE.y = moveData.pos.y;

                                    _oPlayerSnake.setVisible(true);
                                    // for (let index_queue = 0; index_queue < _oPlayerSnake.getQueue().length; index_queue++) {
                                    //     _oPlayerSnake.getQueue()[index_queue].setVisible(true);
                                    // }
                                    this.manageCollision();

                                    await sleep(sleepTime);

                                }
                            }
                        }

                        
                    }

                    let display_users = [];
                    display_users = [ME_SNAKE];
                    display_users = display_users.concat(AI_SNAKES);

                    var DISP_USERS = localStorage.getItem("disp");

                    if (DISP_USERS == undefined || DISP_USERS == null || compareArrays(display_users, JSON.parse(DISP_USERS)) == false) {
                        localStorage.setItem("disp", JSON.stringify(display_users));

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

                    if (this.isSubmitResult()) this.submitResult();
                }
                
            });

            this.shareFoods();

            socket.on('total_foods', (foods) => {
                if (foods.player != PLAYER) {
                    _oFoods.setManageFoods(foods.data);
                }

                s_oMain.setGameStart();
            });

            socket.on('giveup', (playerName) => {
                if (playerName == ME_SNAKE.entityId) {
                    _oPlayerSnake.die();

                    if (socket != null && ME_SNAKE.isSubmitted == false) {
                        ME_SNAKE.die = true;
                        ME_SNAKE.isSubmitted = true;
                        socket.emit("final_result", ME_SNAKE)
                    }
                }
                else {
                    for (let index = 0; index < AI_SNAKES.length; index++) {
                        if (AI_SNAKES[index].entityId == playerName) {
                            AI_SNAKES[index].die = true;
                        }
                    }
                }
            });

            socket.on('disconnected_user', (playerName) => {

                for (let index = 0; index < AI_SNAKES.length; index++) {
                    if (AI_SNAKES[index].entityId == playerName)
                    {
                        AI_SNAKES[index].die = true;

                        for (let index_enemysnake = 0; index_enemysnake < _aSnakes.length; index_enemysnake++) {
                            if (AI_SNAKES[index].type == _aSnakes[index_enemysnake].getType()) {
                                _aSnakes[index_enemysnake].die();
                                break;
                            }
                        }
                    }
                }

            });

            socket.on('winner', (winnertype) => {
                if (winnertype != null && winnertype != '') {

                    var result = '';
                    let winnerScore = 0;
                    let winner = ME_SNAKE;

                    if (ME_SNAKE.type == winnertype) {
                        result = 'win';
                        winnerScore = _iScore;
                        winner = ME_SNAKE;
                    }
                    else {
                        result = 'fail';

                        for (let index_ai = 0; index_ai < AI_SNAKES.length; index_ai++) {
                            if (winnertype == AI_SNAKES[index_ai].type) {
                                winnerScore = AI_SNAKES[index_ai].score;
                                winner = AI_SNAKES[index_ai];
                                break;
                            }
                        }
                    }

                    const urlParams = new URLSearchParams(window.location.search);

                    // Get the value of a specific parameter
                    const tokenID = urlParams.get('t');
                    if (tokenID != undefined && tokenID != '')
                    {
                        _bStartGame = false;

                        $.ajax({
                            type: "POST",
                            url: '/result',
                            data: {user: ME_SNAKE, oppenents: AI_SNAKES, winner: winner, t: tokenID, result_status: result, t: tokenID, gameID: 3},
                            success: function (result) {

                                if (result.success == true) {
                                    if (result.PriseUsd != undefined)
                                    {
                                    } else {
                                    }
                                }
                            },
                            error: function(xhr, status, error) {
                                // Handle errors
                                console.log(xhr.responseText);
                                console.log(error)
                            }
                        });
                    }

                    if (socket != null) {
                        socket.emit('disconnect_game', {});
                        this.unpause(false);
                    }

                    $(s_oMain).trigger("end_session");
                    _oInterface.toggleResultContainer(true, result); // win or fail
                }
            });

            socket.on('playerDisconnected', (roomName) => {
                if (_bStartGame == true) {
                    this.unpause(false);
                } 
            });

            socket.on('updatetimer', (timer) => {
                _oInterface.displayTimer(timer);
            });

        }

        _iDataCount = 0;

        // Disable context menu "Reload"
        document.addEventListener("contextmenu", function (event) {
            event.preventDefault();
            _oInterface._onExit();
        });
    };

    this.addGameData = function (data) {
        if (!_GameData[data.type]) {
            _GameData[data.type] = [];
        }

        _GameData[data.type].push(data);
    }

    this.shareFoods = function () {
        if (this.getLivePlayer() != null && this.getLivePlayer() == PLAYER)
        {
            var attrFoods = [];
            var totalFoods = _oFoods.getFoods();

            for (let index_food = 0; index_food < totalFoods.length; index_food++) {

                attrFoods.push(
                    {
                        type: totalFoods[index_food].getType(),
                        section: totalFoods[index_food].getSectionID(),
                        state: totalFoods[index_food].getState(),
                        pos: totalFoods[index_food].getPos()
                    }
                );
            }

            if (socket != null)
            {
                socket.emit('total_foods', {data: attrFoods, player: PLAYER});
            }
        }
    }

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
        var iType = ME_SNAKE.type;
        var oSpritePlayer = s_oSpriteLibrary.getSprite('snake_head_' + iType);
        _oPlayerSnake = new CSnake(ME_SNAKE.x, ME_SNAKE.y, oSpritePlayer, iType, ME_SNAKE.score, iType, s_oScrollStage, ME_SNAKE.isBot);
        _aSnakes.push(_oPlayerSnake);
    };

    this.addEnemySnakes = function () {
        var iID = 0;
        for (var i = 0; i < AI_SNAKES.length; i++) {
            var iType = AI_SNAKES[i].type;
            var oSpriteSnake1 = s_oSpriteLibrary.getSprite('snake_head_' + iType);
            var oEnemySnake = new CSnake(AI_SNAKES[i].x, AI_SNAKES[i].y, oSpriteSnake1, iType, AI_SNAKES[i].score, iType, s_oScrollStage, AI_SNAKES[i].isBot);
            _aEnemySnakes.push(oEnemySnake);
            _aSnakes.push(oEnemySnake);

            if (AI_SNAKES[i].isBot == 1) // only one player can run the AI bots
            {
                _oAiSnakes.addSnakeToAI(oEnemySnake);
            }
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
                //s_oGame.onKeyDownUp();
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

    this.scrollStage = function (oFollow, speed) {
        s_oScrollStage.x += oFollow.getDir().getX() * speed * 0.8  + (PLAYER_CAMERA_OFFSET.x - oFollow.getLocalPos().x) * _fLerpCamera;
        s_oScrollStage.y += oFollow.getDir().getY() * speed * 0.8  + (PLAYER_CAMERA_OFFSET.y - oFollow.getLocalPos().y) * _fLerpCamera;

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
            ME_SNAKE.die = true;
            
            for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                if (oEnemySnake.getType() != null && AI_SNAKES[i_AI].type == oEnemySnake.getType()) {
                    AI_SNAKES[i_AI].die = true
                }
            }

            oEnemySnake.die();
            this.submitResult();

          //  createjs.Tween.get(this).wait(MS_TIME_SHOW_WIN_PANEL).call(this.onDiePlayerSnake);
        }
    };

    this.snakesHeadQueueCollision = function (oSnake1, oSnake2) {
        // if (oSnake2.getTarget().target !== AI_PLAYER || oSnake1.getEaten()) {
        //     return;
        // }
        if (oSnake2.getEaten() || oSnake1.getEaten()) {
            return;
        }

        var aQueue1 = oSnake1.getQueue();
        for (var j = aQueue1.length - 2; j > 0; j--) {
           // this.snakeOpenMounth(oSnake2, aQueue1[j]);
            if (this.circleToCircleCollision(aQueue1[j].getPos(), oSnake2.getPos(), aQueue1[j].getDim().h, oSnake2.getDim().w)) {
              //  this.cutQueueAt(oSnake1, j);
                if (oSnake1.getCurrentAnimation() !== "damage_open" && oSnake1.getCurrentAnimation() !== "remain_damage") {
                    // oSnake2.changeState("damage_open");
                    
                    for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                        if (oSnake2.getType() != null && AI_SNAKES[i_AI].type == oSnake2.getType()) {
                            AI_SNAKES[i_AI].die = true
                        }
                    }

                    oSnake2.die();
               //     this.cutQueueAt(oSnake2, 0);
                    //this.snakeCloseMounthAnim(oSnake2);
                }
                
                break;
            }
        }

        aQueue1 = oSnake2.getQueue();
        for (var j = aQueue1.length - 2; j > 0; j--) {
          //  this.snakeOpenMounth(oSnake1, aQueue1[j]);
            if (this.circleToCircleCollision(aQueue1[j].getPos(), oSnake1.getPos(), aQueue1[j].getDim().h, oSnake1.getDim().w)) {
              //  this.cutQueueAt(oSnake1, j);
                if (oSnake2.getCurrentAnimation() !== "damage_open" && oSnake2.getCurrentAnimation() !== "remain_damage") {
                    // oSnake1.changeState("damage_open");
                    oSnake1.die();
                    ME_SNAKE.die = true;
            //        this.cutQueueAt(oSnake1, 0);
                    //this.snakeCloseMounthAnim(oSnake1);
                    this.submitResult();
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

                    if (_aSnakes[j].getType() == ME_SNAKE.type) {
                        ME_SNAKE.die = true;
                        this.submitResult();
                    }
                }
            }
        }
    };

    this.getEdgeRectangle = function () {
        return _oEdges.getRectangles();
    }

    this.snakeEatenFood = function (oSnake, oFood) {
        if (oSnake.getType() === PLAYER) {
            this.updateScoreFood();
            oSnake.eatingSound();
        }
        oSnake.setTarget({result: false});
        oFood.setEaten(true);
        oFood.eatenAnim(oSnake.getPos());

        if (oSnake.getType() == ME_SNAKE.type)
            oSnake.eatenEffect();
        else {
            for (let index = 0; index < AI_SNAKES.length; index++) {
                if (AI_SNAKES[index].type == oSnake.getType() && AI_SNAKES[index].isBot == 1 && this.getLivePlayer() != null && this.getLivePlayer() == PLAYER)
                    oSnake.eatenEffect();
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

                        for (let i_enemy = 0; i_enemy < AI_SNAKES.length; i_enemy++) {
                            if (AI_SNAKES[i_enemy].type == _aSnakes[i].getType())
                            {
                                // console.log(AI_SNAKES[i_enemy].type, _aSnakes[i].getLengthQueue())
                                var i_iScore = _aSnakes[i].getLengthQueue();
                                AI_SNAKES[i_enemy].score = i_iScore;
                            }
                        }

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

            _oFoods.update();

            if (_bKeyDown) {
                _oPlayerSnake.rotation(_fRotationDir);
            }

            _oAiSnakes.update();

            var currentDate = new Date();
            if (START_DATE == null || START_DATE == '') {
                START_DATE = new Date();
            }
            var elapsedTime = Math.floor((currentDate.getTime() - START_DATE.getTime()));

            if (Math.floor(MAX_TIMER - elapsedTime) > 0)
            {
                _oInterface.displayTimer(Math.floor(MAX_TIMER - elapsedTime));
                // if (socket != null) {
                //     if (this.getLivePlayer() != null && this,this.getLivePlayer() == PLAYER)
                //     {
                //         socket.emit("updatetimer", Math.floor(MAX_TIMER - elapsedTime))
                //     }
                // }

                if (LAST_UPDATE_TIME != null && _oPlayerSnake.getEaten() == false)
                {
                    var curr_type = _oPlayerSnake.getType(); 
                    // console.log("curr_type", curr_type)
                    // var curr_queue = _oPlayerSnake.getQueue();
                    // console.log("curr_queue", curr_queue)
                    var curr_pos = _oPlayerSnake.getPos();
                    // console.log("curr_pos", curr_pos)
                    var curr_die = _oPlayerSnake.getEaten();
                    // console.log("curr_die", curr_die)
                    var curr_rotate = _oPlayerSnake.getRotate();

                    this.addGameData({
                        type: curr_type,
                        pos: curr_pos,
                        die: curr_die,
                        score: _oPlayerSnake.getLengthQueue(),
                        rotValue: curr_rotate,
                        sender: ME_SNAKE.type,
                        timer: Math.floor(MAX_TIMER - elapsedTime)
                    });

                    var last_elapsedTime = Math.floor((currentDate.getTime() - LAST_UPDATE_TIME.getTime()));
                    if (last_elapsedTime > MAX_SOCKET_ELAPS) {
                        LAST_UPDATE_TIME = new Date();
                        ///////
                        ///////////////////////////////////////
                        // Detecting the movement
                        ///////////////////////////////////////

                        if (socket != null) {
                            socket.emit('move', _GameData);
                            _GameData = {};
                            _iDataCount = 0;
                        }

                        ME_SNAKE.score = _oPlayerSnake.getLengthQueue();
                        _iScore = ME_SNAKE.score;
                        let display_users = [];
                        display_users = [ME_SNAKE];
                        display_users = display_users.concat(AI_SNAKES);

                        var DISP_USERS = localStorage.getItem("disp");

                        if (DISP_USERS == undefined || DISP_USERS == null || compareArrays(display_users, JSON.parse(DISP_USERS)) == false) {
                            localStorage.setItem("disp", JSON.stringify(display_users));

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
            else {
                this.submitResult();
            }

            if (_oPlayerSnake.getEaten() == false)
            {   
                if (RESPONSE_TIME == null) {
                    // for (let index_enemy = 0; index_enemy < _aEnemySnakes.length; index_enemy++) {
                    //     for (let index_ai = 0; index_ai < AI_SNAKES.length; index_ai++) {
                    //         if (_aEnemySnakes[index_enemy].getType() == AI_SNAKES[index_ai].type && AI_SNAKES[index_ai].isBot == 0) {
                    //             _aEnemySnakes[index_enemy].update(_iPlayerSpeed / 10000);
                    //         }
                    //     }
                    // }
                    // _oPlayerSnake.update(_iPlayerSpeed / 10000);

                    // this.manageCollision();
                } else {
                    _oPlayerSnake.update(_iPlayerSpeed);
                    // _oPlayerSnake.setVisible(false);
                    // for (let index_queue = 0; index_queue < _oPlayerSnake.getQueue().length; index_queue++) {
                    //     _oPlayerSnake.getQueue()[index_queue].setVisible(false);
                    // }
                    this.scrollStage(_oPlayerSnake, _iPlayerSpeed);
                    _oInterface.refreshScore(_oPlayerSnake.getLengthQueue());
                    this.manageCollision();
                }

            } else {

                if (socket != null && ME_SNAKE.isSubmitted == false) {
                    ME_SNAKE.die = true;
                    ME_SNAKE.isSubmitted = true;
                    socket.emit("final_result", ME_SNAKE)
                }
            }

        }
    };

    this.getLivePlayer = function () {
        if (_oPlayerSnake.getEaten() == false) return _oPlayerSnake.getType();

        for (let index = 0; index < AI_SNAKES.length; index++) {
            if (AI_SNAKES[index].die == false && AI_SNAKES[index].isBot == 0) {
                return AI_SNAKES[index].type;
            }
        }

        return null;
    }

    this.isSubmitResult = function () {

        for (let index = 0; index < AI_SNAKES.length; index++) {
            if ( (AI_SNAKES[index].die == false && AI_SNAKES[index].isBot == 0) || (AI_SNAKES[index].die == false && AI_SNAKES[index].isBot == 1 && _oPlayerSnake.getEaten() == false)) {
                return false;
            }
        }

        return true;
    }

    this.submitResult = function () {

        if (socket != null && ME_SNAKE.isSubmitted == false) {
            ME_SNAKE.isSubmitted = true;
            ME_SNAKE.score = _iScore;
            socket.emit("final_result", ME_SNAKE)
        }
    }

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

    if (oData != null && oData.data != null && oData.data != undefined) {
        this._init();
    }
    
}

var s_oGame;