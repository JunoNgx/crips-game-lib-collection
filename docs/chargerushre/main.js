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
`,
`
 y  y
yyyyyy
 y  y
yyyyyy
 y  y
`
];

/**
 * Game design values
 */
const G = {
    WIDTH: 100,
    HEIGHT: 150,
    OUTER_BORDER: 30,

    PLAYER_FIRE_RATE: 4,
    PLAYER_GUN_DIST: 3,

    FBULLET_SPEED: 5,

    ENEMY_MIN_BASE_SPEED: 1.0,
    ENEMY_MAX_BASE_SPEED: 2.0,
    ENEMY_FIRE_RATE: 45,
    
    EBULLET_SPEED: 2.0,
    EBULLET_ROTATION_SPD: 0.1,

    STAR_MIN_VELOCITY: 0.5,
    STAR_MAX_VELOCITY: 1.0,
}

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "dark",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    isPlayingBgm: true,
    isReplayEnabled: false,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 2,
    seed: 120
};

/**
 * @typedef {{
 * pos: Vector,
 * posOrigin: Vector,
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
 * velocity: number,
 * firingCooldown: number
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
 * @typedef {{
 * origin: Vector,
 * delta: Vector,
 * factor: number,
 * isFirstInput: boolean
 * }} InputData
 */

/**
 * @type { InputData }
 */
let inputData;

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH*0.5, G.HEIGHT*0.5),
            posOrigin: vec(G.WIDTH*0.5, G.HEIGHT*0.5),
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
            };
        });

        currentWave = 0;
        inputData = {
            origin: vec(0, 0),
            delta: vec(0, 0),
            factor: 1.2,
            isFirstInput: true
        };
    }

    // Spawner mechanic
    if (enemies.length === 0) {

        const sharedVelocity =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED)
            * difficulty;

        for (let i = 1; i < 9; i++) {
            enemies.push({
                pos: vec (
                    rnd(G.WIDTH * 0.1, G.WIDTH * 0.9),
                    -i * G.HEIGHT/10
                ),
                velocity: sharedVelocity,
                firingCooldown: G.ENEMY_FIRE_RATE
            })
        }

        currentWave++;
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
    // player.pos = vec(input.pos.x, input.pos.y);
    if (inputData.isFirstInput && input.isJustReleased)
        inputData.isFirstInput = false;

    if (!inputData.isFirstInput) {
        if (input.isJustPressed) {
            inputData.origin = vec(input.pos.x, input.pos.y);
            player.posOrigin = vec(player.pos.x, player.pos.y);
        } else if (input.isPressed) {
            inputData.delta = vec(
                input.pos.x - inputData.origin.x,
                input.pos.y - inputData.origin.y
            );
            player.pos = vec(
                player.posOrigin.x + inputData.delta.x * inputData.factor,
                player.posOrigin.y + inputData.delta.y * inputData.factor
            );
        } else if (input.isJustReleased) {
            inputData.origin = vec(0, 0)
            inputData.delta = vec(0, 0);
            player.posOrigin = vec(0, 0);  
        } 
    }

    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    player.firingCooldown -= 1;
    if (player.firingCooldown < 0) {
        const offset = (player.isFiringLeft)
            ? -G.PLAYER_GUN_DIST
            : G.PLAYER_GUN_DIST;

        fBullets.push({ pos:
            vec(player.pos.x + offset, player.pos.y)
        });
        player.firingCooldown = G.PLAYER_FIRE_RATE;
        player.isFiringLeft = !player.isFiringLeft;

        color("yellow");
        particle(player.pos.x + offset, player.pos.y, 2, 1, -PI/2, PI/4);
    }

    color("black");
    char("a", player.pos);

    // FBullets
    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;

        color("yellow");
        box(fb.pos, 2, 2);
    });

    // Enemies
    remove(enemies, (e) => {
        e.pos.y += e.velocity;
        e.firingCooldown -= 1;

        if (e.firingCooldown < 0) {
            eBullets.push({
                pos: vec(e.pos.x, e.pos.y),
                angle: e.pos.angleTo(player.pos),
                rotation: 0
            });
            e.firingCooldown = G.ENEMY_FIRE_RATE;

            play("laser");
        }
        
        color("black");
        const isCollidingWithFBullet = char("b", e.pos).isColliding.rect.yellow;
        const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;

        if (isCollidingWithPlayer) {
            color("green");
            text("x", e.pos);
            end();
            play("powerUp");
        }

        return ( e.pos.y > G.HEIGHT || isCollidingWithFBullet);
    });

    remove(fBullets, (fb) => {
        color("yellow");
        const isCollidingWithEnemy = box(fb.pos, 2, 2).isColliding.char.b;

        if (isCollidingWithEnemy) {
            particle(fb.pos);
            addScore(currentWave*10, fb.pos);

            play("hit");
        }

        return (fb.pos.y < 0 || isCollidingWithEnemy);
    });

    remove(eBullets, (eb) => {
        eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
        eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
        eb.rotation += G.EBULLET_ROTATION_SPD;

        color ("red");
        const isCollidingWithPlayer =
            char("c", eb.pos, { rotation: eb.rotation }).isColliding.char.a;
        const isCollidingWithFBullet =
            char("c", eb.pos, { rotation: eb.rotation }).isColliding.rect.yellow;

        if (isCollidingWithPlayer) {
            color("green");
            text("x", eb.pos);
            end();
            play("powerUp");
        }
        if (isCollidingWithFBullet) addScore(1, eb.pos);

        return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });
}
