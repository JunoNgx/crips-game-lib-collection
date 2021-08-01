title = "";

description = `
`;

const G = {
    WIDTH: 128,
    HEIGHT: 128,

    MISSILE_SPD: 0.5,
    MISSILE_TURN_SPD: 0.05,
}
const BARREL_POS = vec(G.WIDTH * 0.5, G.HEIGHT * 0.82);

characters = [];

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

/** @typedef { {pos: Vector, vel: Vector, angle: number} } Missile */
/** @type { Missile } */
let missile;

function update() {
    if (!ticks) {
        missile = null;
    }

    color("light_black");
    rect(G.WIDTH * 0.0, G.HEIGHT * 0.930, G.WIDTH * 1.0, G.HEIGHT * 0.075);
    rect(G.WIDTH * 0.4, G.HEIGHT * 0.875, G.WIDTH * 0.2, G.HEIGHT * 0.075); 
    color("blue");
    rect(G.WIDTH * 0.48, G.HEIGHT * 0.82, G.WIDTH * 0.04, G.HEIGHT * 0.08);

    if (missile === null) {
        missile = {
            pos: vec(BARREL_POS.x, BARREL_POS.y),
            vel: vec(0, -G.MISSILE_SPD),
            angle: -PI/2
        }
        color("yellow");
        particle(BARREL_POS, 15, 1.6, -PI/2, PI/4);
    }

    if (missile) {
        missile.pos.add(missile.vel);
        missile.vel = vec(G.MISSILE_SPD, 0).rotate(missile.angle);

        color("black");
        // box(missile.pos, 3);
        bar(missile.pos, 4, 2, missile.angle);
        color("cyan");
        bar(missile.pos, 1, 1, missile.angle+PI/2, 3);
        bar(missile.pos, 1, 1, missile.angle-PI/2, 3);
        color("red");
        bar(missile.pos, 2, 1, missile.angle, -1);

        color("yellow");
        particle(missile.pos, 1, 0.4, missile.angle+PI, PI/4);

        if (input.isPressed && input.pos.x >= G.WIDTH * 0.5) {
            missile.angle += G.MISSILE_TURN_SPD;
        } else if (input.isPressed && input.pos.x < G.WIDTH * 0.5) {
            missile.angle -= G.MISSILE_TURN_SPD;
        }

        if (!missile.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)) missile = null;
    }



}
