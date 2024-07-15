
import eyed3
import os
import sys

locations_filename = sys.argv[1]

with open("Data/master_list.txt", "w") as master_list_file:
  with open(locations_filename) as locations_file:
    locations = [f.strip() for f in locations_file.readlines() if len(f.strip()) > 0]
    
    for location in locations:
      for root, dirs, files in os.walk(location):
        print(root)

        is_album = True

        mp3s = [x for x in files if x.endswith(".mp3")]
        mp3s = sorted(mp3s)
        
        if len(dirs) > 2:
          is_album = False
          print("is not album, has directories")
        elif len(files) < 5:
          is_album = False
          print("is not album, too few files")
        elif len(files) > 80:
          is_album = False
          print("is not album, too many files")
        elif len(mp3s) / len(files) < 0.75:
          is_album = False
          print("is not album, too few mp3s")

        if not is_album:
          continue

        mp3_file = mp3s[0]
        path = root + "/" + mp3_file

        song = eyed3.load(path)

        write_out = True
        if not song.tag.artist or len(song.tag.artist) == 0:
          write_out = False
          print("is not album, first mp3 has no artist")
        if not song.tag.album or len(song.tag.album) == 0:
          write_out = False
          print("is not album, first mp3 has no album name")
        if not song.tag.images or len(song.tag.images) == 0:
          write_out = False
          print("is not album, first mp3 has no album cover")
          print(mp3s)


        if not write_out:
          continue

        artist = song.tag.artist.replace("/","")
        album = song.tag.album.replace("/","")

        master_list_file.write("CODON\n%s\n%s\n%s\n" % (
          root,
          artist,
          album
        ))

        album_cover_filename = artist + " - " + album + ".jpg"
        
        image = song.tag.images[0]
        image_file = open("Data/" + album_cover_filename, "wb")
        image_file.write(image.image_data)
        image_file.close()
