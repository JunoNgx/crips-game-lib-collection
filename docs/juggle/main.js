title = "JUGGLE";

description = `
Don't drop.

Heal every
7 hits.
`;

characters = [
`
 r rr
rrrrrr
rrrrrr
 rrrr
  rr
   r
`
];

const G = {
    WIDTH: 100,
    HEIGHT: 140,

    GRAVITY: 0.05,

    PADDLE_LENGTH: 17,
    PADDLE_HEIGHT: 1,

    BALL_RADIUS: 2.4,
    BALL_OUTLINE_THICKNESS: 1.2,
    BALL_SPD_MIN: 0.7,
    BALL_SPD_MAX: 1.3,

    COLLISION_CORRECTION: 3,

    BOUNCE_VELOCITY_MIN: 2.4,
    BOUNCE_VELOCITY_MAX: 3.2,

    SPAWN_RATE: 300,
    HEAL_RATE: 10
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "shape",
    isDrawingParticleFront: true,
    isPlayingBgm: true,
    isReplayEnabled: true,
    isCapturing: false,
    seed: 87
};

/**
 * @typedef {{
 * pos: Vector,
 * }} Paddle
 */

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector,
 * }} Ball
 */

/**
 * @typedef {{
 * spawnCooldown: number,
 * healHitCooldown: number
 * }} Mechanic
 */

/**
 * @type { Paddle }
 */
let paddle;

/**
 * @type { Ball [] }
 */
let balls;

/**
 * @type { number }
 */
let hp;

/**
 * @type { Mechanic }
 */
let mech;

function update() {
    if (!ticks) {
        paddle = { pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.87) };
        balls = [];

        hp = 3;
        mech = {
            spawnCooldown: G.SPAWN_RATE,
            healHitCooldown: G.HEAL_RATE
        }
    }

    if (balls.length === 0) addBall();

    // Progress
    mech.spawnCooldown--;
    if (mech.spawnCooldown <= 0) {
        mech.spawnCooldown = G.SPAWN_RATE;
        addBall();
        play("coin");
    }
    if (mech.healHitCooldown <= 0) {
        mech.healHitCooldown = G.HEAL_RATE;
        hp++;
        play("powerUp");
    }
    if (hp <= 0) {
        end();
        play("lucky");
    }

    // HP Bar
    color("red");
    for (let i = 0; i < hp; i++) {
        char("a", 4 + (i*8), 10);
    }

    // Player
    paddle.pos.x = input.pos.x;
    paddle.pos.x = clamp(paddle.pos.x, 0, G.WIDTH);

    color("light_green");
    rect(
        paddle.pos.x - G.PADDLE_LENGTH/2,
        paddle.pos.y - G.PADDLE_HEIGHT/2,
        G.PADDLE_LENGTH,
        G.PADDLE_HEIGHT
    );

    // Balls
    remove(balls, (b) => {
        b.pos.add(b.vel);
        b.vel.y += G.GRAVITY;

        if (b.pos.x < 0) {
            b.vel.x = rnd(G.BALL_SPD_MIN, G.BALL_SPD_MAX);

            color("yellow");
            particle(b.pos, 10, 1, 0, PI/4);
            play("hit");
        }
        if (G.WIDTH < b.pos.x) {
            b.vel.x = -rnd(G.BALL_SPD_MIN, G.BALL_SPD_MAX);

            color("yellow");
            particle(b.pos, 10, 1, -PI, PI/4);
            play("hit");
        }

        color("cyan");
        const collidingWithPaddle =
            arc(b.pos, G.BALL_RADIUS, G.BALL_OUTLINE_THICKNESS)
                .isColliding.rect.light_green;

        if (collidingWithPaddle) {
            b.pos.y -= G.COLLISION_CORRECTION;
            b.vel.y =
                -rnd(G.BOUNCE_VELOCITY_MIN, G.BOUNCE_VELOCITY_MAX);

            mech.healHitCooldown--;
            addScore(balls.length, b.pos);

            color("yellow");
            particle(b.pos, 10, 1, -PI/2, PI/4);
            play("laser");
        }

        const isDropped = b.pos.y > G.HEIGHT;
        if (isDropped) {
            hp--;
            color("yellow");
            particle(b.pos, 20, 4, -PI/2, PI/4);
            play("explosion");
        }

        return isDropped;
    });

    function addBall() {
        balls.push({
            pos: vec(G.WIDTH * 0.5, G.WIDTH * 0.3),
            vel: vec(rnd() > 0
                ? G.BALL_SPD_MIN
                : -G.BALL_SPD_MAX,
                0
            )
        })
        color("yellow");
        particle(vec(G.WIDTH * 0.5, G.WIDTH * 0.3));
    }
}
