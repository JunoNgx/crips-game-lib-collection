title = "BLITZED";

description = `
Annihilate.

[Hold Left]
  Move Left

[Hold Right]
  Move Right
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
 ll
l  l
l  l
 ll
`,`
y  y
yyyyyy
 yyyy
yyyyyy
 y  y
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
    ENEMY_HP: 1,
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
    isPlayingBgm: true,
    isReplayEnabled: true,
    // isCapturing: true,
    seed: 894
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
 * angle: number,
 * speed: number,
 * rotation: number,
 * rotationSpd: number
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
 * @type { number }
 */
let waveCount;

/**
 * @type { Color[] }
 */
 const C = [
    "red",
    "green",
    "blue",
    "yellow",
    "black",
    "purple",
    "cyan",
    "light_red",
    "light_green",
    "light_blue",
    "light_yellow",
    "light_black",
    "light_purple",
    "light_cyan",
];

/**
 * @type {{
 * fg: Color,
 * bg: Color
 * }}
 */
let currentCol;

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
        enemies = [];
        eBullets = [];
        stars = times(rndi(4, 7), () => {
            return {
                pos: vec(rnd(G.WIDTH), rnd(G.HEIGHT)),
                angle: rnd(PI*2),
                speed: rnd(),
                rotation: rnd(),
                rotationSpd: rnd(0.1)
            };
        });

        enemyFiringCooldown = G.ENEMY_FIRE_RATE;
        waveCount = 0;
        currentCol = {
            bg: "white",
            fg: "white"
        };
    }

    if (enemies.length === 0) {
        regenerate();
        waveCount++;
        if (ticks > 60) addScore(waveCount*10, player.pos);
    }

    color(currentCol.bg);
    // stars.forEach((s) => {
    //     s.pos.x += s.speed * Math.cos(s.angle);
    //     s.pos.y += s.speed * Math.sin(s.angle);
    //     s.rotation += s.rotationSpd;
    //     s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    //     char("f", s.pos, {rotation: s.rotation});
    // });

    color(currentCol.fg);
    char("a", player.pos);
    player.firingCooldown--;
    if (player.firingCooldown < 0 && !input.isPressed) {
        player.firingCooldown = G.PLAYER_FIRE_RATE;
        fBullets.push({ pos: vec(player.pos.x, player.pos.y) });
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

        play("laser");
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
            addScore(waveCount, e.pos);
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

    function regenerate() {
        currentCol.fg = (C[rndi(C.length)]);
        currentCol.bg = (C[rndi(C.length)]);
        do {
            currentCol.bg = (C[rndi(C.length)]);
        } while (currentCol.fg === currentCol.bg);
        
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {

                let x = G.WIDTH*0.1 + i*12 + (j%2)*6;
                let y = G.HEIGHT*0.1 + j*6;

                enemies.push({
                    pos: vec(x, y),
                    hp: G.ENEMY_HP + ceil(waveCount/2),
                    state: EnemyState.RIGHT,
                    nextDir: EnemyState.LEFT,
                    speed: G.ENEMY_MOVE_SPD_HORIZONTAL
                        + difficulty * G.DIFFICULTY_MODIFIER,
                    distanceLog: 0
                });
            }
        }
        enemyFiringCooldown = G.ENEMY_FIRE_RATE - difficulty * 0.1;

        play("powerUp");
        particle(G.WIDTH/2, G.HEIGHT*0.15, 70, 7);
    }
}
