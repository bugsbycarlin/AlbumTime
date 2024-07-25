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
        dragTarget.parent.toLocal(event.global, null, dragTarget.position);
    }
}

function onDragStart(event)
{
    this.alpha = 0.9;
    this.offset_x = event.global.x - this.x + 15; // the 15 is to make it snap a bit
    this.offset_y = event.global.y - this.y + 15;
    dragTarget = this;
    this.scale.set(0.85,0.85);
    game.screens["display"].album_text_back.text = dragTarget.album_name;
    game.screens["display"].album_text_front.text = dragTarget.album_name;
    game.screens["display"].layers["albums"].removeChild(this);
    game.screens["display"].layers["albums"].addChild(this);
    game.screens["display"].on('pointermove', onDragMove);
}

function onDragEnd()
{
    if (dragTarget)
    {
        let width = game.screens["display"].game_width;
        let height = game.screens["display"].game_height;
        dragTarget.scale.set(0.75,0.75);
        game.screens["display"].off('pointermove', onDragMove);
        dragTarget.alpha = 1;
        if (dragTarget.x > width - 300 && dragTarget.x <= width * 1.1 
          && dragTarget.y > height - 300 && dragTarget.y <= height * 1.1) {
          dragTarget.x = width / 2;
          dragTarget.y = height / 2;
        }
        dragTarget = null;
    }
}


class Display extends Screen {
  // Set up the screen
  initialize(width, height) {
    this.state = null;

    this.game_width = width;
    this.game_height = height;

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
    this.album_text_font = {fontFamily: "Wonderbar", fontSize: 24, fontWeight: 200, fill: 0xFFFFFF, letterSpacing: 1, align: "left"};


    let background = makeSprite("living_room_floor_" + dice(9), layers["background"], 0, 0, 0, 0, false)
    background.scale.set(0.5, 0.5);

    let font_colors = [0x83E3C8, 0xE6746E, 0x534745, 0xF1BC76]
    for (let i = 0; i < 4; i++) {
      let album_time = makeText("Album \n      Time", i == 3 ? this.font_with_stroke : this.font, layers["background"], 36 - 6 * i, 95 - 6 * i, 0, 0.5);
      album_time.style.fill = font_colors[i];
    }

    this.album_text_back = makeText("", this.album_text_font, layers["background"], 50, this.game_height - 30, 0, 0.5);
    this.album_text_back.style.fill = 0xFFFFFF;
    this.album_text_front = makeText("", this.album_text_font, layers["background"], 50 - 2, this.game_height - 30 - 2, 0, 0.5);
    this.album_text_front.style.fill = 0x000000;

    this.record_player = makeSprite("record_player_smaller", layers["background"], this.game_width - 272, this.game_height - 250, 0, 0, false)
    this.record_player.scale.set(250/512, 250/512);


    let request = new XMLHttpRequest();
      request.open("GET", "Data/master_list.txt", true);
      request.responseType = "text";
      request.onload = function(e) {
        game.master_list = []
        let master_list_text = this.response.split("\n");
        for (let i = 0; i < master_list_text.length - 1; i += 4) {
          game.master_list.push({
            path: master_list_text[i + 1],
            artist: master_list_text[i + 2],
            album: master_list_text[i + 3],
          })
        }

        game.screens["display"].makeAlbums();
      }
      request.send();
  }

  async makeAlbums() {
    let layers = this.layers;

    let choices = [];
    for (let i = 0; i < 10; i++) {
      choices.push(dice(game.master_list.length));
    }
    let info = choices.map(x => game.master_list[x]);
    let names = choices.map(x => "Data/" + game.master_list[x].artist + " - " + game.master_list[x].album + ".png");
    const assetsPromise = PIXI.Assets.load(names);
    assetsPromise.then((assets) => {
      let direction = 1;
      if (dice(2) == 2) direction = -1;
      for (let i = 0; i < 10; i++) {
        let cover = names[i];
        let test_album = new PIXI.Container();

        test_album.position.set(this.game_width * 0.5 - direction * this.game_width * 0.25 + direction * this.game_width * 0.05 * i - 5 + dice(10) - 50, -50 + this.game_height * (0.5 + 0.2 * Math.random()));
        layers["albums"].addChild(test_album);

        let b = makeBlank(test_album, 303, 303, 6, 6, 0x000000, 0.5, 0.5, false)
        b.alpha = 0.3
        makeBlank(test_album, 300, 300, 2, 2, 0x534745, 0.5, 0.5, false)
        let album_cover = makeSprite(cover, test_album, 0, 0, 0.5, 0.5, false)
        album_cover.scale.set(300 / album_cover.width, 300 / album_cover.height)

        test_album.album_name = game.master_list[choices[i]].artist + " - " + game.master_list[choices[i]].album;
        test_album.scale.set(0.75, 0.75)
        test_album.eventMode = 'static';
        test_album.cursor = 'pointer';
        test_album.on('pointerdown', onDragStart, test_album);
      }
    });
  }

  // Regular update method
  update(diff) {
    let fractional = diff / (1000/30.0);

  }
}

