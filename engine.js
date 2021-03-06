const canvasId = "gameEngine"

class GameEngine {
    entityList = [];
    terminalVelocity = 200;
    gravity = 0.2;

    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID)
        this.ctx = this.canvas.getContext("2d")
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.startLoop();
    }

    addEntity(entity) {
        this.entityList.push(entity);
        entity.canvas = this.canvas;
        entity.ctx = this.ctx;
        entity.gameEngine = this;
        entity.terminalVelocity = this.terminalVelocity;
        entity.gravity = this.gravity;
        return entity
    }
    removeEntity(entity) {
        this.entityList.splice(this.entityList.indexOf(entity), 1);
    }
    update() {
        this.entityList.forEach(entity => {
            entity.update();
        });
    }

    checkCollisions(collider) {
        for (var i in this.entityList) {
            var otherEntity = this.entityList[i];
            if (collider.entity !== otherEntity && otherEntity.collider && collider.checkCollision(otherEntity)) {
                return true
            }
        }
        return false
    }


    draw() {
        this.entityList.forEach(entity => {
            entity.draw(this.ctx);
        });
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    startLoop() {
        this.loop = setInterval(() => {
            this.update();
            this.clear();
            this.draw();
        }, 16);
    }
}


// Constructs the base game entity 
class Entity {
    dx = 0
    dy = 0
    ddx = 0
    ddy = 0
    gravity = 0.1
    jumpHeight = 1
    jumpVelocity = 2
    hasGravity = true
    terminalVelocity = 2
    onGround = false
    canvas = null
    ctx = null
    collider = null;

    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.collider = new Collider(this)
    }

    draw(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    update() {

        this.collider.update()
        this.onGround = false;
        if (this.x < 0) {
            this.x = 0
        }
        if (this.x > this.canvas.width - this.width) {
            this.x = this.canvas.width - this.width
        }
        if (this.y < 0) {
            this.y = 0
        }
        if (this.y > this.canvas.height - this.height) {
            this.y = this.canvas.height - this.height
            this.onGround = true
        }
        this.dx += this.ddx
        this.dy += this.ddy



        this.dx = this.dx > this.terminalVelocity ? this.terminalVelocity : this.dx
        this.dx = this.dx < -this.terminalVelocity ? -this.terminalVelocity : this.dx
        this.dy = this.dy > this.terminalVelocity ? this.terminalVelocity : this.dy
        this.dy = this.dy < -this.terminalVelocity ? -this.terminalVelocity : this.dy
        this.ddx = 0
        this.ddy = 0
        if (this.hasGravity && !this.onGround) {
            this.dy += this.gravity
        }

        // Attempts to move in the x direction based on the velocity, if entity in the way then max distance moved, if no distance can be moved, x velocity goes to 0
        if (!this.attemptToMove(this.dx, 0)) {
            for (var i = this.dx; Math.abs(i) > 0; i = i > 0 ? i - 0.1 : i + 0.1) {
                if (this.attemptToMove(i, 0)) {
                    this.dx = 0;
                    break;
                }
            }
        }

        // Attempts to move in the y direction based on the velocity, if entity in the way then max distance moved, if no distance can be moved, y velocity goes to 0
        if (!this.attemptToMove(0, this.dy)) {
            for (var i = this.dy; Math.abs(i) > 0; i = i > 0 ? i - 0.1 : i + 0.1) {
                if (this.attemptToMove(0, i)) {
                    break;
                }
            }
            this.dy = 0
            this.onGround = true;
        }
        return this
    }

    // Checks if position collides with any other entity
    checkCollisionAt(x, y) {
        return this.gameEngine.checkCollisions(this.collider.createTheoriticalBoundingBox(x, y))
    }

    attemptToMove(dx, dy) {
        if (this.checkCollisionAt(this.collider.x + dx, this.collider.y + dy)) {
            return false
        }
        this.x += dx
        this.y += dy
        return true
    }

    setVelocity(dx, dy) {
        this.dx = dx
        this.dy = dy
        return this
    }

    setXVelocity(dx) {
        this.dx = dx
        return this
    }
    setYVelocity(dy) {
        this.dy = dy
        return this
    }

    setX(x) {
        this.x = x
        return this
    }
    setY(y) {
        this.y = y
        return this
    }

    // Adds a force to the entity in the given directions
    addForces(ddx, ddy) {
        this.ddx += ddx
        this.ddy += ddy
        return this
    }
    // Adds force in the X direction
    addXForce(ddx) {
        this.ddx += dx
        return this
    }
    // Adds force in the Y direction
    addYForce(ddy) {
        this.ddy += ddy
        return this
    }

    // Returns entity's center
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
    }

    // Returns the entity's bounding box
    getBoundingBox() {
        return new BoundingBox(this.x, this.y, this.width, this.height)
    }

    // Sets the value of hasGravity
    setHasGravity(hasGravity) {
        this.hasGravity = hasGravity
        return this
    }
}




