title = "";
// title = "FLIGHT 8";

description = `
`;

const G = {
    WIDTH: 100,
    HEIGHT: 100,

    PLAYER_MOVE_SPD: 0.8,
    PLAYER_TURN_SPD: 0.05,

    HOOP_RADIUS: 12,

    MAX_HP: 420,
    SINGLE_HOOP_VALUE: 60,
    WHOLE_ROUND_VALUE: 300,
    NO_OF_ROUND_FOR_INCREMENT: 2,
    MAX_NO_OF_HOOPS_PER_ROUND: 5,

    // BARREL_LENGTH: 8,

    // BULLET_SPD: 2,

    // SPAWN_RATE_BASE: 120,
    // ENEMY_SPD_MIN: 0.03,
    // ENEMY_SPD_MAX: 0.10,
    // EXPLOSION_BASE_RADIUS: 8,
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
];

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "dark",
    // isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    // isPlayingBgm: true,
    // isReplayEnabled: true,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 2,
    seed: 1
};

/**
 * @typedef {{pos: Vector, angle: number}} Hoop
 **/

/** @type { {pos: Vector, vel: Vector} [] } */
let clouds
/** @type { {pos: Vector, vel: Vector, angle: number} } */
let player;
/** @type { Hoop[] } */
let hoops;

/** @type { number } */
let hp
/** @type { number } */
let numberOfHoopsPerRound
/** @type { number } */
let currentRound

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
            vel: vec(0, -G.PLAYER_MOVE_SPD),
            angle: PI/2
        }
        clouds = times(10, () => {
            return {
                pos: vec(rnd(0, G.WIDTH), rnd(0, G.HEIGHT)),
                vel: vec(0, rnd(0.05, 0.2))
            }
        });
        hoops = [];
        hp = G.MAX_HP
        numberOfHoopsPerRound = 1
        currentRound = 1
    }

    // Mechanical updates
    hp--

    // Entity updates
    clouds.forEach((c) => {
        c.pos.add(c.vel);
        c.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

        color("light_black");
        // char("a", c.pos, { scale: {x: 1, y: 1} });
        box(c.pos, 2);
    });
    
    if (hoops.length === 0) {
        for (let i = 0; i<numberOfHoopsPerRound; i++) {

            let position = vec(
                rnd(G.WIDTH * 0.2, G.WIDTH * 0.8), 
                rnd(G.HEIGHT * 0.2, G.HEIGHT * 0.8)
            );
            let isDistanceSufficient = false
            while (!isDistanceSufficient) {
                isDistanceSufficient = true
                for (let h of hoops) {
                    if (position.distanceTo(h.pos) < G.WIDTH * 0.3
                    || position.distanceTo(player.pos) < G.WIDTH * 0.3) {
                        isDistanceSufficient = false
                        break
                    }
                }

                if (!isDistanceSufficient) {
                    position = vec(
                        rnd(G.WIDTH * 0.2, G.WIDTH * 0.8), 
                        rnd(G.HEIGHT * 0.2, G.HEIGHT * 0.8)
                    );
                }
            }

            hoops.push({
                pos: position,
                angle: rnd(PI*2)
            })
        }

        currentRound++
        if (currentRound > G.NO_OF_ROUND_FOR_INCREMENT) {
            numberOfHoopsPerRound = Math.max(
                numberOfHoopsPerRound++,
                G.MAX_NO_OF_HOOPS_PER_ROUND
            )
            currentRound = 1
        }
    }

    player.pos.add(player.vel);
    player.vel = vec(G.PLAYER_MOVE_SPD, 0).rotate(player.angle);
    player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    color("black");
    const isCollidingThroughHoop = bar(player.pos, 4, 2, player.angle)
        .isColliding.rect.green;
    const isCollidingWithHoopPole = bar(player.pos, 4, 2, player.angle)
        .isColliding.rect.light_red
    color("cyan");
    bar(player.pos, 1, 1, player.angle+PI/2, 3);
    bar(player.pos, 1, 1, player.angle-PI/2, 3);
    color("red");
    bar(player.pos, 2, 1, player.angle, -1);

    color("yellow");
    particle(player.pos, 1, 0.4, player.angle+PI, PI/3);

    if (input.isPressed && input.pos.x >= G.WIDTH * 0.5) {
        player.angle += G.PLAYER_TURN_SPD;
    } else if (input.isPressed && input.pos.x < G.WIDTH * 0.5) {
        player.angle -= G.PLAYER_TURN_SPD;
    }

    remove(hoops, hoop => {
        const p1 = vec(hoop.pos.x, hoop.pos.y)
            .addWithAngle(hoop.angle, G.HOOP_RADIUS);
        const p2 = vec(hoop.pos.x, hoop.pos.y)
            .addWithAngle(hoop.angle+PI, G.HOOP_RADIUS);

        // color("light_red");
        // box(p1, 4);
        // box(p2, 4);
        // color("green");
        // line(p1, p2, 2);

        color("light_red")
        const isCollidingWithPole1 = box(p1, 4).isColliding.rect.black
        const isCollidingWithPole2 = box(p2, 4).isColliding.rect.black
        color("green")
        const isCollidingThroughHoop = line(p1, p2, 2).isColliding.rect.black

        if (isCollidingWithPole1 || isCollidingWithPole1) {
            end("Crashed")
        }

        if (isCollidingThroughHoop) {
            color("yellow")
            particle(player.pos)
            
            // play("coin");
            addScore(10, player.pos)
            // checkHoopRefill()
        }

        return isCollidingThroughHoop
    })

    // if (isCollidingThroughHoop) {
    //     color("yellow");
    //     particle(player.pos);
        
    //     // play("coin");
    //     addScore(10, player.pos);

    //     hoop = null;
    // }

    // if (isCollidingWithHoopPole) {
    //     end("Crashed");
    // }

    color("black");
    const fillRatio = hp/G.MAX_HP
    rect(1, 97, 98 * fillRatio, 2)

    // const checkHoopRefill = () => {
    //     if (hoops.length === 0) {
    //         currentRound++
    //         if (currentRound > G.NO_OF_ROUND_FOR_INCREMENT) {
    //             numberOfHoopsPerRound++
    //             currentRound = 1
    //         }
    //     }
    // }
}
