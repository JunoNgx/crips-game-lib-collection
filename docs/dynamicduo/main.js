title = "DYNAMIC DUO";

description = `
`;

characters = [
    `
ccc
ccc
llllll
llllll
ccc
ccc
`,` 
rrr
rrr
llllll
llllll
rrr
rrr
`,

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
const BULLET_SPD = 5;

/**
 * @typedef {{
 * pos: Vector
 * isFiring: boolean
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
                isBlue: true,
                isFacingUp: true
            },
            {
                pos: vec(G_WIDTH/2, G_HEIGHT * 0.6),
                isFiring: false,
                isBlue: false,
                isFacingUp: false
            }
        ]
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

    // Ship update
    ships.forEach(s => {
        let angle = (s.isFacingUp) ? -1 : 1;
        s.isFacingUp = (s.pos.y < G_HEIGHT/2);

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

        if (s.isFiring) {

        }

        color("black");
        if (s.isBlue) {
            char("a", s.pos, {rotation: angle});
        } else {
            char("b", s.pos, {rotation: angle});
        }
    });

    //
}
