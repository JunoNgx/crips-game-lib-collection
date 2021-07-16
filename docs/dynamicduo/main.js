title = "DYNAMIC DUO";

description = `
Defend the
mid-line

[Drag & Drop]
  Move, fire,
  and change
  firing
  direction
`;

characters = [
// a: blue SHip
`
cccc
cccc
 yyyyy
 yyyyy
cccc
cccc
`,
// b: red Ship
` 
rrrr
rrrr
 yyyyy
 yyyyy
rrrr
rrrr
`,
// c: blue Bullet
`
cc
 cc
 cc
cc
`,
// d: red Bullet
`
rr
 rr
 rr
rr
`,
// e: blue Enemy
`
  cc
 cccc
cwccwc
cccccc
 c  c
c    c
`,
// f: red Enemy
`
    rr
 rrrr
rrrr
 r rr
r   r
`
];

const G_WIDTH = 80;
const G_HEIGHT = 128;
/**
 * The size of the ship's click hitbox for drag and drop
 */
 const SHIP_CLICK_SIZE = 16;
 const SHIP_FIRE_RATE = 15;
 const BULLET_SPD = 5;
 const ENEMY_BASE_SPAWN_RATE = 45;
 const ENEMY_SPAWN_PADDING = 5;
 const ENEMY_MIN_SPD = 0.02
 const ENEMY_MAX_SPD = 0.35
 const OFFSCREEN_MARGIN = 30;
 const MULTIPLIER_BONUS_DURATION = 40;

options = {
    viewSize: { x: G_WIDTH, y: G_HEIGHT},
    theme: 'simple',
    isPlayingBgm: true,
    isReplayEnabled: true,
    seed: 150
};

let spawnCooldown = 0;

/**
 * @type {{
 * timer: number
 * amt: number
 * }}
 */
let multiplier;

/**
 * @typedef {{
 * pos: Vector
 * isFiring: boolean
 * firingCooldown: number
 * isBlue: boolean
 * isFacingUp: boolean
 * }} Ship
 * */

/** 
 * @type { Ship[] } Ship
 * */
let ships;

/** 
 * @type { Ship }
 * */
 let currentlyControlledShip;

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
 * speed: number
 * }} Enemy
 */

/**
 * @type { Enemy[] }
 */
let enemies;

