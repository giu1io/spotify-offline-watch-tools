# Copy Spotify Playlist for 🍎 Watch Offline Playback

This tools copies tracks from a Spotify playlist to a different playlist to work around issues in Spotify offline syncing on Apple Watch.

## What issues does this solve

1) Spotify's Apple Watch app syncs only the first 50 tracks in a playlist, in the playlist sorting order. This tool updates a new playlist with _only_ the 50 most recently added tracks from the source playlist so you can always have the most recent tracks with you.

2) Spotify's app does not update a playlist automatically on the watch when new tracks are added to it. The only way to update the playlist is to remove it from the watch and add it again. This will make the watch download _all_ of the tracks again not just the new ones. However the tracks will not be downloaded again if they exist in another playlist. 
We can work around this by creating a copy of the offline playlist and making it available offline. This will happen almost instantly because all of the tracks are already offline. After having done this we can remove and add our original playlist from the watch and only the new tracks will be downloaded. After the sync is completed the secondary playlist can be removed from the watch until we need to update it again.

## How to

### Step 1

Copy file `config.json` in the `config` folder. The file must have the following keys:  

```
{
    "spotifyKeys": {
        "clientSecret": "client:secret",
        "clientId": "client:id"
    },
    "playlists": {
        "ogPlaylist": "playlist:id",
        "destPlaylist": "playlist:id",
        "syncHelperPlaylist": "playlist:id"
    }
}
```

You can get the `clientSecret` and `clientId` from the [Spotify Develop Portal](https://developer.spotify.com/) by creating a new application and adding `http://localhost:8080/callback` in the allowed Redirect URIs.

![Image of Spotify Develop Portal's UI](/img/redirect_uris.png)

`ogPlaylist` is the id of the source playlist where the tool will extract the 50 most recently added tracks.

`destPlaylist` is the id of the destination playlist where the tracks will be added to. **This playlist will be overwritten!!!**

`syncHelperPlaylist` is the id of the playlist where a copy of `destPlaylist` will be saved before being updated. This is useful to speed up the update of the original playlist when syncing to the watch. This is optional and can be set to `null` if you don't need this copy. **This playlist will be overwritten!!!**

### Step 2

Run `npm install`

Run `npm run auth`

Follow the on-screen instructions.

### Step 3

Run `npm start` every time you want to update the destination playlist.