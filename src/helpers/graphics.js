'use strict';

import _ from 'lodash'

export class BoundingBox2D {

    constructor(points) {
        this.points = points;
        this.topLeftX = null;
        this.topLeftY = null;
        this.bottomRightX = null;
        this.bottomRightY = null;
        this.init();
    }

    init() {
        if(_.isArray(this.points)) {
            for(let i = 0; i < this.points.length; i++) {
                if(this.points[i].x < this.topLeftX || this.topLeftX === null) {
                    this.topLeftX = this.points[i].x;
                }
                if(this.points[i].x > this.bottomRightX || this.bottomRightX === null) {
                    this.bottomRightX = this.points[i].x;
                }
                if(this.points[i].y < this.topLeftY || this.topLeftY === null) {
                    this.topLeftY = this.points[i].y;
                }
                if(this.points[i].y > this.bottomRightY || this.bottomRightY === null) {
                    this.bottomRightY = this.points[i].y;
                }
            }
        }
    }

    getTopLeftX() {
        return this.topLeftX;
    }

    getTopLeftY() {
        return this.topLeftY;
    }

    getBottomRightX() {
        return this.bottomRightX;
    }

    getBottomRightY() {
        return this.bottomRightY;
    }

    getCenterX() {
        return this.getTopLeftX() + this.getWidth() / 2;
    }

    getCenterY() {
        return this.getTopLeftY() + this.getHeight() / 2;
    }

    getWidth() {
        return this.getBottomRightX() - this.getTopLeftX();
    }

    getHeight() {
        return this.getBottomRightY() - this.getTopLeftY();
    }

    addMargin(margin) {
        this.topLeftX = this.topLeftX - margin;
        this.topLeftY = this.topLeftY - margin;
        this.bottomRightX = this.bottomRightX + margin;
        this.bottomRightY = this.bottomRightY + margin;
    }

    scale(factor) {
        this.topLeftX = this.topLeftX * factor;
        this.topLeftY = this.topLeftY * factor;
        this.bottomRightX = this.bottomRightX * factor;
        this.bottomRightY = this.bottomRightY * factor;
    }

    clone() {
        let boundingBox = new BoundingBox2D();
        boundingBox.topLeftX = this.getTopLeftX();
        boundingBox.topLeftY = this.getTopLeftY();
        boundingBox.bottomRightX = this.getBottomRightX();
        boundingBox.bottomRightY = this.getBottomRightY();
        return boundingBox;
    }

    static createFromPoints(points) {
        return new BoundingBox2D(points);
    }
}
