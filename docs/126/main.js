title = "";

description = `
`;

const G = {
    WIDTH: 150,
    HEIGHT: 150,
    CORE_RADIUS: 11,
    GRAVITY: 0.01,
    THRUSTER_STRENGTH: 0.7,

    PLAYER_MAX_AMMO: 4,
    PLAYER_AMMO_COOLDOWN: 120,
    BULLET_SPD: 2.7,
    ENEMY_SPD: 0.2,
    EXPLOSION_BASE_RADIUS: 10,
};

characters = [];

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

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH*0.5, G.HEIGHT*0.25),
            vel: vec(0, 0),
            accel: vec(0, G.GRAVITY),
            ammo: G.PLAYER_MAX_AMMO,
            ammoCooldown: G.PLAYER_AMMO_COOLDOWN
        }
        bullets = [];
        enemies = [];
        explosions = [];
        package = null;
    }

    // Drawing the core platnet
    color("yellow");
    arc(CORE, G.CORE_RADIUS, 9);
    arc(CORE, G.CORE_RADIUS/4, 6);
    color("light_yellow");
    arc(CORE.x - 5, CORE.y - 3, 3, 5);
    arc(CORE.x - 8, CORE.y + 2, 2, 3);
    arc(CORE.x + 10, CORE.y - 8 , 2, 3);
    arc(CORE.x + 7, CORE.y + 8 , 1, 2);

    // Player
    player.pos.add(player.vel);
    player.vel.add(player.accel);
    player.accel = vec(G.GRAVITY)
        .rotate(player.pos.angleTo(CORE));
    // player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
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

    if (input.isJustPressed && player.ammo > 0) {
        // const angle = input.pos.angleTo(player.pos);
        const angle = player.pos.angleTo(input.pos);
        player.vel = vec(G.THRUSTER_STRENGTH, 0).rotate(angle+PI);

        bullets.push({
            pos: vec(player.pos.x, player.pos.y),
            vel: vec(G.BULLET_SPD, 0).rotate(angle)
        });
        player.ammo--;

        color("cyan");
        particle(player.pos, 20, 1, angle, PI/3);
    }

    // Player: draw
    color("blue");
    arc(player.pos, 3);

    color("green");
    for (let i = 0; i < player.ammo; i++) {
        box(player.pos.x + 6, player.pos.y + 3 - i*2, 1);
    }

    remove(bullets, (b) => {
        b.pos.add(b.vel);

        color("cyan");
        const isCollidingWithEnemy = box(b.pos, 5).isColliding.char.c;

        if (isCollidingWithEnemy) {

        }

        return (isCollidingWithEnemy || !b.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });

    remove(enemies, (e) => {
        e.pos.add(e.vel);
        e.vel = vec(G.ENEMY_SPD, 0).rotate(e.pos.angleTo(player.pos));

        const isCollidingWithExplosion = char("c", e.pos).isColliding.rect.red;

        return (isCollidingWithExplosion);
    });

    remove(explosions, (e) => {
        e.lifetime++;
        const radius = sin(e.lifetime * 0.1) * G.EXPLOSION_BASE_RADIUS;

        return (radius < 0);
    });
}
