title = "ORBITAL DEFENSE";

description = `
Defend Earth

[Tap] Rotate Gun
[Hold] Fire Gun






by Juno Nguyen
@JunoNgx
`;

characters = [
    `
  ll
 lbbl
llbbll
 lbbl
  ll
`,
    `
 ppppPp
ppppPpp
PPPPPpp
 ppppp
 pppPPP
ppPPPpp
`
];

// Game size
const G_WIDTH = 180;
const G_HEIGHT = 240;
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
const MOV_SPD = 0.02;
const MOV_SPD_SLOWED = 0.002;
const FIRE_RATE = 7;
const CROSSSHAIR_DISTANCE = 20;
const LONGPRESS_THRESHOLD = 10; // Unit: number of frames; 60 frames equate to one sec
const BULLET_SPD = 7;
const OFFSCREEN_MARGIN = G_WIDTH/5;

const ASTEROID_BASE_SPAWN_RATE = 50; // Unit: number of frames
const ASTEROID_ANGLE_VARIANCE = PI/3;
const ASTEROID_SPEED_MIN = 0.05;
const ASTEROID_SPEED_MAX = 0.15;
// const ASTEROID_SIZE_MIN = 3;
// const ASTEROID_SIZE_MAX = 6;
const ASTEROID_HP_MIN = 2;
const ASTEROID_HP_MAX = 6;
const ASTEROID_SELF_ANGLE_SPD_MIN = 0;
const ASTEROID_SELF_ANGLE_SPD_MAX = PI/90;

let lastJustPressed; // Timestamp of the last input, for longpress detection
let nextSpawn;

/** @type {{
 * pos: Vector,
 * angle: number,
 * speed: number,
 * hp: number
 * selfAngle: number,
 * selfAngleSpd: number
 * isPowerup: boolean
 * }[]} */
let asteroids;

/** @type {{
 * pos: Vector,
 * angle: number,
 * }[]} */
let bullets;

/** @type {{
 * pos: Vector,
 * hp: number,
 * isAlive: boolean
 * }[]} */
