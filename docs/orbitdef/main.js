title = "ORBITAL DEFENSE";

description = `
Defend Earth
from Asteroids

[Tap] Rotate
[Hold] Fire
`;

characters = [];

// Game size
const G_WIDTH = 180;
const G_HEIGHT = 180;
options = {
    viewSize: {x: G_WIDTH, y: G_HEIGHT},
    theme: "crt",
    // isPlayingBgm: true,
    isPlayingBgm: false,
    isReplayEnabled: true,
    seed: 2
};

// Game design variables
const ORB_RAD = 55;
const MOV_SPD = 0.015;
const MOV_SPD_SLOWED = 0.0075;
const FIRE_RATE = 10;
const CROSSSHAIR_DISTANCE = 20;
const LONGPRESS_THRESHOLD = 10; // Unit: number of frames; 60 frames equate to one sec
const BULLET_SPD = 10;
const SPAWN_RATE = 5;
const OFFSCREEN_MARGIN = G_WIDTH/5;

let lastJustPressed = 0; // Timestamp of the last input, for longpress detection

/** @type {Vector}[] */
let asteroids;

/** @type {{
 * pos: Vector,
 * angle: number,
 * isAlive: boolean
 * }[]} */
let bullets;

/**@type {{
 * pos: Vector,
 * posAngle: number,
 * gunAngle: number
 * isFiring: boolean,
 * lastShot: number // timestamp of the last bullet fired
 * }} */
let player;

let stars;

function update() {

    // ====Game init
    if (!ticks) {
        stars = times(50, () => {
            return {
                pos: vec(rnd(G_WIDTH), rnd(G_HEIGHT))
            };
        })

        let angle = PI;
        player = {
            pos: vec(
                G_WIDTH/2 + ORB_RAD*Math.cos(angle),
                G_HEIGHT/2 - ORB_RAD*Math.sin(angle)
            ),
            posAngle: angle,
            gunAngle: -PI * 0.25,
            isFiring: false,
            lastShot: 0
        }

        bullets = [];
    }

    // Draw the stars
    color("cyan");
    stars.forEach((s) => {
        box(s.pos, 1, 1);
    });

    // Drawing earth
    const EARTH_POS = vec(G_WIDTH/2, G_HEIGHT/2);
    const EARTH_RADIUS = 12;
    color("blue");
    arc(EARTH_POS, EARTH_RADIUS, 10);
    color("green");
    arc(EARTH_POS.x + 4, EARTH_POS.y - 3, 4, 8)
    arc(EARTH_POS.x + 1, EARTH_POS.y + 3, 3, 4)
    arc(EARTH_POS.x + 1, EARTH_POS.y + 8, 2, 2)
    arc(EARTH_POS.x - 3, EARTH_POS.y - 1, 3, 3)
    // The island on the bottom left
    arc(EARTH_POS.x - 8, EARTH_POS.y + 9, 2, 3)
    // Clouds
    // color("light_black");
    // arc(EARTH_POS.x - 7, EARTH_POS.y - 7, 3, 5)
    // arc(EARTH_POS.x - 10, EARTH_POS.y - 4, 3, 3)

    // ====Hanlding input
    // Longpress/hold to fire
    // Shorttap to switch direction
    let isPassingThreshold = ticks - lastJustPressed > LONGPRESS_THRESHOLD;
    if (input.isJustPressed) {
        lastJustPressed = ticks;
    } else if (input.isPressed) {
        if (isPassingThreshold) player.isFiring = true;
    } else if (input.isJustReleased) {
        if (!isPassingThreshold) {
            play("select");
            player.gunAngle -= PI * 0.5;
        }
        player.isFiring = false;
    }

    // ====Player
    let movSpd = player.isFiring ? MOV_SPD_SLOWED : MOV_SPD;
    player.posAngle -= movSpd;
    player.pos = vec(
        G_WIDTH/2 + ORB_RAD*Math.cos(player.posAngle),
        G_HEIGHT/2 - ORB_RAD*Math.sin(player.posAngle)
    );
    if (player.isFiring) {
        if (ticks - player.lastShot > FIRE_RATE) {
            player.lastShot = ticks;
            bullets.push({
                pos: vec(player.pos.x, player.pos.y),
                angle: player.gunAngle,
                isAlive: true
            });
            color("yellow");
            particle(
                player.pos,
                5,
                1,
                player.gunAngle,
                PI/2
            );
            play("laser");
        }
    }

    // Drawing player
    char("a", player.pos);
    // Draw the crosshair indicating the firing direction
    color("light_red");
    arc(
        player.pos.x + CROSSSHAIR_DISTANCE*Math.cos(player.gunAngle),
        player.pos.y + CROSSSHAIR_DISTANCE*Math.sin(player.gunAngle),
        2,
        1
    );

    // ====Bullets
    bullets.forEach((b) => {
        b.pos.x += BULLET_SPD*Math.cos(b.angle);
        b.pos.y += BULLET_SPD*Math.sin(b.angle);
        color("yellow");
        // arc(b.pos, 1, 1);
        box(b.pos, 2, 2);
        if (b.pos.distanceTo(vec(EARTH_POS))<EARTH_RADIUS) {
            color("yellow");
            particle(b.pos, 10, 1.5);
            b.isAlive = false;
        }
        // TODO Collision with astreroids
        if (b.pos.x > G_WIDTH + OFFSCREEN_MARGIN
        || b.pos.x < -OFFSCREEN_MARGIN
        || b.pos.y > G_HEIGHT + OFFSCREEN_MARGIN
        || b.pos.y < -OFFSCREEN_MARGIN) b.isAlive = false;
    });
    remove(bullets, (b) => !b.isAlive);
}
