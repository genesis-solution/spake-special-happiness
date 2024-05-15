function CSubAISnake(oSnake, iTimeFollow) {
    var _oSnake = oSnake;
    var _fTimeChangeDir = 0;
    var _fTimeTurn;
    var _iTimeFollow = iTimeFollow;
    var _iTimeIgnore = AI_TIME_IGNORE_PLAYER;
    var _bIgnorePlayer = false;
    var _bSoundFollowPlayed = false;

    this._init = function () {
        _fTimeTurn = (Math.random() * (AI_WAIT_TIME_FOR_CHANGE_DIR.max - AI_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_WAIT_TIME_FOR_CHANGE_DIR.min;
    };

    this.setRandomDirection = function () {
        if (_fTimeChangeDir < 0) {
            if (_fTimeTurn > 0) {
                _oSnake.rotation(HERO_ROT_SPEED);
                _fTimeTurn -= s_iTimeElaps;
            } else {
                _fTimeTurn = (Math.random() * (AI_WAIT_TIME_FOR_CHANGE_DIR.max - AI_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_WAIT_TIME_FOR_CHANGE_DIR.min;
                _fTimeChangeDir = (Math.random() * (AI_TIME_CHANGE_DIR.max - AI_TIME_CHANGE_DIR.min)) + AI_TIME_CHANGE_DIR.min;
            }
        } else {
            _fTimeChangeDir -= s_iTimeElaps;
        }
    };

    this.setSmallRandomDirection = function () {
        if (_fTimeChangeDir < 0) {
            if (_fTimeTurn > 0) {
                _oSnake.rotation(HERO_ROT_SPEED);
                _fTimeTurn -= s_iTimeElaps;
            } else {
                _fTimeTurn = (Math.random() * (AI_SMALL_WAIT_TIME_FOR_CHANGE_DIR.max - AI_SMALL_WAIT_TIME_FOR_CHANGE_DIR.min)) + AI_SMALL_WAIT_TIME_FOR_CHANGE_DIR.min;
                _fTimeChangeDir = (Math.random() * (AI_SMALL_TIME_CHANGE_DIR.max - AI_SMALL_TIME_CHANGE_DIR.min)) + AI_SMALL_TIME_CHANGE_DIR.min;
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
            _iTimeFollow -= s_iTimeElaps;

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
        
        var currentDate = new Date();
        if (LAST_AI_UPDATE_TIME != null)
        {
            var last_elapsedTime = Math.floor((currentDate.getTime() - LAST_AI_UPDATE_TIME.getTime()));
            if (last_elapsedTime > MAX_SUB_SOCKET_ELAPS) {
                LAST_AI_UPDATE_TIME = new Date();

                for (let index = 0; index < AI_SNAKES.length; index++) {
                    if (AI_SNAKES[index].type == _oSnake.getType() && AI_SNAKES[index].isBot == 1 && (s_oGame.getLivePlayer() != null && s_oGame.getLivePlayer() == PLAYER)) {
                        
                        this.setRandomDirection();
                        this.ignorePlayerTime();

                        _oSnake.setVisible(false);
        
                        var curr_type = oSnake.getType(); 
                        // console.log("curr_type", curr_type)
                        var curr_queue = oSnake.getQueue();
                        // console.log("curr_queue", curr_queue)
                        var curr_pos = oSnake.getPos();
                        // console.log("curr_pos", curr_pos)
                        var curr_die = oSnake.getEaten();
                        // console.log("curr_die", curr_die)
                        var curr_rotate = oSnake.getRotate();
        
                        if (socket != null) {
                            socket.emit('move', {
                                type: curr_type,
                                queue: curr_queue[curr_queue.length - 1].getPos(),
                                pos: curr_pos,
                                die: curr_die,
                                score:  oSnake.getLengthQueue(),
                                rotValue: curr_rotate,
                                speed: HERO_SPEED,
                                isBot: 1,
                                sender: ME_SNAKE.type
                            })
                        }
                    }
                    else {
                        this.ignorePlayerTime();
                    }
                }

            }
        }

    };

    this._init();
    return this;
}
