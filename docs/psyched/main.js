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
 l
lll
 l
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
`,`
 l
l l
 l
`
];

const G = {
    WIDTH: 100,
    HEIGHT: 150,
    OUTER_BORDER: 30,

    PLAYER_FIRE_RATE: 15,
    PLAYER_MOVE_SPD: 1,
    FBULLET_SPEED: 5,

    ENEMY_FIRE_RATE: 60,
    ENEMY_HP: 3,
    ENEMY_ANIM_SPD: 60,
    ENEMY_MOVE_SPD_HORIZONTAL: 0.02,
    ENEMY_MOVE_SPD_VERTICAL: 0.04,
    ENEMY_TRIGGER_DISTANCE_HORIZONTAL: 27,
    ENEMY_TRIGGER_DISTANCE_VERTICAL: 17,
    EBULLET_SPEED: 1,

    DIFFICULTY_MODIFIER: 0.1,

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
    seed: 1024
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
 * hp: number,
 * state: EnemyState,
 * nextDir: EnemyState,
 * speed: number,
 * distanceLog: number
 * }} Enemy
 */

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
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
        
        enemyFiringCooldown = G.ENEMY_FIRE_RATE;
    }

    if (enemies.length === 0) regenerate();

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

    // const playerIsColldingWithEBullet =
    //     char("a", player.pos).isColliding.char.b
    //     || char("a", player.pos).isColliding.char.c;


    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;
        // box(fb.pos, 2);
        char("b", fb.pos);
    });

    enemyFiringCooldown--;
    if (enemyFiringCooldown <= 0) {
        if (enemies.length <= 0) return;
        let pickedEnemy = enemies[rndi(enemies.length)];
        if (rnd() > 0.7) {
            eBullets.push({
                pos: vec(pickedEnemy.pos.x, pickedEnemy.pos.y),
                angle: PI*0.5
            });
        } else {
            eBullets.push({
                pos: vec(pickedEnemy.pos.x, pickedEnemy.pos.y),
                angle: PI*0.6
            });
            eBullets.push({
                pos: vec(pickedEnemy.pos.x, pickedEnemy.pos.y),
                angle: PI*0.4
            });
        }
        enemyFiringCooldown = G.ENEMY_FIRE_RATE - difficulty * 0.1;
    }

    remove(enemies, (e) => {
        
        switch(e.state) {
            case EnemyState.LEFT:
                e.pos.x -= e.speed;
                break;
            case EnemyState.RIGHT:
                e.pos.x += e.speed;
                break;
            case EnemyState.DOWN:
                e.pos.y += e.speed;
                break;
        }

        e.distanceLog += abs(e.speed);
        if (e.state === EnemyState.LEFT
            && e.distanceLog >= G.ENEMY_TRIGGER_DISTANCE_HORIZONTAL) {

            e.distanceLog = 0;
            e.state = EnemyState.DOWN;
            e.nextDir = EnemyState.RIGHT;
            e.speed = G.ENEMY_MOVE_SPD_VERTICAL
                + difficulty * G.DIFFICULTY_MODIFIER;
        } else if (e.state === EnemyState.RIGHT
            && e.distanceLog >= G.ENEMY_TRIGGER_DISTANCE_HORIZONTAL) {

            e.distanceLog = 0;
            e.state = EnemyState.DOWN;
            e.nextDir = EnemyState.LEFT;
            e.speed = G.ENEMY_MOVE_SPD_VERTICAL
                + difficulty * G.DIFFICULTY_MODIFIER;
        } else if (e.state === EnemyState.DOWN
            && e.distanceLog >= G.ENEMY_TRIGGER_DISTANCE_VERTICAL) {

            e.distanceLog = 0;
            e.state = e.nextDir;
            e.speed = G.ENEMY_MOVE_SPD_HORIZONTAL
                + difficulty * G.DIFFICULTY_MODIFIER;
        }

        const isCollidingWithPlayer =
            char(addWithCharCode("c", floor(ticks/G.ENEMY_ANIM_SPD)%2), e.pos)
                .isColliding.char.a;
        const isCollidingWithFBullet =  
            char(addWithCharCode("c", floor(ticks/G.ENEMY_ANIM_SPD)%2), e.pos)
                    .isColliding.char.b;

        if (isCollidingWithFBullet) e.hp--;
        if (isCollidingWithPlayer) {
            end();
            play("lucky");
        }

        if (e.hp === 0) {
            play("explosion");
            particle(e.pos, 30, 7);
        }

        return (e.hp === 0 || e.pos.y > G.HEIGHT);
    });

    remove(fBullets, (fb) => {
        const isCollidingWithEnemy =
            char("b", fb.pos).isColliding.char.c
            || char("b", fb.pos).isColliding.char.d;

        if (isCollidingWithEnemy) {
            play("hit");
            particle(fb.pos);
        }

        return (isCollidingWithEnemy || fb.pos.y < 0);
    });

    remove(eBullets, (eb) => {
        eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
        eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);

        const isCollidingWithPlayer = char("e", eb.pos).isColliding.char.a;
        if (isCollidingWithPlayer) {
            end();
            play("lucky");
        }

        return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });

    /**
     * Change the color to a random one set in the array C
     */
    function regenerate() {
        color(C[rndi(C.length)]);
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {

                let x = G.WIDTH*0.1 + i*12 + (j%2)*6;
                let y = G.HEIGHT*0.1 + j*6;

                enemies.push({
                    pos: vec(x, y),
                    hp: G.ENEMY_HP,
                    state: EnemyState.RIGHT,
                    nextDir: EnemyState.LEFT,
                    speed: G.ENEMY_MOVE_SPD_HORIZONTAL
                        + difficulty * G.DIFFICULTY_MODIFIER,
                    distanceLog: 0
                });
            }
        }
        enemyFiringCooldown = G.ENEMY_FIRE_RATE - difficulty * 0.1;

        play("coin");
        particle(G.WIDTH/2, G.HEIGHT*0.15, 70, 7);
    }
}
