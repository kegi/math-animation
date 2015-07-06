function MathAnimation(options) {

    this.initialize(options);
}

/**
 * method initialize
 * @param {object} options
 */
MathAnimation.prototype.initialize = function (options) {

    if (typeof options === 'undefined') {
        options = {};
    }

    this.el = options.el || $('canvas#main')[0];
    this.ctx = this.el.getContext('2d');

    //0 = circle, >2 = polygon
    this.shapeNbSides = typeof options.shapeNbSides !== undefined ? options.shapeNbSides : 0;

    this.initialMultiplicator = options.initialMultiplicator || 2.01;
    this.multiplicator = null;
    this.multiplicatorStep = options.multiplicatorStep || 0.01;
    this.minMultiplicator = options.minMultiplicator || 0;
    this.maxMultiplicator = options.maxMultiplicator || 0;
    this.multiplicatorIncrementing = true;

    this.useInitialAnimation = typeof options.useInitialAnimation !== undefined ? options.useInitialAnimation : true;
    this.initialAnimationDelay = options.animationDelay || 25;
    this.animationDelay = null;
    this.animationTimeout = null;
    this.initialAnimationTimeout = null;

    this.initialNbPoints = options.nbPoints || 360;
    this.nbPoints = 0;
    this.showPoints = typeof options.showPoints !== undefined ? options.showPoints : true;
    this.pointSize = options.pointSize || 3;
    this.pointColor = options.pointColor || '#fff';

    this.lineColor = options.lineColor || '#0f0';
    this.lineSecondaryColor = options.lineSecondaryColor || '#fff';
    this.lineSecondarySize = options.lineSecondarySize || 3;

    this.canvasSize = options.canvasSize || 650;
    this.canvasPadding = options.canvasPadding || 10;
    this.el.width = this.canvasSize;
    this.el.height = this.canvasSize;

    this.start();
};

/**
 * @method start
 */
MathAnimation.prototype.start = function () {

    this.animationDelay = this.initialAnimationDelay;
    this.multiplicator = this.initialMultiplicator;
    this.nbPoints = 0;

    clearTimeout(this.animationTimeout);
    clearTimeout(this.initialAnimationTimeout);

    if (this.useInitialAnimation) {
        this.initialAnimation();
    } else {
        this.nbPoints = this.initialNbPoints;
        this.calculatePoints();
    }

    this.run();
};

/**
 * @method initialAnimation
 */
MathAnimation.prototype.initialAnimation = function () {

    if (this.nbPoints < this.initialNbPoints) {

        this.nbPoints++;
        this.calculatePoints();

        this.initialAnimationTimeout = setTimeout(function () {
            this.initialAnimation();
        }.bind(this), 2500 / this.initialNbPoints);
    }
};

/**
 * @method run
 */
MathAnimation.prototype.run = function () {

    this.clear();
    this.drawMainShape();
    this.drawLines();

    if (this.showPoints) {
        this.drawPoints();
    }

    this.animationTimeout = setTimeout(function () {

        if (this.multiplicatorIncrementing) {
            this.multiplicator += this.multiplicatorStep;
        } else {
            this.multiplicator -= this.multiplicatorStep;
        }

        if (this.maxMultiplicator !== 0 && this.multiplicator >= this.maxMultiplicator) {
            this.multiplicatorIncrementing = false;
        } else {
            if (this.minMultiplicator !== 0 && this.multiplicator <= this.minMultiplicator) {
                this.multiplicatorIncrementing = true;
            }
        }

        $('#info').html(Math.round(this.multiplicator * 100) / 100);
        this.run();

    }.bind(this), this.animationDelay);
};

/**
 * @method clear
 */
MathAnimation.prototype.clear = function () {

    this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
};

/**
 * @method drawMainShape
 */
