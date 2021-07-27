title = "ARTIFICAL GRAVITY";

description = `
Maintain orbit.

Collect packages.



[Tap] Fire
`;

const G = {
    WIDTH: 150,
    HEIGHT: 150,
    CORE_RADIUS: 11,
    CORE_RADIUS_COLLISION: 15,
    GRAVITY: 0.01,
    THRUSTER_STRENGTH: 1,

    PLAYER_MAX_AMMO: 4,
    PLAYER_AMMO_COOLDOWN: 90,
    BULLET_SPD: 2.7,
    ENEMY_SPD: 0.2,
    ENEMY_BASE_SPAWN_RATE: 200,
    ENEMY_MIN_SPAWN_RATE: 45,
    EXPLOSION_BASE_RADIUS: 12,

    POINT_ENEMY: 1,
    POINT_PACKAGE: 40
};

characters = [
`
 R  R
 RRRR
R RR R
R RR R
 RRRR
R    R
`,
`
  CC
 CCCC
CCccCC
 CCCC
  CC
`,
`
  CC
  CC
    
    
  CC
  CC
`
];

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    isReplayEnabled: true,
    // isPlayingBgm: true,
    seed: 1676,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 2
};

const CORE = vec(G.WIDTH*0.5, G.HEIGHT*0.5);

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector,
 * accel: Vector,
 * ammo: number,
 * ammoCooldown: number
 * }} Player
 */

/** @type { Player } */
let player;

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector
 * }} Bullet
 */

/** @type { Bullet [] } */
let bullets

/**
 * @typedef {{
 * pos: Vector,
 * vel: Vector
 * }} Enemy
 */

/** @type { Enemy [] } */
 let enemies;

 /**
  * @typedef {{
  * pos: Vector,
  * lifetime: number
  * }} Explosion
  */

 /**@type { Explosion [] } */
let explosions;

/**
 * @typedef {{
 * pos: Vector
 * }} Package
 */

/** @type { Package } */
let package;

/** @type { number } */
let spawnCooldown

/** @type { number } */
let coreAngle;

/** @type { {origin: Vector, size: number} } */
let grid;

