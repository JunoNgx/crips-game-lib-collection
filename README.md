# Crisp Game Library Collection

This is a collection of tiny arcade-like web games using [Kenta Cho's Crisp Library](https://github.com/abagames/crisp-game-lib).

## Orbital Defense

![Orbital Defense Trailer 2](https://raw.githubusercontent.com/JunoNgx/crips-game-lib-collection/master/gifs/OrbitDefTrailer2.gif)

Initial idea: revolving around earth.

As a satellite orbitting earth, defend the planet with minimal control over your weapon.

My first game ever using CrispGameLib, experimenting with the idea of using one button for multiple functions.

[Play](https://junongx.github.io/crips-game-lib-collection/?orbitaldefense)

## Dynamic Duo

![Dynamic Duo trailer 2](https://raw.githubusercontent.com/JunoNgx/crips-game-lib-collection/master/gifs/DynamicDuo2.gif)

**Initial idea**: multiple ships in a shoot'em up.

What's better than one shoot'em up game? Two of them simultaneously interweaving. I've always wanted to make a bullet hell in which the player controls multiple ships at the same time. However, with the engine's limitation to single touch, the idea was scaled down to something more simple, with a slightly different hook. I'd probably make a version with four ships and turn it into a strategy game one of these days.

[Play](https://junongx.github.io/crips-game-lib-collection/?dynamicduo)

## Charge Rush RE

![Charge Rush RE Trailer](https://raw.githubusercontent.com/JunoNgx/crips-game-lib-collection/master/gifs/ChargeRushRETrailer.gif)

**Initial idea**: remaking the original Charge Rush.

[CHARGE RUSH](http://abagames.sakura.ne.jp/html5/cr/), made with [MGL.COFFEE](https://github.com/abagames/mgl.coffee) was one of the earliest exposure I had to Kenta's works, and it has influenced me in profound ways. After all these years of still playing it every now and then, the idea of remaking it was a no brainer ([Celox Inpes](https://github.com/JunoNgx/celox-inpes) was another much less satisfying attempt.).

While my version has inevitably diverged from the original game in a few ways, some of the original features were painstakingly reversed engineered, such as enemy spawning pattern, and most importantly, the audio: weaving the game sound effects with minimal music to imitate the feeling of a drum machine song. Due to the engine's lack of control over audio, a lot of trials and erros were made to reach the desirable outcome, but I was quite satisfied with the release state nevertheless.

[Play](https://junongx.github.io/crips-game-lib-collection/?chargerushre)

## Source

This repository was forked and had releases from the original author (Kenta Cho) removed. The source of my games are stored at `docs/<game-name>/main.js`. The rest of the repository is the engine's source.

## Development summary

TODO

## Build guide

1. Clone this repository
2. `npm install` from the repository root directory
3. `npm run watch_games`
4. Open `http://localhost:4000?<game-folder-in-docs>` with a browser with only the question mark
5. For example: `http://localhost:4000?orbitaldefense`

For more information, visit the [CrispLib's repository](https://github.com/abagames/crisp-game-lib).

# License

This project was released under MIT license.