let explosions;

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
        nextSpawn = 0;

        stars = times(50, () => {
            return {
                pos: vec(rnd(G_WIDTH), rnd(G_HEIGHT))
            };
        })

        let angle = PI;
        player = {
            pos: vec(
                G_WIDTH/2 + ORB_RAD*cos(angle),
                G_HEIGHT/2 - ORB_RAD*sin(angle)
            ),
            posAngle: angle,
            gunAngle: -PI * 0.25,
            isFiring: false,
            lastShot: 0
        }

        bullets = [];
        asteroids = [];
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

    //====Spawning
    if (ticks > nextSpawn) {
        spawnAsteroid();
        nextSpawn = ticks + ASTEROID_BASE_SPAWN_RATE - difficulty*0.5;
    }

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
        G_WIDTH/2 + ORB_RAD*cos(player.posAngle),
        G_HEIGHT/2 - ORB_RAD*sin(player.posAngle)
    );
    if (player.isFiring) {
        if (ticks - player.lastShot > FIRE_RATE) {
            player.lastShot = ticks;
            bullets.push({
                pos: vec(player.pos.x, player.pos.y),
                angle: player.gunAngle
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

    color("black");
    char("a", player.pos);
    color("light_red"); // Draw the crosshair indicating the firing direction
    arc(
        player.pos.x + CROSSSHAIR_DISTANCE*cos(player.gunAngle),
        player.pos.y + CROSSSHAIR_DISTANCE*sin(player.gunAngle),
        2,
        1
    );

    asteroids.forEach((a) => {
        a.pos.x += a.speed*cos(a.angle);
        a.pos.y += a.speed*sin(a.angle);
        a.selfAngle += a.selfAngleSpd;

        if (!a.isPowerup) {
            color("purple");
            char("b", a.pos, {rotation: a.selfAngle});
        } else {
            color("cyan");
            char("b", a.pos, {rotation: a.selfAngle});
        }

    });

    bullets.forEach((b) => {
        b.pos.x += BULLET_SPD*cos(b.angle);
        b.pos.y += BULLET_SPD*sin(b.angle);
        
        color("yellow");
        box(b.pos, 2, 2).isColliding.rect.purple;
    });

    // Graphics/hitboxes and drawing must be handled before collision detection
    // Things drawn on top of hitboxes must be drawn after collision checks
    remove(asteroids, (a) => {
        
        const isOutOfBounds = isPosOutOfBounds(a.pos);

        color("purple");
        const isCollidingWithBullet
            = char("b", a.pos, {rotation: a.selfAngle}).isColliding.rect.yellow;
        let isCollidingWithPlayer = false;

        if (!a.isPowerup) {
            // Additional HP indicator if is not a powerup
            color("green");
            arc(a.pos, a.hp, 1);
        } else {
            color("cyan");
            isCollidingWithPlayer =
                char("b", a.pos, {rotation: a.selfAngle}).isColliding.char.a;
        }

        // This collision is shared by both type
        if (isCollidingWithBullet) {
            a.hp -= 1;
            play("hit");
        }

        if (isCollidingWithPlayer) {
            a.hp = 0;
            play("coin");
            addScore(10, a.pos);
        }

        if (!a.isPowerup && a.pos.distanceTo(EARTH_POS) < EARTH_RADIUS + 4) {
            color("red");
            text("X", a.pos);
            end();
        }

        return (a.hp <= 0 || isOutOfBounds);
    });

    remove(bullets, (b) => {
        color("yellow");
        const isCollidingWithAsteroid =
            box(b.pos, 2, 2).isColliding.char.b;
        const isOutOfBounds = isPosOutOfBounds(b.pos);


        if (isCollidingWithAsteroid) {
            color("yellow");
            particle(b.pos, 10, 1.5);
            play("hit");
        }

        return (isCollidingWithAsteroid || isOutOfBounds);
    });
    
    color("transparent");

    // ====Other functions
    function spawnAsteroid() {
        const QUADRANT = rndi(4);
        let x, y, angle, selfAngleSpdSign;

        switch (QUADRANT) {
            case 0:
                x = rnds(-OFFSCREEN_MARGIN, G_WIDTH+OFFSCREEN_MARGIN) 
                y = -rnd(OFFSCREEN_MARGIN);
                break;

            case 1:
                x = rnd(OFFSCREEN_MARGIN);
                y = rnds(-OFFSCREEN_MARGIN, G_HEIGHT+OFFSCREEN_MARGIN) 
                break;

            case 2:
                x = rnds(-OFFSCREEN_MARGIN, G_WIDTH+OFFSCREEN_MARGIN) 
                y = rnd(OFFSCREEN_MARGIN);
                break;

            case 3:
                x = -rnd(OFFSCREEN_MARGIN);
                y = rnds(-OFFSCREEN_MARGIN, G_HEIGHT+OFFSCREEN_MARGIN) 
                break;
        }

        angle = atan2(EARTH_POS.y - y, EARTH_POS.x - x)
            + rnd(ASTEROID_ANGLE_VARIANCE) - ASTEROID_ANGLE_VARIANCE/2;
        selfAngleSpdSign = (rnd() < 0.5) ? 1 : -1;

        asteroids.push({
            pos: vec(x, y),
            angle: angle,
            speed: rnd(ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX),
            // size: rndi(ASTEROID_SIZE_MIN, ASTEROID_SIZE_MAX),
            hp: rndi(ASTEROID_HP_MIN, ASTEROID_HP_MAX),
            selfAngle: rnd(PI*2),
            selfAngleSpd: rnd(ASTEROID_SELF_ANGLE_SPD_MIN, ASTEROID_SELF_ANGLE_SPD_MAX) * selfAngleSpdSign,
            isPowerup: (rnd() > 0.8)
        })
    }

    function isPosOutOfBounds(pos) {
        return (pos.x > G_WIDTH + OFFSCREEN_MARGIN
        || pos.x < -OFFSCREEN_MARGIN
        || pos.y > G_HEIGHT + OFFSCREEN_MARGIN
        || pos.y < -OFFSCREEN_MARGIN);
    }
}