MathAnimation.prototype.drawMainShape = function () {

    var center = this.canvasSize / 2;

    if (this.shapeNbSides === 0) {

        var r = center - this.canvasPadding;

        this.ctx.beginPath();
        this.ctx.arc(center, center, r, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();
    } else {

        if (this.shapeNbSides >= 3) {

            var size = center - this.canvasPadding;

            this.ctx.beginPath();
            this.ctx.moveTo(center + size * Math.cos(0), center + size * Math.sin(0));

            for (var i = 1; i <= this.shapeNbSides; i++) {
                this.ctx.lineTo(center + size * Math.cos(i * 2 * Math.PI / this.shapeNbSides), center + size * Math.sin(i * 2 * Math.PI / this.shapeNbSides));
            }

            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = "#fff";
            this.ctx.stroke();
        }
    }
};

/**
 * @method calculatePoints
 */
MathAnimation.prototype.calculatePoints = function () {

    this.points = {};

    var center = this.canvasSize / 2;
    var r = center - this.canvasPadding;
    var sides = {};

    if (this.shapeNbSides >= 3) {

        var previousPos = {
            x: center + r * Math.cos(0),
            y: center + r * Math.sin(0)
        };

        for (var i = 1; i <= this.shapeNbSides; i++) {

            var x = center + r * Math.cos(i * 2 * Math.PI / this.shapeNbSides);
            var y = center + r * Math.sin(i * 2 * Math.PI / this.shapeNbSides);

            sides[i - 1] = {
                x1: previousPos.x,
                y1: previousPos.y,
                x2: x,
                y2: y
            };

            previousPos.x = x;
            previousPos.y = y;
        }
    }

    for (i = 0; i < this.nbPoints; i++) {

        if (this.shapeNbSides === 0) {

            var rad = (((360 / this.nbPoints) * i) - 90) * Math.PI / 180;

            this.points[i] = {
                x: center + r * Math.cos(rad),
                y: center + r * Math.sin(rad)
            };
        } else if (this.shapeNbSides >= 3) {

            var v = i / (this.nbPoints / this.shapeNbSides);
            var side = Math.floor(v);
            var sidePos = sides[side];
            var ratio = v - side;

            this.points[i] = {
                x: ((sidePos.x2 - sidePos.x1) * ratio) + sidePos.x1,
                y: ((sidePos.y2 - sidePos.y1) * ratio) + sidePos.y1
            };
        }
    }
};

/**
 * @method drawLines
 */
MathAnimation.prototype.drawLines = function () {

    for (var point in this.points) {

        if (!this.points.hasOwnProperty(point)) {
            continue;
        }

        var oppositePoint = parseInt(point) + (this.nbPoints / 2);
        if (oppositePoint > this.nbPoints) {
            oppositePoint = oppositePoint - this.nbPoints;
        }

        var result = Math.round((point * this.multiplicator) % this.nbPoints);
        if (result === this.nbPoints) {
            result = 0;
        }

        var resultCoord = this.points[result];

        var margin = Math.round(this.nbPoints / 15);
        if (result >= (oppositePoint - margin) && result <= (oppositePoint + margin)) {

            this.ctx.strokeStyle = this.lineSecondaryColor;
            this.ctx.lineWidth = this.lineSecondarySize;
        } else {
            this.ctx.strokeStyle = this.lineColor;
            this.ctx.lineWidth = 1;
        }

        if (!this.points.hasOwnProperty(result)) {
            console.log(result);
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[point].x, this.points[point].y);
        this.ctx.lineTo(resultCoord.x, resultCoord.y);
        this.ctx.stroke();
    }
};

/**
 * @method drawPoints
 */
MathAnimation.prototype.drawPoints = function () {

    this.ctx.fillStyle = this.pointColor;

    for (var point in this.points) {

        if (!this.points.hasOwnProperty(point)) {
            continue;
        }

        var pos = this.points[point];

        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, this.pointSize, 0, 2 * Math.PI, false);
        this.ctx.fill();
    }
};