function update() {

    if (!ticks) {

        spawnCooldown = 0;
        multiplier = {
            amt: 1,
            timer: 0
        };
        currentlyControlledShip = null;

        ships = [
            {
                pos: vec(G_WIDTH/2, G_HEIGHT * 0.4),
                isFiring: false,
                firingCooldown: 0,
                isBlue: true,
                isFacingUp: true
            },
            {
                pos: vec(G_WIDTH/2, G_HEIGHT * 0.6),
                isFiring: false,
                firingCooldown: 0,
                isBlue: false,
                isFacingUp: false
            }
        ];
        bullets = [];
        enemies = [];
    }

    // input.isJustPressed is handled in ships.forEach()
    if (input.isPressed) {
        if (currentlyControlledShip != null) {
            currentlyControlledShip.pos = vec(input.pos.x, input.pos.y);
        }
    } else if (input.isJustReleased) {
        if (currentlyControlledShip != null) {
            currentlyControlledShip.isFiring = false;
            currentlyControlledShip = null;
        };
    }

    // Spawn mechanic
    if (spawnCooldown > 0) {
        spawnCooldown -= 1;
    } else {
        spawnEnemy();
        spawnCooldown = ENEMY_BASE_SPAWN_RATE - difficulty*0.3;
    }

    // Multiplier mechanic
    if (multiplier.amt > 1) {
        if (multiplier.timer > 0) {
            multiplier.timer -= 1;
        } else {
            multiplier.amt--;
            multiplier.timer = MULTIPLIER_BONUS_DURATION;
        }
    }

    // The defense objective
    color("light_purple");
    box(G_WIDTH/2, G_HEIGHT/2, G_WIDTH, 5);

    ships.forEach(s => {
        let angle = (s.isFacingUp) ? -1 : 1;
        s.isFacingUp = (s.pos.y < G_HEIGHT/2);
        if (s.firingCooldown > 0) s.firingCooldown -= 1;

        if (input.isJustPressed) {
            if (input.pos.isInRect(
                s.pos.x - SHIP_CLICK_SIZE/2,
                s.pos.y - SHIP_CLICK_SIZE/2,
                SHIP_CLICK_SIZE,
                SHIP_CLICK_SIZE) ) {

                s.isFiring = true;
                currentlyControlledShip = s;
            }
        };

        if (s.isFiring && s.firingCooldown <= 0) {
            spawnBullet(s.pos, s.isBlue, s.isFacingUp);
            s.firingCooldown = SHIP_FIRE_RATE;
            
            if (s.isBlue) play("laser");
            else play("select");
        }

        keepsInBounds(s.pos);

        color("black");
        if (s.isBlue) {
            char("a", s.pos, {rotation: angle});
        } else {
            char("b", s.pos, {rotation: angle});
        }
    });

    bullets.forEach(b => {
        let angle = (b.isFacingUp) ? -1 : 1;
        let spd = (b.isFacingUp) ? -BULLET_SPD : BULLET_SPD;
        b.pos.y += spd;

        color("black");
        if (b.isBlue) {
            char("c", b.pos, {rotation: angle});
        } else {
            char("d", b.pos, {rotation: angle});
        }
    });

    remove(enemies, e => {
        let isColliding;

        let spd = (e.isFacingUp) ? -e.speed : e.speed;
        e.pos.y += spd;

        color("black");
        if (e.isBlue && char("e", e.pos).isColliding.char.c) isColliding = true;
        else if (!e.isBlue && char("f", e.pos).isColliding.char.d) isColliding = true;

        if (e.isBlue && char("e", e.pos).isColliding.rect.light_purple
        || !e.isBlue && char("f", e.pos).isColliding.rect.light_purple) {
            color("purple");
            text("X", e.pos);
            end();
            play("lucky");
        }

        if (isColliding) {
            color("yellow");
            particle(e.pos);
            play("explosion");
            addScore(multiplier.amt, e.pos);
            plusMultiplier();
        }

        return isColliding;
    });

    remove(bullets, b => {
        let isColliding;
        let angle = (b.isFacingUp) ? -1 : 1;

        color("black");
        if (b.isBlue && char("c", b.pos, {rotation: angle}).isColliding.char.e)
            isColliding = true;
        else if (!b.isBlue && char("d", b.pos, {rotation: angle}).isColliding.char.f)
            isColliding = true;

        return (isColliding || isPosOutOfBounds(b.pos));
    });

    // Other functions

    function spawnBullet(pos, isBlue, isFacingUp) {
        bullets.push({pos: vec(pos.x, pos.y), isBlue, isFacingUp});
    }

    function spawnEnemy() {
        let isBlue = rnd() > 0.5;
        let isFacingUp = rnd() > 0.5;

        let x = rnd(ENEMY_SPAWN_PADDING, G_WIDTH-ENEMY_SPAWN_PADDING);
        let y = (isFacingUp)
            ? rnd(G_HEIGHT, G_HEIGHT+OFFSCREEN_MARGIN)
            : -rnd(OFFSCREEN_MARGIN)
        let speed = rnd(ENEMY_MIN_SPD, ENEMY_MAX_SPD);

        enemies.push({
            pos: vec(x, y),
            isBlue: isBlue,
            isFacingUp: isFacingUp,
            speed: speed
        })
    }

    function plusMultiplier() {
        multiplier.amt++;
        multiplier.timer = MULTIPLIER_BONUS_DURATION;
    }

    function isPosOutOfBounds(pos) {
        return (
            pos.y > G_HEIGHT + OFFSCREEN_MARGIN
            || pos.y < -OFFSCREEN_MARGIN
        );
    }

    /**
     * 
     * @param {Vector} pos
     */
    function keepsInBounds(pos) {
        if (pos.x > G_WIDTH) pos.x = G_WIDTH;
        else if (pos.x < 0) pos.x = 0;
        else if (pos.y > G_HEIGHT) pos.y = G_HEIGHT;
        else if (pos.y < 0) pos.y = 0;
    }
}
