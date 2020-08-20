'use strict'

import _ from 'lodash'

export class BoundingBox2D {
	constructor (points) {
		this.points = points
		this.topLeftX = null
		this.topLeftY = null
		this.bottomRightX = null
		this.bottomRightY = null
		this.init()
	}

	init () {
		if (_.isArray(this.points)) {
			for (let i = 0; i < this.points.length; i++) {
				if (this.points[i].x < this.topLeftX || this.topLeftX === null) {
					this.topLeftX = this.points[i].x
				}
				if (this.points[i].x > this.bottomRightX || this.bottomRightX === null) {
					this.bottomRightX = this.points[i].x
				}
				if (this.points[i].y < this.topLeftY || this.topLeftY === null) {
					this.topLeftY = this.points[i].y
				}
				if (this.points[i].y > this.bottomRightY || this.bottomRightY === null) {
					this.bottomRightY = this.points[i].y
				}
			}
		}
	}

	getTopLeftX () {
		return this.topLeftX
	}

	getTopLeftY () {
		return this.topLeftY
	}

	getBottomRightX () {
		return this.bottomRightX
	}

	getBottomRightY () {
		return this.bottomRightY
	}

	getCenterX () {
		return this.getTopLeftX() + this.getWidth() / 2
	}

	getCenterY () {
		return this.getTopLeftY() + this.getHeight() / 2
	}

	getWidth () {
		return this.getBottomRightX() - this.getTopLeftX()
	}

	getHeight () {
		return this.getBottomRightY() - this.getTopLeftY()
	}

	addMargin (margin) {
		this.addMarginTop(margin)
		this.addMarginBottom(margin)
		this.addMarginRight(margin)
		this.addMarginLeft(margin)
	}

	addMarginTop (margin) {
		this.topLeftY = this.topLeftY - Math.abs(margin)
	}

	addMarginBottom (margin) {
		this.bottomRightY = this.bottomRightY + Math.abs(margin)
	}

	addMarginRight (margin) {
		this.bottomRightX = this.bottomRightX + Math.abs(margin)
	}

	addMarginLeft (margin) {
		this.topLeftX = this.topLeftX - Math.abs(margin)
	}

	scale (factor) {
		this.topLeftX = this.topLeftX * factor
		this.topLeftY = this.topLeftY * factor
		this.bottomRightX = this.bottomRightX * factor
		this.bottomRightY = this.bottomRightY * factor
	}

	translateX (x) {
		this.topLeftX = this.topLeftX + x
		this.bottomRightX = this.bottomRightX + x
	}

	translateY (y) {
		this.topLeftY = this.topLeftY + y
		this.bottomRightY = this.bottomRightY + y
	}

	clone () {
		const boundingBox = new BoundingBox2D()
		boundingBox.topLeftX = this.getTopLeftX()
		boundingBox.topLeftY = this.getTopLeftY()
		boundingBox.bottomRightX = this.getBottomRightX()
		boundingBox.bottomRightY = this.getBottomRightY()
		return boundingBox
	}

	normalizeX () {
		this.bottomRightX = this.bottomRightX - this.getWidth()
		this.topLeftX = 0
	}

	normalize () {
		this.bottomRightX = this.bottomRightX - this.topLeftX
		this.bottomRightY = this.bottomRightY - this.topLeftY
		this.topLeftX = 0
		this.topLeftY = 0
	}

	static createFromPoints (points) {
		return new BoundingBox2D(points)
	}
}
