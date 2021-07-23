const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const path = require('path');
const config = path.join(__dirname, './../config/');
const {spotifyKeys, playlists} = require(path.join(config, 'config.json'));
const tokens = require(path.join(config, 'tokens.json'));

const api = new SpotifyWebApi(spotifyKeys);
api.setAccessToken(tokens.access_token);
api.setRefreshToken(tokens.refresh_token);

const {ogPlaylist, destPlaylist, syncHelperPlaylist} = playlists;

async function getAllTracks(ogPlaylist, sort = true) {
    const total = (await api.getPlaylist(ogPlaylist)).body.tracks.total;
    let tracks = [];

    while(tracks.length < total) {
        const trackSet = (await api
            .getPlaylistTracks(ogPlaylist, {
                offset: tracks.length,
                limit: 100,
                fields: 'items'
            })).body.items;

            tracks = tracks.concat(trackSet);
    }

    if(sort)
        tracks.sort((a, b) => a.added_at < b.added_at ? 1 : -1);
    
    return tracks;
}

async function refresh() {
    return api.refreshAccessToken().then(
        function(data) {      
          // Save the access token so that it's used in future calls
          api.setAccessToken(data.body['access_token']);
          tokens.access_token = data.body['access_token'];
          fs.writeFileSync(path.join(config, 'tokens.json'), JSON.stringify(tokens));
    });
}

async function main() {
    await refresh();

    if(syncHelperPlaylist) {
        const backupTracks = await getAllTracks(destPlaylist, false);
        await api.replaceTracksInPlaylist(syncHelperPlaylist, backupTracks.map(t => t.track.uri));
    }

    const ogTracks = await getAllTracks(ogPlaylist);
    const fiftyTracksIds = ogTracks.slice(0, 50).map(t => t.track.uri);

    await api.replaceTracksInPlaylist(destPlaylist, fiftyTracksIds);
}

main()
    .catch(error => console.error(error));