class BoundingBox {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    checkCollision(checkBoundingBox) {
        return (this.x < checkBoundingBox.x + checkBoundingBox.width &&
            this.x + this.width > checkBoundingBox.x &&
            this.y < checkBoundingBox.y + checkBoundingBox.height &&
            this.y + this.height > checkBoundingBox.y)
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
    }
}

class Collider extends BoundingBox {
    constructor(entity) {
        super(entity.x, entity.y, entity.width, entity.height)
        this.entity = entity;
    }

    // Returns a new theoritical bounding box used for collision detection
    createTheoriticalBoundingBox(x, y) {
        var temp = new BoundingBox(x, y, this.width, this.height)
        temp.entity = this.entity;
        return temp;
    }

    update() {
        this.x = this.entity.x
        this.y = this.entity.y
    }

}


class Rectangle extends Entity {
    constructor(x, y, width, height, color) {
        super(x, y, width, height)
        this.color = color
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

class Sprite extends Entity {
    constructor(x, y, width, height, image) {
        super(x, y, width, height)
        this.image = image
    }
    draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        // console.log("im here bb")
    }
}

class Circle extends Entity {
    constructor(x, y, radius, color) {
        super(x, y, radius * 2, radius * 2)
        this.radius = radius
        this.color = color
    }

    draw(ctx) {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

class Player extends Sprite {
    playerSpeed = 5
    canJump = true

    constructor(x, y, width, height, image) {
        super(x, y, width, height, image)
        window.addEventListener("keydown", (e) => {
            if (e.key == "a") {
                this.leftDown = true;
            }
            if (e.key == "w") {
                this.upDown = true;
            }
            if (e.key == "d") {
                this.rightDown = true;
            }
            if (e.key == "s") {
                this.downDown = true;
            }
        }, false)
        window.addEventListener("keyup", (e) => {
            if (e.key == "a") {
                this.leftDown = false;
            }
            if (e.key == "w") {
                this.upDown = false;
            }
            if (e.key == "d") {
                this.rightDown = false;
            }
            if (e.key == "s") {
                this.downDown = false;
            }
        }, false)
    }


    // If the movement buttons are pressed down move the player in that direction
    playerControls(canvas) {
        if (this.leftDown || this.rightDown) {
            this.setXVelocity(0)
        }

        // Player control checks
        if (this.rightDown && this.x < this.canvas.width - this.width) {
            // Checks if the player will collide with any other entity and attempts to move them as much as possible
            if (!this.attemptToMove(this.playerSpeed, 0)) {
                for (var i = this.playerSpeed; i > 0; i--) {
                    if (this.attemptToMove(i, 0)) {
                        break;
                    }
                }
            }
        }
        if (this.leftDown && this.x > 0) {
            // Checks if the player will collide with any other entity and attempts to move them as much as possible
            if (!this.attemptToMove(-this.playerSpeed, 0)) {
                for (var i = -this.playerSpeed; i < 0; i++) {
                    if (this.attemptToMove(i, 0)) {
                        break;
                    }
                }
            }
        }
        if (this.upDown && this.y > 0 && this.canJump) {
            this.addYForce(-this.jumpVelocity);
            this.canJump = false;
        }
        // Falls faster 
        if (this.downDown && this.y < this.canvas.height - this.height) {
            // Checks if the player will collide with any other entity and attempts to move them as much as possible
            if (!this.attemptToMove(0, this.playerSpeed)) {
                for (var i = this.playerSpeed; i > 0; i--) {
                    if (this.attemptToMove(0, i)) {
                        break;
                    }
                }
            }
        }
        // If the player is on the ground then the jump button can be pressed again
        this.onGround ? this.canJump = true : null;
        return this
    }

    update(canvas) {
        this.playerControls(canvas);
        super.update()
    }
}






test = new GameEngine(canvasId)
var testImg = document.getElementById("testies")
console.log(testImg)
test.addEntity(new Player(0, 0, 50, 150, testImg).setVelocity(1, 0))
test.addEntity(new Rectangle(100, 500, 500, 50, "#FFF").setHasGravity(false))