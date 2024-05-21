function CSubAISnake(oSnake, iTimeFollow) {
    var _oSnake = oSnake;
    var _fTimeChangeDir = 0;
    var _fTimeTurn;
    var _iTimeFollow = iTimeFollow;
    var _iTimeIgnore = AI_TIME_IGNORE_PLAYER;
    var _bIgnorePlayer = false;
    var _bSoundFollowPlayed = false;

    this._init = function () {
        _fTimeTurn = (1 * (AI_WAIT_TIME_FOR_CHANGE_DIR.max - AI_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_WAIT_TIME_FOR_CHANGE_DIR.min;
    };

    this.setRandomDirection = function () {
        if (_fTimeChangeDir < 0) {
            if (_fTimeTurn > 0) {
                _oSnake.rotation(HERO_ROT_SPEED);
                _fTimeTurn -= 100;
            } else {
                _fTimeTurn = (1 * (AI_WAIT_TIME_FOR_CHANGE_DIR.max - AI_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_WAIT_TIME_FOR_CHANGE_DIR.min;
                _fTimeChangeDir = (1 * (AI_TIME_CHANGE_DIR.max - AI_TIME_CHANGE_DIR.min)) + AI_TIME_CHANGE_DIR.min;
            }
        } else {
            _fTimeChangeDir -= 100;
        }
    };

    this.setAIDirection = function () {
        if (_fTimeChangeDir < 0) {
            if (_fTimeTurn > 0) {
                
                var s_edgeRectangle = s_oGame.getEdgeRectangle();
                // Check edge Rectangle
                for (var i = 0; i < s_edgeRectangle.length; i++) {
                    if (s_edgeRectangle[i].rect.intersects(_oSnake.getAIRectangle())) {
                        _oSnake.bounce(s_edgeRectangle[i].normal);
                    }
                }

                // // Check Snake collision
                // if (oPlayerSnake.getEaten() == false) {
                //     if (distance(oPlayerSnake.getPos(), _oSnake.getPos()) < HERO_SPEED * FPS * 1) {
                //         _oSnake.rotation(HERO_ROT_SPEED);
                //     }
                // }
                // for (var i = 0; i < _aEnemySnakes.length; i++) {
                //     if (oPlayerSnake.getEaten() || oEnemySnake.getEaten()) {
                //         return;
                //     }
                    
                //     if (this.circleToCircleCollision(oPlayerSnake.getPos(), oEnemySnake.getPos(), oPlayerSnake.getDim().h, oEnemySnake.getDim().h)) {
                //         _bKeyDown = false;
                //         oPlayerSnake.die();
                //         ME_SNAKE.die = true;
                        
                //         for (let i_AI = 0; i_AI < AI_SNAKES.length; i_AI++) {
                //             if (oEnemySnake.getType() != null && AI_SNAKES[i_AI].type == oEnemySnake.getType()) {
                //                 AI_SNAKES[i_AI].die = true
                //             }
                //         }
            
                //         oEnemySnake.die();
            
                //       //  createjs.Tween.get(this).wait(MS_TIME_SHOW_WIN_PANEL).call(this.onDiePlayerSnake);
                //     }
                // }

                _fTimeTurn -= s_iTimeElaps;
            } else {
                _fTimeTurn = (Math.random() * (AI_WAIT_TIME_FOR_CHANGE_DIR.max - AI_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_WAIT_TIME_FOR_CHANGE_DIR.min;
                _fTimeChangeDir = (Math.random() * (AI_TIME_CHANGE_DIR.max - AI_TIME_CHANGE_DIR.min)) + AI_TIME_CHANGE_DIR.min;
            }
        } else {
            _fTimeChangeDir -= s_iTimeElaps;
        }
    };

    this.followTime = function () {
        if (_iTimeFollow < 0) {
            _bIgnorePlayer = true;
            _fTimeChangeDir = -1;
        } else {
            _iTimeFollow -= 100;

        }
    };

    this.setFollowTime = function (iVal) {
        _iTimeFollow = iVal;
    };

    this.getFollowTime = function () {
        return _iTimeFollow;
    };

    this.playSoundFollow = function () {
        if (_bSoundFollowPlayed) {
            return;
        }
        _bSoundFollowPlayed = true;

        playSound("snake_follow", 1, false);
    };

    this.setSoundFollow = function (bVal) {
        _bSoundFollowPlayed = bVal;
    };

    this.ignorePlayerTime = function () {
        if (_bIgnorePlayer) {
            if (_iTimeIgnore > 0) {
                _iTimeIgnore -= s_iTimeElaps;
            } else {
                _bIgnorePlayer = false;
                _iTimeIgnore = AI_TIME_IGNORE_PLAYER;

                var selected_snake = {};
                for (var i = 0; i < AI_SNAKES.length; i++) {
                    if (_oSnake.getType() == AI_SNAKES[i].type) {
                        selected_snake = AI_SNAKES[i];
                    }
                }
                _iTimeFollow = selected_snake.time_follow;

            }
        }
    };

    this.ignorePlayer = function () {
        return _bIgnorePlayer;
    };

    this.update = function () {
        
        // for (let index = 0; index < AI_SNAKES.length; index++) {
        //     if (AI_SNAKES[index].type == _oSnake.getType() && AI_SNAKES[index].isBot == 1 && (s_oGame.getLivePlayer() != null && s_oGame.getLivePlayer() == PLAYER)) {
        //         // this.setAIDirection();
                
        //     }
        // }

        this.setRandomDirection();
        this.ignorePlayerTime();

    };

    this._init();
    return this;
}
