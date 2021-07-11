title = "ORBITAL DEFENSE";

description = `
[Tap] Rotate Gun
[Hold] Fire Gun

Defend Earth
Pickup blue items
for bonus points

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
pp
`
];

// Game size
const G_WIDTH = 120;
const G_HEIGHT = 120;
// Game design variables
const ORB_RAD = 30;
const MOV_SPD = 0.02;
const MOV_SPD_SLOWED = 0.002;
const FIRE_RATE = 7;
const CROSSSHAIR_DISTANCE = 20;
const LONGPRESS_THRESHOLD = 10; // Unit: number of frames; 60 frames equate to one sec
const BULLET_SPD = 7;
const MULTIPLIER_BONUS_DURATION = 150;
const OFFSCREEN_MARGIN = G_WIDTH/5;

const ASTEROID_BASE_SPAWN_RATE = 120; // Unit: number of frames
const ASTEROID_ANGLE_VARIANCE = PI/4;
const ASTEROID_SPEED_MIN = 0.05;
const ASTEROID_SPEED_MAX = 0.15;
const ASTEROID_HP_MIN = 2;
const ASTEROID_HP_MAX = 6;
const ASTEROID_SELF_ANGLE_SPD_MIN = 0;
const ASTEROID_SELF_ANGLE_SPD_MAX = PI/90;
const ASTEROID_POWERUP_CHANCE = 0.85;

const EXPLOSION_MAX_LIFETIME = 150;

options = {
    viewSize: {x: G_WIDTH, y: G_HEIGHT},
    theme: "dark",
    isPlayingBgm: true,
    isReplayEnabled: true,
    seed: 2
};

let lastJustPressed; // Timestamp of the last input, for longpress detection
let nextSpawn;
let multiplier;
let multiplierTimer;

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
 * lifetime: number,
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

/** @type {{
 * pos: Vector,
 * }[]} */
let stars;