/** @type { number } */
let multiplier;

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH*0.5, G.HEIGHT*0.1),
            vel: vec(0, 0),
            accel: vec(0, G.GRAVITY),
            ammo: G.PLAYER_MAX_AMMO,
            ammoCooldown: G.PLAYER_AMMO_COOLDOWN
        }
        bullets = [];
        enemies = [];
        explosions = [];
        package = null;

        spawnCooldown = G.ENEMY_BASE_SPAWN_RATE
        coreAngle = 0;

        grid = {
            origin: vec(
                -rnd(G.WIDTH * 0.1),
                -rnd(G.HEIGHT * 0.1)
            ),
            size: rndi(24, 48)
        }
        multiplier = 1;
    }

    // Backgrid
    color("light_yellow");
    let gridAmt = ceil(G.WIDTH / grid.size) + 1;
    for (let i = 0; i < gridAmt; i++) {
        rect(
            grid.origin.x,
            grid.origin.y + i * grid.size,
            G.WIDTH*1.2,
            1
        );
    }
    for (let j = 0; j < gridAmt; j++) {
        rect(
            grid.origin.x + j * grid.size,
            grid.origin.y,
            1,
            G.HEIGHT*1.2
        );
    }

    // Core
    coreAngle += 0.1;
    
    color("yellow");
    arc(CORE, G.CORE_RADIUS, 9);
    // arc(CORE, G.CORE_RADIUS/4, 6);
    // color("light_yellow");
    // arc(CORE.x - 5, CORE.y - 3, 3, 5);
    // arc(CORE.x - 8, CORE.y + 2, 2, 3);
    // arc(CORE.x + 10, CORE.y - 8 , 2, 3);
    // arc(CORE.x + 7, CORE.y + 8 , 1, 2);
    // Reactor
    color("light_yellow");
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4, coreAngle+PI/4)
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4+PI, coreAngle+PI/4+PI)
    
    // Spawning mechanic
    spawnCooldown--;
    if (spawnCooldown <= 0) {

        let ePos = generatePosFromPlayer(30);

        enemies.push({
            pos: ePos,
            vel: vec(G.BULLET_SPD, 0).
                rotate(vec(ePos.x, ePos.y).angleTo(player.pos))
        });

        spawnCooldown = Math.max(
            G.ENEMY_BASE_SPAWN_RATE - difficulty*10,
            G.ENEMY_MIN_SPAWN_RATE
        );

        play("powerUp");
    }

    // Player
    player.pos.add(player.vel);
    player.vel.add(player.accel);
    player.accel = vec(G.GRAVITY)
        .rotate(player.pos.angleTo(CORE));
    player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    // player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    // if (0 > player.pos.x || player.pos.x > G.WIDTH)
    //     player.vel.x *= -1;
    // if (0 > player.pos.y || player.pos.y > G.HEIGHT)
    //     player.vel.y *= -1;
    player.ammoCooldown--;
    if (player.ammoCooldown <= 0) {
        if (player.ammo < G.PLAYER_MAX_AMMO) {
            player.ammo++;
            // play("coin");
        }
        player.ammoCooldown = G.PLAYER_AMMO_COOLDOWN;
    }

    if (player.pos.distanceTo(CORE) <= G.CORE_RADIUS_COLLISION) {
        end("DESTROYED BY CORE")
        play("explosion");
    }

    if (input.isJustPressed && player.ammo > 0) {
        // const angle = input.pos.angleTo(player.pos);
        const angle = player.pos.angleTo(input.pos);
        player.vel = vec(G.THRUSTER_STRENGTH, 0).rotate(angle+PI);

        bullets.push({
            pos: vec(player.pos.x, player.pos.y),
            vel: vec(G.BULLET_SPD, 0).rotate(angle)
        });
        player.ammo--;
        player.ammoCooldown = G.PLAYER_AMMO_COOLDOWN;

        color("cyan");
        particle(player.pos, 20, 2, angle, PI/3);
        // play("jump");
        play("laser");
    }

    // Player: draw
    // color("blue");
    // arc(player.pos, 3);
    color("black");
    const pAngle = vec(0, 0).angleTo(player.vel);
    // char("a", player.pos, {rotation: vec(0, 0).angleTo(player.vel)});
    bar(player.pos, 2, 4, pAngle);
    bar(player.pos, 1, 2, pAngle, -3)
    color("cyan");
    bar(player.pos, 1, 2, pAngle - PI/2, 3);
    bar(player.pos, 1, 2, pAngle + PI/2, 3);
    color("red");

    // Ammo counter
    color("cyan");
    for (let i = 0; i < player.ammo; i++) {
        box(player.pos.x + 6, player.pos.y + 3 - i*2, 1);
    }

    // Explosions
    remove(explosions, (e) => {
        e.lifetime++;
        const radius = sin(e.lifetime * 0.1) * G.EXPLOSION_BASE_RADIUS;

        color("red");
        arc(e.pos, radius);
        return (radius < 0);
    });

    // Enemies
    remove(enemies, (e) => {
        e.pos.add(e.vel);
        e.vel = vec(G.ENEMY_SPD, 0).rotate(e.pos.angleTo(player.pos));

        color("red");
        // const eAngle = vec(0, 0).angleTo(e.vel);
        // const isCollidingWithExplosion = char("c", e.pos).isColliding.rect.red;
        // const isCollidingWithExplosion =
        //     bar(e.pos, 2, 4, eAngle).isColliding.rect.red;
        // const isCollidingWithPlayer =
        //     bar(e.pos, 2, 4, eAngle).isColliding.rect.black;
        const isCollidingWithExplosion = char("a", e.pos).isColliding.rect.red;
        const isCollidingWithPlayer = char("a", e.pos).isColliding.rect.black;
        color("light_red");
        // const eAngle = vec(0, 0).angleTo(e.vel);
        // bar(e.pos, 1, 1, eAngle, -4);
        bar(e.pos, 1, 1, vec(0, 0).angleTo(e.vel), -4);

        if (isCollidingWithExplosion) {
            color("red");
            particle(e.pos, 10, 2);
            addScore(G.POINT_ENEMY * multiplier, e.pos);
            play("hit");
        }

        if (isCollidingWithPlayer) {
            end("CONSUMED BY VERACITY");
            play("explosion");
        }

        return (isCollidingWithExplosion);
    });

    // Bullets
    remove(bullets, (b) => {
        b.pos.add(b.vel);

        color("cyan");
        // const isCollidingWithEnemy = box(b.pos, 4).isColliding.char.c;
        const isCollidingWithEnemy = char("b", b.pos).isColliding.char.a;
        const isCollidingWithCore = char("b", b.pos).isColliding.rect.yellow;

        if (isCollidingWithEnemy || isCollidingWithCore) {
            explosions.push({
                pos: vec(b.pos.x, b.pos.y),
                lifetime: 0
            });

            color("red");
            particle(b.pos, 20, 3);
            play("select");
        }

        return (
            isCollidingWithEnemy
            || isCollidingWithCore
            || !b.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
        );
    });

    // Package
    if (package != null) {
        color("cyan");
        const isCollidingWithPlayer = rect(
            package.pos.x - 3,
            package.pos.y - 3,
            7,
            7
            ).isColliding.rect.black;
        color("white");
        text("+", package.pos);

        if (isCollidingWithPlayer) {
            player.ammo = G.PLAYER_MAX_AMMO;
            addScore(G.POINT_PACKAGE + 10 * multiplier, package.pos);
            multiplier++;

            color("cyan");
            particle(package.pos);
            play("coin");

            package = null;
        }
    } else {
        package = {
            pos: generatePosFromPlayer(70)
        }
    }

    /**
     * @param { number } distance The minimum required distance from player
     */
    function generatePosFromPlayer(distance) {
        let posX = rnd(G.WIDTH * 0.1, G.WIDTH * 0.9);
        let posY = rnd(G.WIDTH * 0.1, G.WIDTH * 0.9);
        do {
            posX = rnd(G.WIDTH * 0.1, G.WIDTH * 0.9);
            posY = rnd(G.WIDTH * 0.1, G.WIDTH * 0.9);
        } while (
            vec(posX, posY).distanceTo(player.pos) < distance
            || vec(posX, posY).distanceTo(CORE) < G.CORE_RADIUS_COLLISION*2
        );

        return vec(posX, posY);
    }
}
