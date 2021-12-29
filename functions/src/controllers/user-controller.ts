import { StatusCodes } from 'http-status-codes'
import type { Request, Response } from 'express'

function putPlaylistResizeData (req: Request, res: Response) {
  const val = req.query.val as string
  if (req.session.user !== undefined) {
    req.session.user.playlistResizeWidth = val
  }

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

  res.sendStatus(StatusCodes.CREATED)
}
function getPlaylistTextFormData (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.playlistIsInTextForm)
}

function putTopTracksTextFormData (req: Request, res: Response) {
  const val = req.query.val as string
  if (req.session.user !== undefined) {
    req.session.user.topTracksIsInTextForm = val
  }

  res.sendStatus(StatusCodes.CREATED)
}
function getTopTracksTextFormData (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.topTracksIsInTextForm)
}

function putPlayerVolumeData (req: Request, res: Response) {
  const val = req.query.val as string
  if (req.session.user !== undefined) {
    req.session.user.playerVolume = val
  }

  res.sendStatus(StatusCodes.CREATED)
}

function getPlayerVolumeData (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.playerVolume)
}

function putTopTracksTerm (req: Request, res: Response) {
  const term = req.query.term as string
  if (req.session.user !== undefined) {
    req.session.user.topTracksTerm = term
  }

  res.sendStatus(StatusCodes.CREATED)
}

function getTopTracksTerm (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.topTracksTerm)
}

function putTopArtistsTerm (req: Request, res: Response) {
  const term = req.query.term as string
  if (req.session.user !== undefined) {
    req.session.user.topArtistsTerm = term
  }

  res.sendStatus(StatusCodes.CREATED)
}

function getTopArtistsTerm (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.topArtistsTerm)
}

function putCurrPlaylistId (req: Request, res: Response) {
  const id = req.query.id as string

  if (req.session.user !== undefined) {
    req.session.user.currPlaylistId = id
  }

  res.sendStatus(StatusCodes.CREATED)
}

function getCurrPlaylistId (req: Request, res: Response) {
  res.status(StatusCodes.OK).send(req.session.user?.currPlaylistId)
}

function getUsername (req: Request, res: Response) {
  if (req.session.user !== undefined) {
    if (req.session.user.username === '') {
      res.sendStatus(StatusCodes.NO_CONTENT)
    } else {
      res.status(StatusCodes.OK).send(req.session.user.username)
    }
  } else {
    res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}

const userCtrl = {
  putPlaylistResizeData,
  getPlaylistResizeData,
  putPlaylistTextFormData,
  getPlaylistTextFormData,
  putTopTracksTextFormData,
  getTopTracksTextFormData,
  putPlayerVolumeData,
  getPlayerVolumeData,
  putTopTracksTerm,
  getTopTracksTerm,
  putTopArtistsTerm,
  getTopArtistsTerm,
  putCurrPlaylistId,
  getCurrPlaylistId,
  getUsername
}

export { userCtrl }
