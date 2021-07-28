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

    BASE_SPAWN_RATE: 200,
    MIN_SPAWN_RATE: 45,

    PACKAGE_SPD_MIN: 0.1,
    PACKAGE_SPD_MAX: 0.2,

    BONUS_DURATION: 180,
    GRID_SIZE_MIN: 16,
    GRID_SIZE_MAX: 32
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

/** @typedef {{ pos: Vector }} TrailNode*/
/** @type { TrailNode [] } */
let trail;

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
        trail = times(10, () => {
            return {
                pos: vec(0, 0)
            };
        });
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

        color("cyan");
        particle(player.pos, 20, 2, angle, PI/3);
        play("laser");
    }

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

    // Trail
    for (let i = 0; i < trail.length; i++) {
        const time = (i + 1) * 10;
        trail[i].pos.x = player.pos.x
            + player.vel.x*time + 0.5*player.accel.x*time*time;
        trail[i].pos.y = player.pos.y
            + player.vel.y*time + 0.5*player.accel.y*time*time;

        color("cyan");
        box(trail[i].pos, 2);
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
