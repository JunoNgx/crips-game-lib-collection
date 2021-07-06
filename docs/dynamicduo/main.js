title = "DYNAMIC DUO";

description = `
`;

characters = [
    `
rrr
rrr
llllll
llllll
rrr
rrr
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

const SHIP_CLICK_SIZE = 8;

// /**
//  * @type {Vector}
//  * */
// let pointerOrigin;

/**
 * @typedef {{
 * pos: Vector
 * originPos: Vector,
 * isFiring: boolean,
 * isBlue: boolean,
 * isFacingUp: boolean
 * }} Ship
 * */

/** 
 * @type { Ship[] } Ship
 * */
let ships;

/** 
 * The ship that currently being controlled
 * @type { Ship }
 * */
let currentShip;

function update() {

    if (!ticks) {

        // pointerOrigin = vec(0, 0);
        currentShip = null;

        ships = [{
            pos: vec(G_WIDTH/2, G_HEIGHT * 0.4),
            originPos: vec(0, 0),
            isFiring: false,
            isBlue: false,
            isFacingUp: true
        }]
    }

    // input.isJustPressed is handled in ships.forEach()
    if (input.isPressed) {
        if (currentShip != null) {
            currentShip.pos = vec(input.pos.x, input.pos.y);
        }
    } else if (input.isJustReleased) {
        currentShip = null;
    }

    // The defense objective
    color("purple");
    box(G_WIDTH/2, G_HEIGHT/2, G_WIDTH, 4);

    ships.forEach(s => {
        let angle = (s.isFacingUp) ? -1 : 1;
        color("black");
        char("a", s.pos, {rotation: angle});

        s.isFacingUp = (s.pos.y < G_HEIGHT/2);

        if (input.isJustPressed) {
            // pointerOrigin = vec(input.pos.x, input.pos.y);
            if (input.pos.isInRect(
                s.pos.x - SHIP_CLICK_SIZE/2,
                s.pos.y - SHIP_CLICK_SIZE/2,
                SHIP_CLICK_SIZE,
                SHIP_CLICK_SIZE) ) {
                currentShip = s;
            }
        };
    });
}
