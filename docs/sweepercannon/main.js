title = "SWEEPER CANNON"

description = `
Survive.

[Tap]
  Fire/Detonate
`

characters = [
`
 cccc
 cllc
 llll
  ll
 llll
yyyyyy
`,
`
g    g
 gppg
pppppp
 pggp
pp  pp
`,
`
  c
 ccc
ccrcc
 ccc
  c
`
]

const G = {
    WIDTH: 92,
    HEIGHT: 92,
    MISSILE_SPD: 0.5,
    BARREL_LENGTH: 3,
    RELOAD_TIME: 60,
    ROTATION_RANGE: 0.4,
    CANNON_ROTATION_SPD: 0.06,
    SPAWN_RATE_BASE: 120,
    ENEMY_SPD_MIN: 0.05,
    ENEMY_SPD_MAX: 0.12,
    EXPLOSION_BASE_RADIUS: 8,
}

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    isPlayingBgm: true,
    isReplayEnabled: true,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 3,
    seed: 8
}

/** 
 * @type {{
 * pos: Vector,
 * angle: number,
 * isRotating: boolean,
 * isRotatingRight: boolean,
 * reloadTimer: number,
 * isReadyToFire: boolean
 * }}
**/
let cannon
/** @type { {pos: Vector, vel: Vector, angle: number} } */
let missile
/** @type { {pos: Vector, vel: Vector} [] } */
let enemies
/** @type { {pos: Vector, lifetime: number} [] } */
let explosions
/** @type { number } */
let spawnCooldown
/** @type { number } */
let multiplier

function update() {
    if (!ticks) {
        cannon = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.84),
            angle: -PI/2,
            isRotating: true,
            isRotatingRight: true,
            reloadTimer: 0,
            isReadyToFire: true
        }
        missile = null
        enemies = []
        explosions = []
        spawnCooldown = G.SPAWN_RATE_BASE
        multiplier = 1
    }

    // Mechanics
    spawnCooldown--
    if (spawnCooldown <= 0) {

        let destVec = vec(cannon.pos.x, cannon.pos.y)
        let initVec = vec(
            rnd(G.WIDTH * -0.2, G.WIDTH * 1.2),
            rnd(G.HEIGHT * - 0.2, G.HEIGHT * 0.6)
        )
        while (initVec.isInRect(0, 0, G.WIDTH, G.HEIGHT)) {
            initVec = vec(
                rnd(G.WIDTH * -0.2, G.WIDTH * 1.2),
                rnd(G.HEIGHT * - 0.2, G.HEIGHT * 0.6)
            )
        } 

        enemies.push({
            pos: initVec,
            vel: vec(rnd(G.ENEMY_SPD_MIN, G.ENEMY_SPD_MAX) * difficulty, 0)
                .rotate(initVec.angleTo(destVec))
        })

        spawnCooldown = G.SPAWN_RATE_BASE - difficulty*20
    }
    
    if (input.isJustPressed) {

        if (missile === null && cannon.isReadyToFire) { // Fire a missile

            const initPos = vec(cannon.pos.x, cannon.pos.y)
                .addWithAngle(cannon.angle, G.BARREL_LENGTH)
    
            missile = {
                pos: initPos,
                vel: vec(G.MISSILE_SPD, 0).rotate(cannon.angle),
                angle: cannon.angle
            }

            multiplier = 1
            cannon.reloadTimer = G.RELOAD_TIME
            cannon.isReadyToFire = false
    
            color("yellow")
            particle(initPos, 7, 2, cannon.angle, PI/4)
            play("powerUp")

        } else if (missile !== null) { // Else detonate the missile

            explosions.push({
                pos: vec(missile.pos.x, missile.pos.y),
                lifetime: 0
            })
            color("red")
            particle(missile.pos, 20, 3)
            missile = null
            play("select")

        }
    }

    // Entities

    // The ground
    color("light_black")
    rect(G.WIDTH * 0.0, G.HEIGHT * 0.94, G.WIDTH * 1.0, G.HEIGHT * 0.075)
    rect(G.WIDTH * 0.4, G.HEIGHT * 0.88, G.WIDTH * 0.21, G.HEIGHT * 0.075) 

    // Cannon
    if (!missile && cannon.isReadyToFire) {
        if (cannon.isRotatingRight) {
            cannon.angle += G.CANNON_ROTATION_SPD
            if (cannon.angle > -PI*(0.5 - G.ROTATION_RANGE))
                cannon.isRotatingRight = false
        } else {
            cannon.angle -= G.CANNON_ROTATION_SPD
            if (cannon.angle < -PI*(0.5 + G.ROTATION_RANGE))
                cannon.isRotatingRight = true
        }
    }
    if (cannon.reloadTimer > 0 && missile === null) cannon.reloadTimer--
    if (!cannon.isReadyToFire && cannon.reloadTimer <= 0) {
        cannon.isReadyToFire = true
        play("jump")

        color("cyan")
        particle(cannon.pos, 10, 1)
    }

    color("light_green")
    if (!missile && cannon.reloadTimer <= 0) {
        // Aiming line
        bar(cannon.pos, 30, 1, cannon.angle, 0.01)
    } else {
        // Reload progress
        arc(cannon.pos, 6, 1, 0,
            (G.RELOAD_TIME - cannon.reloadTimer)/G.RELOAD_TIME * PI*2
        )
    }

    // The actual cannon sprite
    color("black")
    char("a", cannon.pos)

    // Missile
    if (missile) {
        missile.pos.add(missile.vel)
        color("red")
        particle(missile.pos, 2, 0.4, missile.angle+PI, PI/1.5)
        color("black")
        char("c", missile.pos)

        if (missile.pos.y < 0
        || missile.pos.x < 0
        || missile.pos.x > G.WIDTH)
            missile = null
    }

    remove(explosions, (e) => {
        e.lifetime++
        const radius = sin(e.lifetime * 0.2) * G.EXPLOSION_BASE_RADIUS

        color("red")
        arc(e.pos, radius)
        return (radius < 0)
    })

    remove(enemies, (e) => {
        e.pos.add(e.vel)

        color("black")
        const isCollidingWithExplosion = char("b", e.pos)
            .isColliding.rect.red

        const isCollidingWithPlayer = char("b", e.pos)
            .isColliding.char.a

        if (isCollidingWithExplosion) {
            addScore(10 * multiplier, e.pos)
            multiplier++
            color("purple")
            particle(e.pos, 10, 2)
            play("explosion")
        }

        if (isCollidingWithPlayer) {
            end()
            play("lucky")
            color("red")
            text("x", cannon.pos)
        }

        return (isCollidingWithExplosion)
    })
}
