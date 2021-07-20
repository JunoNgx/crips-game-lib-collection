title = "PSYCHED";

description = `

`;

characters = [
`
  ll
  ll 
 llll 
 llll
llllll
llllll
`,`
llllll
l ll l
 llll
 l  l
`,`
 llll
l ll l
 llll
l    l
`
];

const G = {
    WIDTH: 100,
    HEIGHT: 150,
    OUTER_BORDER: 30,

    PLAYER_FIRE_RATE: 15,
    PLAYER_MOVE_SPD: 1,
    FBULLET_SPEED: 5,

    ENEMY_FIRE_RATE: 45,
    ENEMY_ANIM_SPD: 60,
    ENEMY_MOVE_TIME_HORIZONTAL: 60,
    ENEMY_MOVE_TIME_VERTICAL: 60,
    EBULLET_SPEED: 2.0,

    STAR_MIN_VELOCITY: 0.5,
    STAR_MAX_VELOCITY: 1.0,
}

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    // isPlayingBgm: true,
    isReplayEnabled: false,
    // isCapturing: true,
    seed: 120
};

/**
 * @typedef {{
 * pos: Vector,
 * isFiring: false,
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
 * state: EnemyState
 * }} Enemy
 */

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number
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
let currentWave;

/**
 * @type { number };
 */
let enemyFiringCooldown;

/**
 * @type { Color[] }
 */
 const C = [
    "light_red",
    "light_green",
    "light_blue",
    "light_black",
    "light_yellow",
    "light_purple"
];

// const EnemyState = [
//     "RIGHT",
//     "LEFT",
//     "DOWN"
// ];

/**
 * @enum { string }
 */
const EnemyState = {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH*0.5, G.HEIGHT*0.9),
            isFiring: false,
            firingCooldown: 0
        };

        fBullets = [];
        eBullets = [];
        
        enemies = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {

                let x = G.WIDTH*0.1 + i*12 + (j%2)*6;
                let y = G.HEIGHT*0.1 + j*6;

                enemies.push({
                    pos: vec(x, y),
                    state: EnemyState.RIGHT
                });
            }
        }

        // stars = times(30, () => {
        //     return {
        //         pos: vec(rnd(G.WIDTH), rnd(G.HEIGHT)),
        //         velocity: rnd(G.STAR_MIN_VELOCITY, G.STAR_MAX_VELOCITY)
        //     }
        // });

        currentWave = 0;
        resetColor();
    }

    char("a", player.pos);
    player.firingCooldown--;
    if (player.firingCooldown < 0) {
        player.firingCooldown = G.PLAYER_FIRE_RATE;
        fBullets.push({
            pos: vec(player.pos.x, player.pos.y)
        })
    }

    if (input.isPressed) {
        if (input.pos.x >= G.WIDTH/2) {
            player.pos.x += G.PLAYER_MOVE_SPD;
        } else {
            player.pos.x -= G.PLAYER_MOVE_SPD;
        }
    }
    player.pos.x = clamp(player.pos.x, G.WIDTH * 0.1, G.WIDTH * 0.9);

    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;
        box(fb.pos, 2);
    });

    remove(enemies, (e) => {
        char(addWithCharCode("b", floor(ticks/G.ENEMY_ANIM_SPD)%2), e.pos);

        // text(ticks.toString(), 10, 10);
    });

    remove(fBullets, (fb) => {
        return (fb.pos.y < 0);
    })

    /**
     * Change the color to a random one set in the array C
     */
    function resetColor() { color(C[rndi(C.length)]); }
}
