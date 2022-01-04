title = "";

description = `
`;

const G = {
    WIDTH: 128,
    HEIGHT: 128,

    // MISSILE_SPD: 0.5,
    // MISSILE_TURN_SPD: 0.05,

    BARREL_LENGTH: 8,
    CANNON_ROTATION_SPD: 0.06,

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

/** @type { {pos: Vector, angle: number, isRotating: boolean, isRotatingRight: boolean} } */
let cannon
/** @type { {pos: Vector, vel: Vector, angle: number} } */
let missile
// /** @type { {pos: Vector, vel: Vector, des: Vector} [] } */
// let bullets;
/** @type { {pos: Vector, vel: Vector} [] }*/
let enemies;
/** @type { {pos: Vector, lifetime: number} [] } */
let explosions;
/** @type { number } */
let spawnCooldown;

function update() {
    if (!ticks) {
        cannon = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.9),
            angle: -PI/2,
            isRotating: true,
            isRotatingRight: true
        }
        missile = null;
        // bullets = [];
        enemies = [];
        explosions = [];
        spawnCooldown = G.SPAWN_RATE_BASE;
    }


    // Mechanics
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

        if (missile === null) { // Fire a missile

            // const angle = CANNON_POS.angleTo(input.pos);
            const initPos = vec(cannon.pos.x, cannon.pos.y)
                .addWithAngle(cannon.angle, G.BARREL_LENGTH);
            // bullets.push({
            //     pos: initPos,
            //     vel: vec(G.BULLET_SPD, 0).rotate(angle),
            //     des: vec(input.pos.x, input.pos.y)
            // })
    
            missile = {
                pos: initPos,
                vel: vec(0, -G.MISSILE_SPD).rotate(cannon.angle),
                angle: cannon.angle
            }
    
            color("yellow");
            particle(initPos, 7, 2, cannon.angle, PI/4);
            // play();

        } else { // Else detonate the missile

            explosions.push({
                pos: vec(missile.pos.x, missile.pos.y),
                lifetime: 0
            });
            color("red");
            particle(missile.pos, 20, 3);
            missile = null
            // play("select");

        }
    }

    // Entities

    // The ground
    color("light_black");
    rect(G.WIDTH * 0.0, G.HEIGHT * 0.930, G.WIDTH * 1.0, G.HEIGHT * 0.075);
    rect(G.WIDTH * 0.4, G.HEIGHT * 0.875, G.WIDTH * 0.2, G.HEIGHT * 0.075); 

    // Cannon
    if (cannon.isRotating) {
        if (cannon.isRotatingRight) {
            cannon.angle += G.CANNON_ROTATION_SPD
            if (cannon.angle > -PI*(0.5 - 0.3)) cannon.isRotatingRight = false
        } else {
            cannon.angle -= G.CANNON_ROTATION_SPD
            if (cannon.angle < -PI*(0.5 + 0.3)) cannon.isRotatingRight = true
        }
    }
    color("blue");
    // rect(G.WIDTH * 0.48, G.HEIGHT * 0.82, G.WIDTH * 0.04, G.HEIGHT * 0.08);
    bar(cannon.pos, 8, 4, cannon.angle, 0.1);

    // Missile
    if (missile) {
        missile.pos.add(missile.vel)
        if (missile.pos.y < 0) missile = null
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

    // remove(bullets, (b) => {
    //     b.pos.add(b.vel);

    //     const hasReachedDestination = b.pos.distanceTo(b.des) < 1;
    //     color("blue");
    //     const isCollidingWithEnemy = bar(b.pos, 5, 3, b.vel.angle)
    //         .isColliding.rect.purple;

    //     if (hasReachedDestination || isCollidingWithEnemy) {
    //         explosions.push({
    //             pos: vec(b.pos.x, b.pos.y),
    //             lifetime: 0
    //         });
    //         color("red");
    //         particle(b.pos, 20, 3);
    //         // play("select");
    //     }

    //     return (isCollidingWithEnemy
    //         || hasReachedDestination
    //         || !b.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT)
    //     );
    // });


    

    // if (missile === null) {
        
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
