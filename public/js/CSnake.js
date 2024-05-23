function CSnake(iX, iY, oSprite, iType, iStartQueueLenght, iID, oParentContainer, isBot) {
    var _oSnake;
    var _oCollision;
    var _oShape;
    var _oParentContainer = oParentContainer;
    var _oRectangleMeasure;
    var _oRectangle;
    var _oAIRectangle;
    var _oContainer;
    var _oTarget;
    var _oOpenMounthDim;
    var _oSubAI = null;
    var _iRadius;
    var _iDiameter;

    var _iType;
    var _iSection;
    var _iID = iID;
    var _vDir;
    var _aQueue;
    var _bDie = false;
    var _bIgnoreAnim = false;
    var _bEatingSoundPlayed = false;
    var _bScreamingSoundPlayed = false;
    var _isBot = 0;

    this._init = function (iX, iY, iType, iStartQueueLenght, oSprite, isBot) {
        _oContainer = new createjs.Container();
        _oParentContainer.addChild(_oContainer);
        _aQueue = new Array();

        _vDir = new CVector2(0, 1);
        _iType = iType;
        _isBot = isBot;

        var iWidth;
        var iHeight;
        var oAnimation;

        if (iType === 4) {
            iWidth = oSprite.width / 9;
            iHeight = oSprite.height / 2;
            oAnimation = {
                // normal: 0,
                // open: [1, 7, "remain_open"],
                // remain_open: 7,
                // close: [8, 12, "normal"],
                // damage_open: [13, 16, "remain_damage"],
                // remain_damage: [16, 16, "damage_close", 0.05],
                // damage_close: {
                //     frames: [16, 15, 14, 13],
                //     next: "normal"
                // },
                // die: 17
                normal: 0,
                open: [1, 7, "remain_open"],
                remain_open: 7,
                close: [8, 12, "normal"]
            };
        } else {
            iWidth = oSprite.width / 7;
            iHeight = oSprite.height / 2;
            oAnimation = {
                normal: 0,
                open: [1, 7, "remain_open"],
                remain_open: 7,
                close: [8, 12, "normal"]
            };
        }

        var oData = {// image to use
            images: [oSprite],
            // width, height & registration point of each sprite
            frames: {width: iWidth, height: iHeight, regX: (iWidth) / 2, regY: iHeight / 2},
            animations: oAnimation
        };

        var oSpriteSheet = new createjs.SpriteSheet(oData);
        _oSnake = createSprite(oSpriteSheet, "normal", (iWidth) / 2, iHeight / 2, iWidth, iHeight);
        _oSnake.gotoAndPlay("close");

        _oSnake.x = iX;
        _oSnake.y = iY;
        _oContainer.addChild(_oSnake);

        _oTarget = {result: false, target: null};

        _iRadius = iWidth * 0.4;

        _iDiameter = _iRadius + _iRadius;

        _oCollision = {w: iWidth * 0.5, h: iWidth * 0.5};
        _oOpenMounthDim = {w: _oCollision.w * OPEN_MOUNTH_DISTANCE_RATE, h: _oCollision.h * OPEN_MOUNTH_DISTANCE_RATE};

        for (var i = 0; i < iStartQueueLenght; i++) {
            this.createAQueque(_oSnake.x, _oSnake.y + DISTANCE_SINGLE_QUEUE * (_aQueue.length + 1), false);
        }

        this.createCollision();
    };

    this.getCurrentAnimation = function () {
        return _oSnake.currentAnimation;
    };

    this.getIsBot = function () {
        return _isBot;
    }

    this.setSubAI = function (oSubAI) {
        _oSubAI = oSubAI;
    };

    this.getSubAI = function () {
        return _oSubAI;
    };

    this.createCollision = function () {
        _oRectangleMeasure = {x: _oSnake.x - _iRadius, y: _oSnake.y - _iRadius,
            w: _iDiameter, h: _iDiameter};

        _oRectangle = new createjs.Rectangle(_oRectangleMeasure.x, _oRectangleMeasure.y,
                _oRectangleMeasure.w, _oRectangleMeasure.h);

        _oAIRectangle = new createjs.Rectangle(_oRectangleMeasure.x - 1 * _iRadius, _oRectangleMeasure.y - 1 * _iRadius,
            _oRectangleMeasure.w * 3, _oRectangleMeasure.h * 3);

        if (SHOW_COLLISION_SHAPE) {
            _oShape = new createjs.Shape();
            _oShape.graphics.beginFill("#00ff00").drawRect(_oAIRectangle.x, _oAIRectangle.y,
                _oAIRectangle.width, _oAIRectangle.height);
            _oShape.alpha = 0.5;
            _oParentContainer.addChild(_oShape);
        }
    };

    this.bounce = function (vNormal) {
        _oSnake.x += _vDir.getX() * HERO_SPEED;
        _oSnake.y += _vDir.getY() * HERO_SPEED;

        _vDir.setV(reflectVectorV2(_vDir, vNormal));
        //_vDir.normalize();
        _oSnake.rotation = Math.atan2(_vDir.getY(), _vDir.getX()) * (180 / Math.PI) - 90;
    };

    this.changeState = function (szState) {
        if (!_bIgnoreAnim) {
            _oSnake.gotoAndPlay(szState);
        }
    };

    this.onAnimationEnd = function () {
        var oParent = this;
        _oSnake.on("animationend", function () {
            oParent.setIgnoreAnim(false);
        });
    };

    this.setIgnoreAnim = function (bVal) {
        _bIgnoreAnim = bVal;
    };

    this.stopState = function (szState) {
        _oSnake.gotoAndStop(szState);
    };

    // Created by Sup man
    this.setQueue = function(lastQueue, rotV) {
        var oQueue = new CSingleQueue(lastQueue.x, lastQueue.y, rotV, iType, _oContainer);
        if (_aQueue.length > 0) {
            var iLast = _aQueue.length - 1;
            _aQueue[iLast].changeState("body");
            _aQueue[iLast].setRegY(_aQueue[iLast].getRegY() - REG_Y_OFFSET_QUEUE);
//            _aQueue[iLast].setScale(0);
//            _aQueue[iLast].spawnAnim();
            _oContainer.swapChildren(_oSnake, oQueue.getObj());
            //  _oContainer.swapChildren(oQueue.getObj(), _aQueue[_aQueue.length - 1].getObj());
            _oContainer.setChildIndex(oQueue.getObj(), 1);
        }
        oQueue.stopTimeline(0);
        _aQueue.push(oQueue);
    }

    this.createAQueque = function (iX, iY) {
        var oQueue = new CSingleQueue(iX, iY, _oSnake.rotation, iType, _oContainer);
        if (_aQueue.length > 0) {
            var iLast = _aQueue.length - 1;
            _aQueue[iLast].changeState("body");
            _aQueue[iLast].setRegY(_aQueue[iLast].getRegY() - REG_Y_OFFSET_QUEUE);
//            _aQueue[iLast].setScale(0);
//            _aQueue[iLast].spawnAnim();
            _oContainer.swapChildren(_oSnake, oQueue.getObj());
            //  _oContainer.swapChildren(oQueue.getObj(), _aQueue[_aQueue.length - 1].getObj());
            _oContainer.setChildIndex(oQueue.getObj(), 1);
        }
        oQueue.stopTimeline(0);
        _aQueue.push(oQueue);
    };

    this.eatingSound = function () {
        if (_bEatingSoundPlayed) {
            return;
        }
        var oSound = playSound("snake_eating", 1, false);
		
        if(oSound!==null){
            oSound.on("end", function () {
                    _bEatingSoundPlayed = false;
            });
        }
        _bEatingSoundPlayed = true;
    };

    this.screamingSound = function () {
        if (_bScreamingSoundPlayed) {
            return;
        }

        var oSound = playSound("scream", 1, false);
        if(oSound!==null){
                oSound.on("end", function () {
                        _bScreamingSoundPlayed = false;
                });
        }
        _bScreamingSoundPlayed = true;
    };

    this.eatenEffect = function () {
        var iTime = EATEN_FOOD_SNAKE_INTERVAL;
        for (var i = 4; i < _aQueue.length; i++) {
            _aQueue[i].eatenEffect(iTime);
            iTime += EATEN_FOOD_SNAKE_INTERVAL;
        }
        createjs.Tween.get(this).wait(iTime).call(function () {
            this.createAQueque(-5000, -5000);
        });
    };

    this.queuePosition = function () {
//        var iDirX = _vDir.getX() * DISTANCE_SINGLE_QUEUE;
//        var iDirY = _vDir.getY() * DISTANCE_SINGLE_QUEUE;

        if (_aQueue != null)
        {
            _aQueue[0].setPosition(_oSnake.x, _oSnake.y);
            _aQueue[0].setRotation(_oSnake.rotation);
            for (var i = _aQueue.length - 1; i > 0; i--) {
                _aQueue[i].setPosition(_aQueue[i - 1].getLastPos().x, _aQueue[i - 1].getLastPos().y);
                _aQueue[i].setRotation(_aQueue[i - 1].getRotation());
            }
        }
    };

    this.cutQueueAtPoint = function (iCutPoint) {
        var iQueue = 0;
        for (var i = iCutPoint; i < _aQueue.length - 1; i++) {
            _aQueue[i].unload();
            iQueue++;
        }
        _aQueue.splice(iCutPoint, iQueue);
    };

    this.die = function () {
        if (_bDie) {
            return;
        }
        _bDie = true;
      //  _vDir.set(0, 0);
      //  this.stopState("die");
        this.cutQueueAtPoint(0);
    };

    this.getOpenMounthDim = function () {
        return _oOpenMounthDim;
    };

    this.unload = function () {
        createjs.Tween.removeTweens(_oSnake);
        createjs.Tween.removeTweens(this);

        _oParentContainer.removeChild(_oContainer);
    };

    this.unloadQueue = function () {
        for (var i = 0; i < _aQueue.length; i++) {
            _aQueue[i].unload();
        }
        _aQueue = null;
    };

    this.getLengthQueue = function () {
        if (_aQueue == null) return 0;
        return _aQueue.length;
    };

    this.getQueue = function () {
        return _aQueue;
    };

    this.getDim = function () {
        return _oCollision;
    };

    this.getEaten = function () {
        return _bDie;
    };

    this.getSectionID = function () {
        return _iSection;
    };

    this.setSectionID = function (iVal) {
        _iSection = iVal;
    };

    this.setVisible = function (bVal) {
        _oSnake.visible = bVal;
    };

    this.getPos = function () {
        return {x: _oSnake.x, y: _oSnake.y};
    };

    this.getLocalPos = function () {
        return _oSnake.localToGlobal(0, 0);
    };

    this.getX = function () {
        return _oSnake.x;
    };

    this.getY = function () {
        return _oSnake.y;
    };

    this.getRotate = function() {
        return _oSnake.rotation;
    }

    this.getSprite = function () {
        return _oSnake;
    };

    this.setPosition = function (iX, iY) {
        _oSnake.x = iX;
        _oSnake.y = iY;
    };

    this.rotation = function (fValue) {
        _oSnake.rotation += fValue;
        _vDir.set(Math.sin(-_oSnake.rotation * (Math.PI / 180)), Math.cos(-_oSnake.rotation * (Math.PI / 180)));
        // console.log(_oSnake.rotation + " " + _vDir.toString());
    };

    this.rotate = function (fValue) {
        _oSnake.rotation = fValue;
        _vDir.set(Math.sin(-_oSnake.rotation * (Math.PI / 180)), Math.cos(-_oSnake.rotation * (Math.PI / 180)));
    };

    this.getType = function () {
        return _iType;
    };

    this.getDir = function () {
        return _vDir;
    };

    this.getID = function () {
        return  _iID;
    };

    this.move = function (iSpeed) {
        _oSnake.x -= _vDir.getX() * iSpeed;
        _oSnake.y -= _vDir.getY() * iSpeed;

        this.moveRect();
    };

    this.move0 = function (iSpeed) {
        _oSnake.x -= _vDir.getX() * iSpeed;
        _oSnake.y -= _vDir.getY() * iSpeed;

        this.moveRect();
    };

    this.getTarget = function () {
        return _oTarget;
    };

    this.setTarget = function (oInfo) {
        _oTarget.result = oInfo.result;
        _oTarget.target = oInfo.target;
    };

    this.moveRect = function () {
        _oRectangleMeasure = {x: _oSnake.x - _iRadius, y: _oSnake.y - _iRadius,
            w: _iDiameter, h: _iDiameter};

        _oRectangle.setValues(_oRectangleMeasure.x, _oRectangleMeasure.y,
                _oRectangleMeasure.w, _oRectangleMeasure.h);

        _oAIRectangle.setValues(_oRectangleMeasure.x - 2 * _iRadius, _oRectangleMeasure.y - 2 * _iRadius,
            _oRectangleMeasure.w * 4, _oRectangleMeasure.h * 4);


        if (SHOW_COLLISION_SHAPE) {
            if (_oShape) {
                _oParentContainer.removeChild(_oShape);
                _oShape = null;
            }

            _oShape = new createjs.Shape();
            _oShape.graphics.beginFill("#00ff00").drawRect(_oAIRectangle.x, _oAIRectangle.y, _oAIRectangle.width, _oAIRectangle.height);
            _oShape.alpha = 0.5;
            _oParentContainer.addChild(_oShape);
        }
    };

    this.getRectangle = function () {
        return _oRectangle;
    };

    this.getAIRectangle = function () {
        return _oAIRectangle;
    };

    this.update = function (iSpeed) {
        if (!_bDie) {
            this.queuePosition();
            this.move(iSpeed);
        }
    };

    this.updateWithoutView = function (iSpeed) {
        if (!_bDie) {
            // this.move0(iSpeed);
            this.queuePosition();
        }
    };

    this._init(iX, iY, iType, iStartQueueLenght, oSprite);
}