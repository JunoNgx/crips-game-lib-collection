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

    PLAYER_FIRE_RATE: 5,
    PLAYER_GUN_DIST: 3,

    FBULLET_SPEED: 5,

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
 * isFiringLeft: boolean,
 * firingCooldown: number
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
            isFiringLeft: true,
            firingCooldown: 0
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
    if (player.firingCooldown > 0) {
        player.firingCooldown -= 1;
    } else {

        let offset = (player.isFiringLeft)
            ? -G.PLAYER_GUN_DIST
            : G.PLAYER_GUN_DIST;

        fBullets.push({ pos:
            vec(player.pos.x + offset, player.pos.y)
        });
        player.firingCooldown = G.PLAYER_FIRE_RATE;
        player.isFiringLeft = !player.isFiringLeft;

        particle(player.pos.x + offset, player.pos.y, 4, 1, -PI/2, PI/4);
    }

    // FBullets
    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;

        color("cyan");
        box(fb.pos, 2, 2);
    });

    remove(fBullets, (fb) => {
        return (
            fb.pos.y < -G.OUTER_BORDER
            || box(fb.pos, 2, 2).isColliding.char.b
        );
    });
}
