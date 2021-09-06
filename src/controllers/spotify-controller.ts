import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import type { Request, Response, NextFunction } from 'express'

const spotifyGetHeaders = (req: Request) => {
  return {
    Authorization: 'Bearer ' + req.session.user?.access_token,
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
}
// time range can be 'short_term', 'medium_term', and 'long_term'
const getTopPromise = (req: Request, url: string) => {
  return new Promise<Array<unknown>>((resolve, reject) => {
    // if no time range is given default to 'short_term'
    const timeRange =
      req.query.time_range === undefined ? 'short_term' : req.query.time_range as string
    axios({
      method: 'get',
      url: `${url}?time_range=${timeRange}&limit=50`,
      headers: spotifyGetHeaders(req)
    })
      .then((res: { data: { items: Array<unknown> } }) => {
        // if the promise was succesful then resolve the top items.
        resolve(res.data.items)
      })
      .catch((err: Error) => {
        reject(err)
      })
  })
}
async function getTopArtists (req: Request, res: Response, next: NextFunction) {
  await getTopPromise(req, 'https://api.spotify.com/v1/me/top/artists')
    .then((response) => {
      res.status(StatusCodes.OK).send(response)
    })
    .catch((err: Error) => {
      console.log('ERROR IN GET TOP ARTISTS')
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getTopTracks (req: Request, res: Response, next: NextFunction) {
  await getTopPromise(req, 'https://api.spotify.com/v1/me/top/tracks')
    .then((response) => {
      res.status(StatusCodes.OK).send(response)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getPlaylists (req: Request, res: Response, next: NextFunction) {
  await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/playlists',
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: { items: Array<unknown> } }) {
      // the json is nested in a way that the below will retrieve playlists
      res.status(StatusCodes.OK).send(response.data.items)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getPlaylistTracks (req: Request, res: Response, next: NextFunction) {
  const playlistId = req.query.playlist_id as string

  await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=ES`,
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: { items: Array<unknown> } }) {
      // get the list of items
      const items: Array<unknown> = response.data.items
      res.status(StatusCodes.OK).send(items)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getTrackFeatures (req: Request, res: Response, next: NextFunction) {
  const track_ids = req.query.track_ids as Array<string>

  await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/audio-features?ids=${track_ids}`,
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: unknown }) {
      res.status(StatusCodes.OK).send(response.data)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function deletePlaylistItems (req: Request, res: Response, next: NextFunction) {
  const playlistId = req.query.playlist_id as string
  const trackObjs: Array<{uri: string}> = req.body.tracks
  const uriData = []

  for (let i = 0; i < trackObjs.length; i++) {
    const track = trackObjs[i]
    uriData.push({ uri: track.uri })
  }

  await axios({
    method: 'delete',
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: spotifyGetHeaders(req),
    data: { tracks: uriData }
  })
    .then(function () {
      res.sendStatus(StatusCodes.OK)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function postPlaylistItems (req: Request, res: Response, next: NextFunction) {
  const playlistId = req.query.playlist_id as string
  const trackObjs = req.body.data.tracks as Array<{uri: string}>
  const uriData = []

  // obtain track uris from request body
  for (let i = 0; i < trackObjs.length; i++) {
    const track = trackObjs[i]
    uriData.push(track.uri)
  }

  // use track uris to post items to the given playlist
  await axios({
    method: 'post',
    url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    headers: spotifyGetHeaders(req),
    data: { uris: uriData }
  })
    .then(function () {
      res.sendStatus(StatusCodes.CREATED)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}

function putPlaylistResizeData (req: Request, res: Response) {
  const val = req.query.val as string
  if (req.session.user !== undefined) {
    req.session.user.playlistResizeWidth = val
  }
  console.log(req.session)

  res.sendStatus(StatusCodes.CREATED)
}
function getPlaylistResizeData (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.playlistResizeWidth)
}
function putPlaylistTextFormData (req: Request, res: Response) {
  const val = req.query.val as string
  if (req.session.user !== undefined) {
    req.session.user.playlistIsInTextForm = val
  }
  console.log(req.session)

  res.sendStatus(StatusCodes.CREATED)
}
function getPlaylistTextFormData (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.playlistIsInTextForm)
}
async function getArtistTopTracks (req: Request, res: Response, next: NextFunction) {
  const id = req.query.id as string

  await axios({
    method: 'get',
    url: `https://api.spotify.com/v1/artists/${id}/top-tracks?market=CA`, // market is hard coded as Canada
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: unknown }) {
      res.status(StatusCodes.OK).send(response.data)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getCurrentUserProfile (req: Request, res: Response, next: NextFunction) {
  await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me',
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: unknown }) {
      res.status(StatusCodes.OK).send(response.data)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getCurrentUserSavedTracks (req: Request, res: Response, next: NextFunction) {
  await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/tracks?limit=50',
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: unknown }) {
      res.status(StatusCodes.OK).send(response.data)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function getFollowedArtists (req: Request, res: Response, next: NextFunction) {
  await axios({
    method: 'get',
    url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
    headers: spotifyGetHeaders(req)
  })
    .then(function (response: { data: unknown }) {
      res.status(StatusCodes.OK).send(response.data)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}
async function putPlayTrack (req: Request, res: Response, next: NextFunction) {
  const device_id = req.query.device_id as string
  const track_uri = req.query.track_uri as string

  await axios({
    method: 'put',
    url: `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
    data: { uris: [track_uri] },
    headers: spotifyGetHeaders(req)
  })
    .then(() => {
      res.sendStatus(StatusCodes.CREATED)
    })
    .catch((err: Error) => {
      // run next to pass this error down to a middleware that will handle it
      next(err)
    })
}

const spotifyCtrl = {
  getTopArtists,
  getTopTracks,
  getPlaylists,
  getPlaylistTracks,
  getTrackFeatures,
  deletePlaylistItems,
  postPlaylistItems,
  putPlaylistResizeData,
  getPlaylistResizeData,
  putPlaylistTextFormData,
  getPlaylistTextFormData,
  getArtistTopTracks,
  getCurrentUserProfile,
  getCurrentUserSavedTracks,
  getFollowedArtists,
  putPlayTrack
}

export { spotifyCtrl }
