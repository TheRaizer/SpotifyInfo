import { promiseHandler, config, throwExpression } from '../../config'
import Profile from '../../components/profile'
import { getPlaylistTracksFromDatas } from '../../components/playlist'
import {
  checkIfHasTokens,
  onSuccessfulTokenCall,
  generateLogin
} from '../../manage-tokens'
import Artist, { generateArtistsFromData } from '../../components/artist'
import CardActionsHandler from '../../components/card-actions'
import DoublyLinkedList from '../../components/doubly-linked-list'
import axios, { AxiosResponse } from 'axios'
import Track from '../../components/track'
import { ProfileData, TrackData } from '../../../types'

function displayProfile (profile: Profile) {
  const profileHeader = document.getElementById(config.CSS.IDs.profileHeader) ?? throwExpression('profile header element does not exist')
  const displayName = profileHeader.getElementsByTagName('h1')[0] ?? throwExpression('display name element does not exist')
  const followerCount = profileHeader.getElementsByTagName('h4')[0] ?? throwExpression('follower element does not exist')
  const profileImage = profileHeader.getElementsByTagName('img')[0] ?? throwExpression('profile image element does not exist')

  displayName.textContent = profile.displayName
  followerCount.textContent = profile.followers + ' followers'
  profileImage.src =
    profile.profileImgUrl === ''
      ? '/images/profile-user.png'
      : profile.profileImgUrl
}

async function retrieveProfile () {
  function onSuccesful (res: AxiosResponse<ProfileData>) {
    const data = res.data
    const profile = new Profile(
      data.display_name,
      data.country,
      data.email,
      data.images,
      data.followers.total,
      data.external_urls.spotify
    )

    displayProfile(profile)
  }

  // get profile data from api
  await promiseHandler<AxiosResponse<ProfileData>>(axios.request<ProfileData>({ method: 'GET', url: config.URLs.getCurrentUserProfile }),
    onSuccesful
  )
}

const addEventListeners = (function () {
  /** Adds the click event listener that clears session data and returns user back to home page.
   *
   */
  function addClearDataListener () {
    const clearDataEl = document.getElementById(config.CSS.IDs.clearData) as HTMLLinkElement
    clearDataEl.href = config.URLs.siteUrl

    function onClick () {
      axios.put(config.URLs.putClearSession)
    }

    clearDataEl.addEventListener('click', onClick)
  }
  return { addClearDataListener }
})()

const savedTracksActions = (function () {
  function getSavedTracks () {
    promiseHandler(axios.get(config.URLs.getCurrentUserSavedTracks), (res) => {
      // if we retrieved the tracks succesfully, then display them
      const trackList = new DoublyLinkedList<Track>()
      const tracksData = res.data.items.map((item: { track: TrackData }) => item.track)

      getPlaylistTracksFromDatas(tracksData, res.data.items, trackList)
      displaySavedTracks(trackList)
    })
  }
  function displaySavedTracks (trackList: DoublyLinkedList<Track>) {
    const likedTracksUl = document.getElementById(config.CSS.IDs.likedTracks) ?? throwExpression(`liked tracks ul of id ${config.CSS.IDs.likedTracks} does not exist`)
    for (const track of trackList.values()) {
      likedTracksUl.append(track.getPlaylistTrackHtml(trackList))
    }
  }
  return { getSavedTracks }
})()

const followedArtistActions = (function () {
  const cardActionsHandler = new CardActionsHandler(50)

  function getFollowedArtists () {
    promiseHandler(axios.get(config.URLs.getFollowedArtists), (res) => {
      // if we retrieved the artists succesfully, then display them
      const artistArr: Array<Artist> = []
      generateArtistsFromData(res.data.artists.items, artistArr)
      displayFollowedArtists(artistArr)
    })
  }
  function displayFollowedArtists (followedArtists: Array<Artist>) {
    const cardGrid = document.getElementById(config.CSS.IDs.followedArtists) ?? throwExpression(`Card grid of id ${config.CSS.IDs.followedArtists} does not exist`)

    // display the cards
    let i = 0
    followedArtists.forEach((artist: Artist) => {
      cardGrid.append(artist.getArtistCardHtml(i, true))
      i++
    })

    const artistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.artist)
    )

    // add event listeners to the cards
    cardActionsHandler.addAllEventListeners(
      artistCards,
      followedArtists,
      null,
      false
    )
  }

  return { getFollowedArtists }
})();

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken, () => {
      // get user profile
      promiseHandler(
        retrieveProfile(),
        () => {
          generateLogin({
            classesToAdd: ['glow'],
            parentEl: document.getElementById('account-btns') as Element
          })
        },
        () => console.log('Problem when getting information')
      )

      savedTracksActions.getSavedTracks()
      followedArtistActions.getFollowedArtists()
    })
  )

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener()
  })
})()