function update() {

    // ====Game init
    if (!ticks) {
        multiplier = 1;
        multiplierTimer = 0;
        nextSpawn = 0;

        stars = times(20, () => {
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

        asteroids = [];
        bullets = [];
        explosions = [];
    }

    // Draw the stars
    color("cyan");
    stars.forEach((s) => {
        box(s.pos, 1, 1);
    });

    // Drawing earth
    const EARTH_POS = vec(G_WIDTH/2, G_HEIGHT/2);
    const EARTH_RADIUS = 8;
    color("blue");
    arc(EARTH_POS, EARTH_RADIUS, 10);
    color("green");
    arc(EARTH_POS.x + 4, EARTH_POS.y - 3, 3, 3)
    arc(EARTH_POS.x - 3, EARTH_POS.y - 2, 1, 4)
    arc(EARTH_POS.x + 2, EARTH_POS.y + 2, 1, 4)
    arc(EARTH_POS.x + 2, EARTH_POS.y + 6, 1, 2)
    // The island on the bottom left
    arc(EARTH_POS.x - 8, EARTH_POS.y + 9, 1, 2)
    // Clouds
    // color("light_black");
    // arc(EARTH_POS.x - 7, EARTH_POS.y - 7, 3, 5)
    // arc(EARTH_POS.x - 10, EARTH_POS.y - 4, 3, 3)

    // DEBUG
    // color("cyan");
    // text(multiplier.toString(), 10, 10);
    // text(multiplierTimer.toString(), 10, 20);

    //====Spawning
    if (ticks > nextSpawn) {
        spawnAsteroid();
        nextSpawn = ticks + ASTEROID_BASE_SPAWN_RATE - 60*difficulty*0.2;
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

    // ====Multiplier handling
    if (multiplier > 1) {
        if (multiplierTimer > 0) {
            multiplierTimer -= 1;
        } else {
            multiplier--;
            multiplierTimer = MULTIPLIER_BONUS_DURATION;
        }
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
            spawnBullet(player.pos, player.gunAngle);
            // Muzzleflash
            color("yellow");
            particle(player.pos, 3, 1, player.gunAngle, PI/2);
            play("laser");
        }
    }

    color("black");
    char("a", player.pos);
    color("light_red"); // Draw the crosshair indicating the firing direction
    text(
        "o",
        player.pos.x + CROSSSHAIR_DISTANCE*cos(player.gunAngle),
        player.pos.y + CROSSSHAIR_DISTANCE*sin(player.gunAngle)
    );

    asteroids.forEach((a) => {
        a.pos.x += a.speed*cos(a.angle);
        a.pos.y += a.speed*sin(a.angle);
        a.selfAngle += a.selfAngleSpd;
    });

    bullets.forEach((b) => {
        b.pos.x += BULLET_SPD*cos(b.angle);
        b.pos.y += BULLET_SPD*sin(b.angle);
        
        color("yellow");
        box(b.pos, 2, 2);
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
            addScore(multiplier + 10, a.pos);
            plusMultiplier();
            play("coin");
        }

        if (!a.isPowerup && a.pos.distanceTo(EARTH_POS) < EARTH_RADIUS + 5) {
            color("red");
            text("X", a.pos);
            end();
            play("lucky");
        }

        if (a.hp <= 0 && !a.isPowerup) {
            addScore(multiplier, a.pos);
            plusMultiplier();
            spawnExplosion(a.pos);
            play("explosion");
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
            particle(b.pos, 4, 1);
            play("hit");
        }

        return (isCollidingWithAsteroid || isOutOfBounds);
    });

    remove(explosions, (e) => {
        e.lifetime *= 0.8;

        color("red");
        arc(e.pos, EXPLOSION_MAX_LIFETIME/e.lifetime, e.lifetime/10);

        return e.lifetime <= 1;
    })
    
    color("transparent");

    // ====Other functions
    function spawnAsteroid() {
        const QUADRANT = rndi(4);
        let x, y, angle, selfAngleSpdSign;

        switch (QUADRANT) {
            case 0:
                x = rnds(-OFFSCREEN_MARGIN, G_WIDTH + OFFSCREEN_MARGIN) 
                y = -rnd(OFFSCREEN_MARGIN);
                break;

            case 1:
                x = rnd(G_WIDTH, G_WIDTH + OFFSCREEN_MARGIN);
                y = rnds(-OFFSCREEN_MARGIN, G_HEIGHT + OFFSCREEN_MARGIN) 
                break;

            case 2:
                x = rnds(-OFFSCREEN_MARGIN, G_WIDTH + OFFSCREEN_MARGIN) 
                y = rnd(G_HEIGHT, G_HEIGHT + OFFSCREEN_MARGIN);
                break;

            case 3:
                x = -rnd(OFFSCREEN_MARGIN);
                y = rnds(-OFFSCREEN_MARGIN, G_HEIGHT + OFFSCREEN_MARGIN) 
                break;
        }

        angle = atan2(EARTH_POS.y - y, EARTH_POS.x - x)
            + rnd(ASTEROID_ANGLE_VARIANCE) - ASTEROID_ANGLE_VARIANCE/2;
        selfAngleSpdSign = (rnd() < 0.5) ? 1 : -1;

        asteroids.push({
            pos: vec(x, y),
            angle: angle,
            speed: rnd(ASTEROID_SPEED_MIN, ASTEROID_SPEED_MAX),
            hp: rndi(ASTEROID_HP_MIN, ASTEROID_HP_MAX),
            selfAngle: rnd(PI*2),
            selfAngleSpd: rnd(ASTEROID_SELF_ANGLE_SPD_MIN, ASTEROID_SELF_ANGLE_SPD_MAX) * selfAngleSpdSign,
            isPowerup: (rnd() > ASTEROID_POWERUP_CHANCE)
        })
    }

    function spawnBullet(pos, angle) {
        bullets.push({
            pos: vec(pos.x, pos.y),
            angle: angle
        });
    }

    function spawnExplosion(pos) {
        explosions.push({
            pos: vec(pos.x, pos.y),
            lifetime: EXPLOSION_MAX_LIFETIME
        })
    }

    function plusMultiplier() {
        multiplier++;
        multiplierTimer = MULTIPLIER_BONUS_DURATION;
    }

    function isPosOutOfBounds(pos) {
        return (pos.x > G_WIDTH + OFFSCREEN_MARGIN
        || pos.x < -OFFSCREEN_MARGIN
        || pos.y > G_HEIGHT + OFFSCREEN_MARGIN
        || pos.y < -OFFSCREEN_MARGIN);
    }
}
