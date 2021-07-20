title = "JUGGLE";

description = `
Don't drop.
Don't overthrow.

[Tap]
  Catch
  and throw.
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
    HEIGHT: 120,

    GRAVITY: 0.05,

    PADDLE_LENGTH: 15,
    PADDLE_HEIGHT: 1,

    BALL_RADIUS: 2,
    BALL_SPD_MIN: 0.8,
    BALL_SPD_MAX: 1.2,

    COLLISION_CORRECTION: 1,

    BOUNCE_VELOCITY_MIN: 2.0,
    BOUNCE_VELOCITY_MAX: 3.0,
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
    isDrawingParticleFront: true,
    isPlayingBgm: false,
    isReplayEnabled: false,
    isCapturing: false
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

function update() {
    if (!ticks) {
        paddle = { pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.9) };
        balls = [];

        hp = 3;
        // addBall();
    }

    if (balls.length === 0) addBall();

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

        // b.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
        if (b.pos.x < 0) {
            b.vel.x = rnd(G.BALL_SPD_MIN, G.BALL_SPD_MAX);
            color("yellow");
            particle(b.pos, 10, 1, 0, PI/4);
        }
        if (G.WIDTH < b.pos.x) {
            b.vel.x = -rnd(G.BALL_SPD_MIN, G.BALL_SPD_MAX);
            color("yellow");
            particle(b.pos, 10, 1, -PI, PI/4);
        }

        color("cyan");
        const collidingWithPaddle =
            arc(b.pos, G.BALL_RADIUS, 1).isColliding.rect.light_green;

        if (collidingWithPaddle) {
            b.pos.y -= G.COLLISION_CORRECTION;
            b.vel.y =
                -rnd(G.BOUNCE_VELOCITY_MIN, G.BOUNCE_VELOCITY_MAX);

            color("yellow");
            particle(b.pos, 10, 1, -PI/2, PI/4);
        }
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
    }
}
