title = "ORBITAL DEFENSE";

description = `
Defend Earth
from Asteroids

[Tap] Rotate
[Hold] Fire
`;

characters = [];

const G_WIDTH = 180;
const G_HEIGHT = 180;

options = {
    viewSize: {x: G_WIDTH, y: G_HEIGHT},
    theme: "dark",
    // isPlayingBgm: true,
    isPlayingBgm: false,
    isReplayEnabled: true,
    seed: 2
};

/** @type {number} */
const MOV_SPD = 5;
const MOV_SPD_SLOWED = 2;
const FIRE_RATE = 5;
const SPAWN_RATE = 5;

/** @type {Vector[]} */
let stars;
let asteroids;

function update() {

    // Gameplay loop
    if (!ticks) {

    }

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
}
