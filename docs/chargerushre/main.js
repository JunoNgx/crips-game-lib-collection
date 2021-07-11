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
`,
`
r    r
rrrrrr
rrggrr
rrggrr
 r  r
 r  r
`
];

/**
 * Game design values
 */
const G = {
    WIDTH: 100,
    HEIGHT: 150,
    OUTER_BORDER: 30,

    PLAYER_FIRE_RATE: 5,
    PLAYER_GUN_DIST: 3,

    FBULLET_SPEED: 5,

    ENEMY_MIN_BASE_SPEED: 1.5,
    ENEMY_MAX_BASE_SPEED: 3.0,

    STAR_MIN_VELOCITY: 0.5,
    STAR_MAX_VELOCITY: 1.0,
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

    // Spawner mechanic
    if (enemies.length === 0) {
        // enemies = times(9, () => {
        //     return {
        //         pos: vec(rnd(G.WIDTH), -rnd(G.OUTER_BORDER)),
        //         velocity: 0.
        //     };
        // });

        let sharedVelocity =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED)
            * difficulty;

        for (let i = 1; i < 9; i++) {
            enemies.push({
                pos: vec (
                    rnd(G.WIDTH * 0.1, G.WIDTH * 0.9),
                    -i * G.HEIGHT/10
                ),
                velocity: sharedVelocity
            })
        }
    }

    // Star
    stars.forEach((s) => {
        s.pos.y += s.velocity;

        if (s.pos.y > G.HEIGHT) {
            s.pos = vec(
                rnd(G.WIDTH),
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

        color("black");
        particle(player.pos.x + offset, player.pos.y, 2, 1, -PI/2, PI/4);
    }

    // FBullets
    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;

        color("yellow");
        box(fb.pos, 2, 2);
    });

    // Enemies
    remove(enemies, (e) => {
        e.pos.y += e.velocity;
        
        color("black");
        return (
            e.pos.y > G.HEIGHT
            || char("b", e.pos).isColliding.rect.yellow
        )
    });

    remove(fBullets, (fb) => {
        return (
            fb.pos.y < 0
            || box(fb.pos, 2, 2).isColliding.char.b
        );
    });
}
