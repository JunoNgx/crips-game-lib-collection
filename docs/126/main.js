title = "";

description = `
`;

const G = {
    WIDTH: 150,
    HEIGHT: 150,
    CORE_RADIUS: 11,
    CORE_RADIUS_COLLISION: 15,
    GRAVITY: 0.01,
    THRUSTER_STRENGTH: 0.7,

    PLAYER_MAX_AMMO: 4,
    PLAYER_AMMO_COOLDOWN: 120,
    BULLET_SPD: 2.7,
    ENEMY_SPD: 0.2,
    ENEMY_BASE_SPAWN_RATE: 200,
    EXPLOSION_BASE_RADIUS: 12,

    POINT_ENEMY: 1,
    POINT_PACKAGE: 30
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
    // theme: "dark"
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
    color("light_cyan");
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4, coreAngle+PI/4)
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4+PI, coreAngle+PI/4+PI)
    
    // Spawning mechanic
    spawnCooldown--;
    if (spawnCooldown <= 0) {

        let posX = rnd(0, G.WIDTH);
        let posY = rnd(0, G.HEIGHT);
        do {
            posX = rnd(0, G.WIDTH);
            posY = rnd(0, G.HEIGHT);
        } while (vec(posX, posY).distanceTo(player.pos) < 50);

        enemies.push({
            pos: vec(posX, posY),
            vel: vec(G.BULLET_SPD, 0).
                rotate(vec(posX, posY).angleTo(player.pos))
        });

        spawnCooldown = Math.max(
            G.ENEMY_BASE_SPAWN_RATE - difficulty*10,
            60
        );
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
            // play();
        }
        player.ammoCooldown = G.PLAYER_AMMO_COOLDOWN;
    }

    if (player.pos.distanceTo(CORE) <= G.CORE_RADIUS_COLLISION) {
        // end()
        // play("powerUp");
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

        color("light_green");
        particle(player.pos, 20, 2, angle, PI/3);
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
    color("light_green");
    for (let i = 0; i < player.ammo; i++) {
        box(player.pos.x + 6, player.pos.y + 3 - i*2, 1);
    }

    // Package
    if (package != null) {

    }

    remove(explosions, (e) => {
        e.lifetime++;
        const radius = sin(e.lifetime * 0.1) * G.EXPLOSION_BASE_RADIUS;

        color("red");
        arc(e.pos, radius);
        return (radius < 0);
    });

    remove(enemies, (e) => {
        e.pos.add(e.vel);
        e.vel = vec(G.ENEMY_SPD, 0).rotate(e.pos.angleTo(player.pos));

        color("light_red");
        // const eAngle = vec(0, 0).angleTo(e.vel);
        // const isCollidingWithExplosion = char("c", e.pos).isColliding.rect.red;
        // const isCollidingWithExplosion =
        //     bar(e.pos, 2, 4, eAngle).isColliding.rect.red;
        // const isCollidingWithPlayer =
        //     bar(e.pos, 2, 4, eAngle).isColliding.rect.black;
        const isCollidingWithExplosion = char("a", e.pos).isColliding.rect.red;
        // color("light_red");
        const eAngle = vec(0, 0).angleTo(e.vel);
        bar(e.pos, 1, 1, eAngle, -4);

        if (isCollidingWithExplosion) {
            color("light_red");
            particle(e.pos, 10, 2);
        }

        return (isCollidingWithExplosion);
    });

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
            // play("explosion");
        }

        return (
            isCollidingWithEnemy
            || isCollidingWithCore
            || !b.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
        );
    });
}
