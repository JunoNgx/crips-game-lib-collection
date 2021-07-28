title = "ARTIFICIAL GRAVITY";

description = `

Recover packages.

Don't crash.



[Tap] Fire Thruster
`;

const G = {
    WIDTH: 150,
    HEIGHT: 150,
    CORE_RADIUS: 11,
    CORE_RADIUS_COLLISION: 15,
    GRAVITY: 0.01,
    THRUSTER_STRENGTH: 0.8,

    PLAYER_MAX_AMMO: 5,
    PLAYER_AMMO_COOLDOWN: 90,

    BASE_SPAWN_RATE: 240,
    MIN_SPAWN_RATE: 60,

    PACKAGE_SPD_MIN: 0.07,
    PACKAGE_SPD_MAX: 0.15,

    BONUS_DURATION: 240,
    GRID_SIZE_MIN: 16,
    GRID_SIZE_MAX: 32,

    GHOST_LIFETIME: 240,
    GHOST_INTERVAL: 4,
    GHOST_FACTOR: 4
};

characters = [];

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "crt",
    isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    isReplayEnabled: true,
    isPlayingBgm: true,
    seed: 167,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 0.3
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
 * }} Package
 */
/** @type { Package [] } */
let packages;

/** @type { number } */
let spawnCooldown

/** @type { number } */
let coreAngle;

/** @type { {origin: Vector, size: number} } */
let grid;

/** @type { {duration: number, value: number} } */
let multiplier;

// An entity with similarity to Player for simulation purpose
/** @type { { pos: Vector, vel: Vector, accel: Vector, lifetime: number } } */
let ghost;

/**@type { Vector [] } */
let ghostTrail;

