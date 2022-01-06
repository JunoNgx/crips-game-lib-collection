title = "FLIGHT 8"

description = `
Cross the
green lines

[Left half]
  turn left
[Right half]
  turn right
`

const G = {
    WIDTH: 100,
    HEIGHT: 100,

    PLAYER_MOVE_SPD: 0.8,
    PLAYER_TURN_SPD: 0.05,
    PLAYER_PROTECTION_TIME: 60,

    HOOP_RADIUS: 12,

    MAX_HP: 420,
    VALUE_SINGLE_HOOP: 60,
    VALUE_WHOLE_ROUND: 240,
    NO_OF_ROUND_FOR_INCREMENT: 2,
    MAX_NO_OF_HOOPS_PER_ROUND: 5,
}

characters = [
` 
  LL
 LLLL
LLLLLL
LLLLLL
 LLLL
  LL
`
]

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "dark",
    isDrawingScoreFront: true,
    isPlayingBgm: true,
    isReplayEnabled: true,
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 3,
    seed: 181
}

/**
 * @typedef {{pos: Vector, angle: number}} Hoop
 **/

/** @type { {pos: Vector, vel: Vector} [] } */
let clouds
/** @type { {pos: Vector, vel: Vector, angle: number, protectionTimer: number} } */
let player
/** @type { Hoop[] } */
let hoops

/** @type { number } */
let hp
/** @type { number } */
let roundHoopsAmt
/** @type { number } */
let roundHoopsAmtIncrementCount
/** @type { number } */
let multiplier


function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.3),
            vel: vec(0, -G.PLAYER_MOVE_SPD),
            angle: -PI/2,
            protectionTimer: 0
        }
        clouds = times(10, () => {
            return {
                pos: vec(rnd(0, G.WIDTH), rnd(0, G.HEIGHT)),
                vel: vec(0, rnd(0.05, 0.2))
            }
        })
        hoops = [{
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.7),
            angle: 0
        }]
        hp = G.MAX_HP
        roundHoopsAmt = 1
        roundHoopsAmtIncrementCount = 1
        multiplier = 1
    }

    // Mechanical updates
    hp--
    if (hp < 0) {
        end("Timeout")
        play('hit')
    }
    if (hp > G.MAX_HP) hp = G.MAX_HP
    
    if (hoops.length === 0) {

        player.protectionTimer = G.PLAYER_PROTECTION_TIME
        hp += G.VALUE_WHOLE_ROUND
        addScore(multiplier, vec(G.WIDTH * 0.5, G.HEIGHT * 0.25))
        multiplier++

        for (let i = 0; i < roundHoopsAmt; i++) {

            let position = vec(
                rnd(G.WIDTH * 0.2, G.WIDTH * 0.8), 
                rnd(G.HEIGHT * 0.2, G.HEIGHT * 0.8)
            )
            let isDistanceSufficient = false
            while (!isDistanceSufficient) {
                isDistanceSufficient = true
                for (let h of hoops) {
                    if (position.distanceTo(h.pos) < G.WIDTH * 0.2
                    || position.distanceTo(player.pos) < G.WIDTH * 0.2) {
                        isDistanceSufficient = false
                        break
                    }
                }

                if (!isDistanceSufficient) {
                    position = vec(
                        rnd(G.WIDTH * 0.2, G.WIDTH * 0.8), 
                        rnd(G.HEIGHT * 0.2, G.HEIGHT * 0.8)
                    )
                }
            }

            hoops.push({
                pos: position,
                angle: rnd(PI*2)
            })
        }

        roundHoopsAmtIncrementCount++
        if (roundHoopsAmtIncrementCount > G.NO_OF_ROUND_FOR_INCREMENT) {
            console.log(roundHoopsAmtIncrementCount)
            roundHoopsAmt = 
                (roundHoopsAmt === G.MAX_NO_OF_HOOPS_PER_ROUND)
                ? G.MAX_NO_OF_HOOPS_PER_ROUND
                : roundHoopsAmt + 1
            roundHoopsAmtIncrementCount = 1
        }

        play('select')
    }

    // Entity updates
    clouds.forEach((c) => {
        c.pos.add(c.vel)
        c.pos.wrap(0, G.WIDTH, 0, G.HEIGHT)

        color("light_black")
        box(c.pos, 2)
    })

    player.pos.add(player.vel)
    player.vel = vec(G.PLAYER_MOVE_SPD, 0).rotate(player.angle)
    player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT)
    if (player.protectionTimer > 0) player.protectionTimer--

    color("black")
    bar(player.pos, 4, 2, player.angle)
    bar(player.pos, 4, 2, player.angle)
    color("cyan")
    bar(player.pos, 1, 1, player.angle+PI/2, 3)
    bar(player.pos, 1, 1, player.angle-PI/2, 3)
    color("red")
    bar(player.pos, 2, 1, player.angle, -1)

    color("yellow")
    particle(player.pos, 1, 0.4, player.angle+PI, PI/3)

    if (player.protectionTimer > 0) {
        color("light_yellow")
        arc(player.pos, 7, 1, 0, PI*2)
    }

    if (input.isPressed && input.pos.x >= G.WIDTH * 0.5) {
        player.angle += G.PLAYER_TURN_SPD
    } else if (input.isPressed && input.pos.x < G.WIDTH * 0.5) {
        player.angle -= G.PLAYER_TURN_SPD
    }

    remove(hoops, hoop => {
        const p1 = vec(hoop.pos.x, hoop.pos.y)
            .addWithAngle(hoop.angle, G.HOOP_RADIUS)
        const p2 = vec(hoop.pos.x, hoop.pos.y)
            .addWithAngle(hoop.angle+PI, G.HOOP_RADIUS)

        color("green")
        const isCollidingThroughHoop = line(p1, p2, 2).isColliding.rect.black
        color("light_red")
        const isCollidingWithPole1 = box(p1, 4).isColliding.rect.black
        const isCollidingWithPole2 = box(p2, 4).isColliding.rect.black

        if ((isCollidingWithPole1 || isCollidingWithPole2)
        && player.protectionTimer <= 0) {
            end("Crashed")
            play('explosion')
        }

        if (isCollidingThroughHoop) {
            color("yellow")
            particle(player.pos)
            
            play("laser")
            addScore(1, player.pos)
            hp += G.VALUE_SINGLE_HOOP
        }

        return isCollidingThroughHoop
    })

    color("light_green")
    const fillRatio = hp/G.MAX_HP
    rect(1, 97, 98 * fillRatio, 2)
}
