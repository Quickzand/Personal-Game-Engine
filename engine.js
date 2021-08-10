const canvasId = "gameEngine"

class GameEngine {
    entityList = [];
    constructor(canvasID) {
        this.canvas = document.getElementById(canvasID)
        this.ctx = this.canvas.getContext("2d")
        this.startLoop();
    }

    addEntity(entity) {
        this.entityList.push(entity);
    }
    removeEntity(entity) {
        this.entityList.splice(this.entityList.indexOf(entity), 1);
    }
    update() {
        this.entityList.forEach(entity => {
            entity.update();
        });
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



class Entity {
    dx = 0
    dy = 0


    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    draw(ctx) {
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    update() {
        this.x += this.dx
        this.y += this.dy
        return this
    }

    setVelocity(dx, dy) {
        this.dx = dx
        this.dy = dy
        return this
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

class Player extends Rectangle {
    constructor(x, y, width, height, color) {
        super(x, y, width, height, color)
        window.addEventListener("keydown", (e) => {
            console.log(e.key)
            if (e.key == "a") {
                this.setVelocity(-5, 0)
            }
            if (e.key == "w") {
                this.setVelocity(0, -5)
            }
            if (e.key == "d") {
                this.setVelocity(5, 0)
            }
            if (e.key == "s") {
                this.setVelocity(0, 5)
            }
        }, false)
    }


}



test = new GameEngine(canvasId)
test.addEntity(new Player(0, 0, 10, 10, "#FFF").setVelocity(1, 1))