function update() {
    if (!ticks) {
        player = {
            pos: vec(G.WIDTH*0.5, G.HEIGHT*0.1),
            vel: vec(0, 0),
            accel: vec(0, G.GRAVITY),
            ammo: G.PLAYER_MAX_AMMO,
            ammoCooldown: G.PLAYER_AMMO_COOLDOWN
        }
        packages = [];

        spawnCooldown = G.BASE_SPAWN_RATE
        coreAngle = 0;
        grid = {
            origin: vec(
                -rnd(G.WIDTH * 0.1),
                -rnd(G.HEIGHT * 0.1)
            ),
            size: rndi(G.GRID_SIZE_MIN, G.GRID_SIZE_MAX)
        }
        multiplier = {
            duration: G.BONUS_DURATION,
            value: 0
        }
        ghost = {
            pos: vec(0, 0),
            vel: vec(0, 0),
            accel: vec(0, 0),
            lifetime: G.GHOST_LIFETIME
        };
        resetTrail();
    }

    // Backgrid
    color("light_black");
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
    // Reactor
    color("light_yellow");
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4, coreAngle+PI/4)
    arc(CORE, G.CORE_RADIUS*0.8, 3, coreAngle-PI/4+PI, coreAngle+PI/4+PI)
    
    // Spawning mechanic
    spawnCooldown--;
    if (spawnCooldown <= 0) {

        const pos = generatePosFromPlayer(30);
        const spd = rnd(G.PACKAGE_SPD_MIN, G.PACKAGE_SPD_MAX);

        packages.push({
            pos: pos,
            vel: vec(spd, 0).rotate(vec(pos.x, pos.y).angleTo(CORE))
        });

        spawnCooldown = Math.max(
            G.BASE_SPAWN_RATE - difficulty*10,
            G.MIN_SPAWN_RATE
        );

        // play("select");
    }

    // Multiplier
    if (multiplier.value > 0) multiplier.duration--;
    if (multiplier.duration <= 0) {
        multiplier.value--;
        multiplier.duration = G.BONUS_DURATION;
    };

    // Player
    player.pos.add(player.vel);
    player.vel.add(player.accel);
    player.accel = vec(G.GRAVITY)
        .rotate(player.pos.angleTo(CORE));
    player.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    // player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    player.ammoCooldown--;
    if (player.ammoCooldown <= 0) {
        if (player.ammo < G.PLAYER_MAX_AMMO) {
            player.ammo++;
            // play("coin");
        }
        player.ammoCooldown = G.PLAYER_AMMO_COOLDOWN;
    }

    if (player.pos.distanceTo(CORE) <= G.CORE_RADIUS_COLLISION) {
        end("CRASHED")
        play("explosion");
    }

    if (input.isJustPressed && player.ammo > 0) {
        const angle = player.pos.angleTo(input.pos);
        player.vel = vec(G.THRUSTER_STRENGTH, 0).rotate(angle+PI);

        player.ammo--;
        player.ammoCooldown = G.PLAYER_AMMO_COOLDOWN;

        resetTrail();

        color("cyan");
        particle(player.pos, 20, 2, angle, PI/3);
        play("laser");
    }

    // Trajectory projection draw
    ghostTrail.forEach((n) => {
        color("green");
        box(n, 2);
    });

    // Player: draw
    color("black");
    const pAngle = vec(0, 0).angleTo(player.vel);
    bar(player.pos, 2, 4, pAngle);
    color("cyan");
    bar(player.pos, 1, 2, pAngle, -3)
    bar(player.pos, 1, 2, pAngle - PI/2, 3);
    bar(player.pos, 1, 2, pAngle + PI/2, 3);
    color("red");

    // Ammo counter
    color("cyan");
    for (let i = 0; i < player.ammo; i++) {
        box(player.pos.x + 9, player.pos.y + 3 - i*2, 1);
    }

    // Packages
    remove(packages, (p) => {
        p.pos.add(p.vel);

        color("red");
        const isCollidingWithPlayer = rect(
            p.pos.x - 3,
            p.pos.y - 3,
            7,
            7
            ).isColliding.rect.black;
        color("black");
        text("+", p.pos);

        if (isCollidingWithPlayer) {
            addScore(1 + multiplier.value, p.pos);

            multiplier.value++;
            multiplier.duration = G.BONUS_DURATION;

            color("red");
            particle(p.pos);
            play("select");
        }

        if (p.pos.distanceTo(CORE) < G.CORE_RADIUS_COLLISION) {
            color("green");
            text("X", p.pos);
            end("PACKAGE DESTROYED");
            play("explosion");
        }

        return isCollidingWithPlayer;
    });

    // Ghost simulation for trajectory projection
    ghost.pos.x += ghost.vel.x * G.GHOST_FACTOR;
    ghost.pos.y += ghost.vel.y * G.GHOST_FACTOR;
    ghost.vel.x += ghost.accel.x * G.GHOST_FACTOR;
    ghost.vel.y += ghost.accel.y * G.GHOST_FACTOR;
    ghost.accel = vec(G.GRAVITY)
        .rotate(ghost.pos.angleTo(CORE));
    ghost.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);
    ghost.lifetime--;

    // // Ghost drawing only for debugging
    // color("yellow");
    // box(ghost.pos, 5);

    if (ghost.lifetime % G.GHOST_INTERVAL === 0) {
        ghostTrail.push(vec(ghost.pos.x, ghost.pos.y));
    } else if (ghost.lifetime <= 0) {
        resetTrail();
        play("hit");
    }

    function resetTrail() {
        ghost.pos = vec(player.pos.x, player.pos.y);
        ghost.vel = vec(player.vel.x, player.vel.y);
        ghost.accel = vec(player.accel.x, player.accel.y);
        ghost.lifetime = G.GHOST_LIFETIME
        ghostTrail = [];
    }

    /**
     * @param { number } distance The minimum required distance from player
     */
    function generatePosFromPlayer(distance) {
        let posX = rnd(G.WIDTH * -0.2, G.WIDTH * 1.2);
        let posY = rnd(G.WIDTH * -0.2, G.WIDTH * 1.2);
        do {
            posX = rnd(G.WIDTH * -0.2, G.WIDTH * 1.2);
            posY = rnd(G.WIDTH * -0.2, G.WIDTH * 1.2);
        } while (
            vec(posX, posY).distanceTo(player.pos) < distance
            || vec(posX, posY).distanceTo(CORE) < 70
        );

        return vec(posX, posY);
    }
}
