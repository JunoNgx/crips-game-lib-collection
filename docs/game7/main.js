title = "";

description = `
`;

const G = {
    WIDTH: 128,
    HEIGHT: 128,

    // MISSILE_SPD: 0.5,
    // MISSILE_TURN_SPD: 0.05,

    BARREL_LENGTH: 8,

    BULLET_SPD: 2,

    SPAWN_RATE_BASE: 120,
    ENEMY_SPD_MIN: 0.03,
    ENEMY_SPD_MAX: 0.10,
    EXPLOSION_BASE_RADIUS: 8,
}

characters = [];

options = {
    viewSize: {x: G.WIDTH, y: G.HEIGHT},
    theme: "simple",
    // isDrawingParticleFront: true,
    isDrawingScoreFront: true,
    // isPlayingBgm: true,
    // isReplayEnabled: true,
    // isCapturing: true,
    // isCapturingGameCanvasOnly: true,
    // captureCanvasScale: 2,
    seed: 1
};

/** @type { Vector } */
const CANNON_POS = vec(G.WIDTH * 0.5, G.HEIGHT * 0.9);
// /** @type { {pos: Vector, vel: Vector, angle: number} } */
// let missile;
/** @type { {pos: Vector, vel: Vector, des: Vector} [] } */
let bullets;
/** @type { {pos: Vector, vel: Vector} [] }*/
let enemies;
/** @type { {pos: Vector, lifetime: number} [] } */
let explosions;
/** @type { number } */
let spawnCooldown;

function update() {
    if (!ticks) {
        // missile = null;
        bullets = [];
        enemies = [];
        explosions = [];
        spawnCooldown = G.SPAWN_RATE_BASE;
    }

    color("light_black");
    rect(G.WIDTH * 0.0, G.HEIGHT * 0.930, G.WIDTH * 1.0, G.HEIGHT * 0.075);
    rect(G.WIDTH * 0.4, G.HEIGHT * 0.875, G.WIDTH * 0.2, G.HEIGHT * 0.075); 
    color("blue");
    // rect(G.WIDTH * 0.48, G.HEIGHT * 0.82, G.WIDTH * 0.04, G.HEIGHT * 0.08);
    bar(CANNON_POS, 8, 4, CANNON_POS.angleTo(input.pos), 0.1);

    spawnCooldown--;
    if (spawnCooldown <= 0) {

        let destVec = vec(G.WIDTH * 0.5 + rnd(-5, 5), G.HEIGHT * 0.82);
        let initVec = vec(
            rnd(G.WIDTH * -0.2, G.WIDTH * 1.2),
            rnd(G.HEIGHT * - 0.2, G.HEIGHT * 0.5)
        );
        do {
            initVec = vec(
                rnd(G.WIDTH * -0.2, G.WIDTH * 1.2),
                rnd(G.HEIGHT * - 0.2, G.HEIGHT * 0.5)
            );
        } while (initVec.isInRect(0, 0, G.WIDTH, G.HEIGHT))

        enemies.push({
            pos: initVec,
            vel: vec(rnd(G.ENEMY_SPD_MIN, G.ENEMY_SPD_MAX), 0)
                .rotate(initVec.angleTo(destVec))
        })

        spawnCooldown = G.SPAWN_RATE_BASE - difficulty*10;
    }

    if (input.isJustPressed) {
        const angle = CANNON_POS.angleTo(input.pos);
        const initPos = vec(CANNON_POS.x, CANNON_POS.y)
            .addWithAngle(angle, G.BARREL_LENGTH);
        bullets.push({
            pos: initPos,
            vel: vec(G.BULLET_SPD, 0).rotate(angle),
            des: vec(input.pos.x, input.pos.y)
        })

        color("yellow");
        particle(initPos, 7, 2, angle, PI/4);
        // play();
    }

    remove(explosions, (e) => {
        e.lifetime++;
        const radius = sin(e.lifetime * 0.2) * G.EXPLOSION_BASE_RADIUS;

        color("red");
        arc(e.pos, radius);
        return (radius < 0);
    });

    remove(enemies, (e) => {
        e.pos.add(e.vel);

        color("purple");
        const isCollidingWithExplosion = bar(e.pos, 5, 3, e.vel.angle)
            .isColliding.rect.red;

        if (isCollidingWithExplosion) {
            color("purple");
            particle(e.pos, 10, 2);
            // play("hit");
        }

        return (isCollidingWithExplosion);
    });

    remove(bullets, (b) => {
        b.pos.add(b.vel);

        const hasReachedDestination = b.pos.distanceTo(b.des) < 1;
        color("blue");
        const isCollidingWithEnemy = bar(b.pos, 5, 3, b.vel.angle)
            .isColliding.rect.purple;

        if (hasReachedDestination || isCollidingWithEnemy) {
            explosions.push({
                pos: vec(b.pos.x, b.pos.y),
                lifetime: 0
            });
            color("red");
            particle(b.pos, 20, 3);
            // play("select");
        }

        return (isCollidingWithEnemy
            || hasReachedDestination
            || !b.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
        );
    });


    

    // if (missile === null) {
    //     missile = {
    //         pos: vec(BARREL_POS.x, BARREL_POS.y),
    //         vel: vec(0, -G.MISSILE_SPD),
    //         angle: -PI/2
    //     }
    //     color("yellow");
    //     particle(BARREL_POS, 15, 1.6, -PI/2, PI/4);
    // }

    // if (missile) {
    //     missile.pos.add(missile.vel);
    //     missile.vel = vec(G.MISSILE_SPD, 0).rotate(missile.angle);

    //     color("black");
    //     // box(missile.pos, 3);
    //     bar(missile.pos, 4, 2, missile.angle);
    //     color("cyan");
    //     bar(missile.pos, 1, 1, missile.angle+PI/2, 3);
    //     bar(missile.pos, 1, 1, missile.angle-PI/2, 3);
    //     color("red");
    //     bar(missile.pos, 2, 1, missile.angle, -1);

    //     color("yellow");
    //     particle(missile.pos, 1, 0.4, missile.angle+PI, PI/4);

    //     if (input.isPressed && input.pos.x >= G.WIDTH * 0.5) {
    //         missile.angle += G.MISSILE_TURN_SPD;
    //     } else if (input.isPressed && input.pos.x < G.WIDTH * 0.5) {
    //         missile.angle -= G.MISSILE_TURN_SPD;
    //     }

    //     if (!missile.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)) missile = null;
    // }


    // text(input.pos.angle.toString(), 3, 10);

}
