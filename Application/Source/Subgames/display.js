//
// This file contains the one and only screen for the application.
// This is the meat of the program.
//
// Copyright 2024 Alpha Zoo LLC.
// Written by Matthew Carlin
//

dragTarget = null;

function onDragMove(event)
{
    if (dragTarget)
    {
        event.global.x -= dragTarget.offset_x;
        event.global.y -= dragTarget.offset_y;
        console.log(event.global);
        dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragStart(event)
{
    this.alpha = 0.9;
    this.offset_x = event.global.x - this.x + 15; // the 15 is to make it snap a bit
    this.offset_y = event.global.y - this.y + 15;
    dragTarget = this;
    game.screens["display"].layers["albums"].removeChild(this);
    game.screens["display"].layers["albums"].addChild(this);
    game.screens["display"].on('pointermove', onDragMove);
}

function onDragEnd()
{
    if (dragTarget)
    {
        game.screens["display"].off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        dragTarget = null;
    }
}


class Display extends Screen {
  // Set up the screen
  initialize(width, height) {
    this.state = null;

    this.albums = [];

    this.layers = {};
    let layers = this.layers;

    this.eventMode = 'static';
    this.on('pointerup', onDragEnd);
    this.on('pointerupoutside', onDragEnd);

    layers["background"] = new PIXI.Container();
    this.addChild(layers["background"]);

    layers["albums"] = new PIXI.Container();
    this.addChild(layers["albums"]);

    this.font = {fontFamily: "Wonderbar", fontSize: 48, fontWeight: 200, fill: 0xFFFFFF, letterSpacing: 1, align: "left"};
    this.font_with_stroke = {fontFamily: "Wonderbar", fontSize: 48, fontWeight: 200, stroke: 0x534745, strokeThickness: 6, fill: 0xFFFFFF, letterSpacing: 1, align: "left"};


    let background = makeSprite("living_room_floor_" + dice(9), layers["background"], 0, 0, 0, 0, false)
    background.scale.set(0.5, 0.5);

    let font_colors = [0x83E3C8, 0xE6746E, 0x534745, 0xF1BC76]
    for (let i = 0; i < 4; i++) {
      let album_time = makeText("Album \n      Time", i == 3 ? this.font_with_stroke : this.font, layers["background"], 36 - 6 * i, 95 - 6 * i, 0, 0.5);
      album_time.style.fill = font_colors[i];
    }

    async function makeAlbums(){
      let choices = [];
      for (let i = 0; i < 10; i++) {
        choices.push(dice(69));
      }
      let names = choices.map(x => "Art/test_covers/folder_" + x + ".jpg");
      console.log(names);
      const assetsPromise = PIXI.Assets.load(names);
      assetsPromise.then((assets) => {
        for (let i = 0; i < 10; i++) {
          let cover = names[i];
          let test_album = new PIXI.Container();
          // this.albums.push(test_album);
          test_album.position.set(width * (0.3 + 0.4 * Math.random()), height * (0.3 + 0.4 * Math.random()));
          layers["albums"].addChild(test_album);

          makeBlank(test_album, 302, 302, 0, 0, 0x534745, 0.5, 0.5, false)
          makeBlank(test_album, 304, 304, 3, 3, 0x534745, 0.5, 0.5, false)
          makeBlank(test_album, 300, 300, 2, 2, 0xD19C56, 0.5, 0.5, false)
          let album_cover = makeSprite(cover, test_album, 0, 0, 0.5, 0.5, false)
          album_cover.scale.set(300 / album_cover.width, 300 / album_cover.height)

          test_album.eventMode = 'static';
          test_album.cursor = 'pointer';
          test_album.on('pointerdown', onDragStart, test_album);
        }
      });
    }
    makeAlbums();
  }

  // Regular update method
  update(diff) {
    let fractional = diff / (1000/30.0);

  }
}

