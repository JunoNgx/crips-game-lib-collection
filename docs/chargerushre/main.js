title = "CHARGE RUSH RE";

description = `
Survive.


[MOVE]
  Move/shoot
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc
cc  cc
`

];

/**
 * Game design values
 */
const G = {
    WIDTH: 100,
    HEIGHT: 150,
    OUTER_BORDER: 10,
    STAR_MIN_VELOCITY: 0.1,
    STAR_MAX_VELOCITY: 0.5,
}

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "dark",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    isPlayingBgm: false,
    isReplayEnabled: true,
    seed: 12
};

/**
 * @typedef {{
 * pos: Vector,
 * isFiring: false,
 * firingCooldown: false
 * }} Player
 */

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @typedef {{
 * pos: Vector,
 * velocity: number
 * }} Enemy
 */

/**
 * @typedef {{
 * pos: Vector,
 * angle: number
 * }} EBullet
 */

/**
 * @typedef {{
 * pos: Vector,
 * velocity: number
 * }} Star
 */

/**
 * @type { Player }
 */
let player;

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @type { Star [] }
 */
let stars;

/**
 * @type { number }
 */
let spawnCooldown;

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH/2, G.WIDTH/2),
            isFiring: false,
            firingCooldown: false
        };

        fBullets = [];
        enemies = [];
        eBullets = [];

        stars = times(30, () => {
            return {
                pos: vec(rnd(G.WIDTH), rnd(G.HEIGHT)),
                velocity: rnd(G.STAR_MIN_VELOCITY, G.STAR_MAX_VELOCITY)
            }
        });
    }

    // Star
    stars.forEach((s) => {
        s.pos.y += s.velocity;

        if (s.pos.y > G.HEIGHT + G.OUTER_BORDER) {
            s.pos = vec(
                rnd(G.WIDTH)
                -G.OUTER_BORDER
            )
        }

        color("light_black");
        box(s.pos, 1, 1);
    });

    // Player
    player.pos = vec(input.pos.x, input.pos.y);
    color("black");
    char("a", player.pos);
    
}
