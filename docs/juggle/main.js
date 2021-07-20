title = "JUGGLE";

description = `
Don't drop.
Don't overthrow.

[Tap]
  Catch
  and throw.
`;

characters = [];

const G = {
    WIDTH: 100,
    HEIGHT: 120,

    GRAVITY: 1,

    PADDLE_LENGTH: 10,
    PADDLE_HEIGHT: 1,

    BALL_RADIUS: 2,
    BALL_SPD_HORIZONTAL: 2
};

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
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

function update() {
    if (!ticks) {
        paddle = { pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.9) };
        balls = [];
        addBall();
    }

    paddle.pos.x = input.pos.x;
    paddle.pos.x = clamp(paddle.pos.x, 0, G.WIDTH);

    color("cyan");
    rect(
        paddle.pos.x - G.PADDLE_LENGTH/2,
        paddle.pos.y - G.PADDLE_HEIGHT/2,
        G.PADDLE_LENGTH,
        G.PADDLE_HEIGHT
    );

    function addBall() {
        balls.push({
            pos: vec(G.WIDTH * 0.5, G.WIDTH * 0.3),
            vel: vec(rnd() > 0
                ? G.BALL_SPD_HORIZONTAL
                : -G.BALL_SPD_HORIZONTAL,
                0
            )
        })
    }
}
