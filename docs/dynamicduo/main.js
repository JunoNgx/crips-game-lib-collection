title = "DYNAMIC DUO";

description = `
`;

characters = [
// a
`
ccc
ccc
llllll
llllll
ccc
ccc
`,
// b
` 
rrr
rrr
llllll
llllll
rrr
rrr
`,
// c
`
cc
 cc
 cc
cc
`,
// d
`
rr
 rr
 rr
rr
`
];

const G_WIDTH = 120;
const G_HEIGHT = 192;
options = {
    viewSize: { x: G_WIDTH, y: G_HEIGHT},
    theme: 'simple',
    isPlayingBgm: false,
    isReplayEnabled: false,
    seed: 240
};

/**
 * The size of the ship's click hitbox for drag and drop
 */
const SHIP_CLICK_SIZE = 8;
const SHIP_FIRE_RATE = 15;
const BULLET_SPD = 5;
const BULLET_SIZE = 2;

const OFFSCREEN_MARGIN = 30;

/**
 * @typedef {{
 * pos: Vector
 * isFiring: boolean
 * firingCooldown: number
 * isBlue: boolean
 * isFacingUp: boolean
 * }} Ship
 * */

/** 
 * @type { Ship[] } Ship
 * */
let ships;

/**
 * @typedef {{
 * pos: Vector
 * isBlue: boolean
 * isFacingUp: boolean
 * }} Bullet
 */

/**
 * @type { Bullet[] }
 */
let bullets;

/**
 * @typedef {{
 * pos: Vector
 * isBlue: boolean
 * isFacingUp: boolean
 * }} Enemy
 */

/**
 * @type { Enemy[] }
 */
let enemies;

/** 
 * The ship that currently being controlled
 * @type { Ship }
 * */
let currentShip;

function update() {

    if (!ticks) {

        currentShip = null;

        ships = [
            {
                pos: vec(G_WIDTH/2, G_HEIGHT * 0.4),
                isFiring: false,
                firingCooldown: 0,
                isBlue: true,
                isFacingUp: true
            },
            {
                pos: vec(G_WIDTH/2, G_HEIGHT * 0.6),
                isFiring: false,
                firingCooldown: 0,
                isBlue: false,
                isFacingUp: false
            }
        ];
        bullets = [];
        enemies = [];
    }

    // input.isJustPressed is handled in ships.forEach()
    if (input.isPressed) {
        if (currentShip != null) {
            currentShip.pos = vec(input.pos.x, input.pos.y);
        }
    } else if (input.isJustReleased) {
        currentShip.isFiring = false;
        currentShip = null;
    }

    // The defense objective
    color("light_purple");
    box(G_WIDTH/2, G_HEIGHT/2, G_WIDTH, 4);

    ships.forEach(s => {
        let angle = (s.isFacingUp) ? -1 : 1;
        s.isFacingUp = (s.pos.y < G_HEIGHT/2);
        if (s.firingCooldown > 0) s.firingCooldown -= 1;

        if (input.isJustPressed) {
            // pointerOrigin = vec(input.pos.x, input.pos.y);
            if (input.pos.isInRect(
                s.pos.x - SHIP_CLICK_SIZE/2,
                s.pos.y - SHIP_CLICK_SIZE/2,
                SHIP_CLICK_SIZE,
                SHIP_CLICK_SIZE) ) {

                s.isFiring = true;
                currentShip = s;
            }
        };

        if (s.isFiring && s.firingCooldown <= 0) {
            spawnBullet(s.pos, s.isBlue, s.isFacingUp);
            s.firingCooldown = SHIP_FIRE_RATE;
        }

        color("black");
        if (s.isBlue) {
            char("a", s.pos, {rotation: angle});
        } else {
            char("b", s.pos, {rotation: angle});
        }
    });

    bullets.forEach(b => {
        let angle = (b.isFacingUp) ? -1 : 1;
        let spd = (b.isFacingUp) ? -BULLET_SPD : BULLET_SPD;
        b.pos.y += spd;

        color("black");
        if (b.isBlue) {
            char("c", b.pos, {rotation: angle});
        } else {
            char("d", b.pos, {rotation: angle});
        }
    })
    remove(enemies, e => {

    });
    remove(bullets, b => {
        return isPosOutOfBounds(b.pos);
    });

    // Other functions

    function spawnBullet(pos, isBlue, isFacingUp) {
        bullets.push({pos: vec(pos.x, pos.y), isBlue, isFacingUp});
    }

    function isPosOutOfBounds(pos) {
        return (
            pos.y > G_HEIGHT + OFFSCREEN_MARGIN
            || pos.y < -OFFSCREEN_MARGIN
        );
    }
}
