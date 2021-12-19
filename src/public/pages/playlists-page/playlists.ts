import Playlist from '../../components/playlist'
import AsyncSelectionVerif from '../../components/asyncSelectionVerif'
import {
  config,
  htmlToEl,
  promiseHandler,
  searchUl,
  animationControl
} from '../../config'
import {
  checkIfHasTokens,
  onSuccessfulTokenCall
} from '../../manage-tokens'
import CardActionsHandler from '../../components/card-actions'
import DoublyLinkedList, { arrayToDoublyLinkedList } from '../../components/doubly-linked-list'
import interact from 'interactjs'
import axios, { AxiosResponse } from 'axios'
import { PlaylistData } from '../../../types'
import Track from '../../components/track'

const expandedPlaylistMods = document.getElementById(
  config.CSS.IDs.expandedPlaylistMods
)
const playlistHeaderArea = document.getElementById(
  config.CSS.IDs.playlistHeaderArea
)
// add on change event listener to the order selection element of the mods expanded playlist
const playlistOrder = expandedPlaylistMods?.getElementsByClassName(
  config.CSS.CLASSES.playlistOrder
)[0] as HTMLInputElement

const trackUl = expandedPlaylistMods?.getElementsByTagName('ul')[0]
const playlistSearchInput = expandedPlaylistMods?.getElementsByClassName(
  config.CSS.CLASSES.playlistSearch
)[0] as HTMLInputElement
const playlistsCardContainer = document.getElementById(
  config.CSS.IDs.playlistCardsContainer
)
const cardResizeContainer = document
  .getElementById(config.CSS.IDs.playlistsSection)
  ?.getElementsByClassName(config.CSS.CLASSES.resizeContainer)[0] as HTMLElement

// min viewport before playlist cards convert to text form automatically (equivalent to the media query in playlists.less that changes .card)
const VIEWPORT_MIN = 600

// will resize the playlist card container to the size wanted when screen is <= VIEWPORT_MIN
const restrictResizeWidth = () =>
  (cardResizeContainer.style.width = VIEWPORT_MIN / 2.5 + 'px')

const resizeActions = (function () {
  // id of resize container used to set interaction through interactjs
  const resizeId =
    '#' +
    config.CSS.IDs.playlistsSection +
    '>.' +
    config.CSS.CLASSES.resizeContainer

  function enableResize () {
    interact(resizeId)
      .resizable({
        // only resize from the right
        edges: { top: false, left: false, bottom: false, right: true },
        listeners: {
          move: function (event) {
            Object.assign(event.target.style, {
              width: `${event.rect.width}px`
            })
          }
        }
      })
      .on('resizeend', saveLoad.saveResizeWidth)

    // once we renable the resize we must set its width to be what the user last set it too.
    initialLoads.loadResizeWidth()
  }
  function disableResize () {
    interact(resizeId).unset()
    // once we disable the resize we must restrict the width to fit within VIEWPORT_MIN pixels.
    restrictResizeWidth()
  }

  return {
    enableResize,
    disableResize
  }
})()
// order of items should never change as all other orderings are based off this one, and the only way to return back to this custom order is to retain it.
// only access this when tracks have loaded.
const selPlaylistTracks = () => {
  if (playlistActions.playlistSelVerif.currSelectedValNoNull === null || playlistActions.playlistSelVerif.currSelectedValNoNull.trackList === undefined) {
    throw new Error('Attempted to access selection verif doubly linked tracks list before it was loaded')
  }
  return playlistActions.playlistSelVerif.currSelectedValNoNull.trackList
}

const playlistActions = (function () {
  const playlistSelVerif = new AsyncSelectionVerif<Playlist>()
  const cardActionsHandler = new CardActionsHandler(1)
  const playlistTitleh2 = expandedPlaylistMods?.getElementsByTagName('h2')[0]

  /** Asynchronously load a playlists tracks and replace the track ul html once it loads
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   * @param {Function} callback - callback function to run when loading was succesful
   */
  function loadPlaylistTracks (playlistObj: Playlist, callback: Function) {
    playlistObj
      .loadTracks()
      .then(() => {
        // because .then() can run when the currently selected playlist has already changed we need to verify
        if (!playlistSelVerif.isValid(playlistObj)) {
          return
        }
        callback()
      })
      .catch((err) => {
        console.log('Error when getting tracks')
        console.error(err)
      })
  }
  function whenTracksLoading () {
    // hide header while loading tracks
    playlistHeaderArea?.classList.add(config.CSS.CLASSES.hide)
    playlistSearchInput.value = '';
    (trackUl as Element).scrollTop = 0
  }
  function onTracksLoadingDone () {
    // show them once tracks have loaded
    playlistHeaderArea?.classList.remove(config.CSS.CLASSES.hide)
  }
  /** Empty the track li and replace it with newly loaded track li.
   *
   * @param {Playlist} playlistObj - a Playlist instance whose tracks will be loaded
   */
  function showPlaylistTracks (playlistObj: Playlist) {
    if (playlistTitleh2 !== undefined && playlistTitleh2.textContent !== null) {
      playlistTitleh2.textContent = playlistObj.name
    }

    // empty the track li
    removeAllChildNodes(trackUl)

    // initially show the playlist with the loading spinner
    const htmlString = `
            <li>
              <img src="${config.PATHS.spinner}" />
            </li>`
    const spinnerEl = htmlToEl(htmlString);
    (trackUl as Element).appendChild(spinnerEl as Node)

    playlistSelVerif.selectionChanged(playlistObj)

    // tracks are already loaded so show them
    if (playlistObj.hasLoadedTracks()) {
      whenTracksLoading()
      onTracksLoadingDone()

      manageTracks.sortExpandedTracksToOrder(
        playlistObj.order === playlistOrder.value
      )
    } else {
      // tracks aren't loaded so lazy load them then show them

      whenTracksLoading()
      loadPlaylistTracks(playlistObj, () => {
        // indexed when loaded so no need to re-index them
        manageTracks.sortExpandedTracksToOrder(true)
        onTracksLoadingDone()
      })
    }
  }

  /** When a card is clicked run the standard CardActionsHandler onClick then show its tracks on callback.
   *
   * @param {Array<Playlist>} playlistObjs
   * @param {HTMLElement} playlistCard
   */
  function clickCard (playlistObjs: Array<Playlist>, playlistCard: Element) {
    cardActionsHandler.onCardClick(playlistCard, playlistObjs, (selObj: Playlist) => {
      showPlaylistTracks(selObj)
    }
    )
  }

  /** Add event listeners to each playlist card.
   *
   * @param {Array<Playlist>} playlistObjs - playlists that will be used for the events.
   */
  function addOnPlaylistCardListeners (playlistObjs: Array<Playlist>) {
    const playlistCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.playlist)
    )

    playlistCards.forEach((playlistCard) => {
      playlistCard.addEventListener('click', () => {
        clickCard(playlistObjs, playlistCard)
      })

      playlistCard.addEventListener('mouseenter', () => {
        cardActionsHandler.scrollTextOnCardEnter(playlistCard)
      })
      playlistCard.addEventListener('mouseleave', () => {
        cardActionsHandler.scrollTextOnCardLeave(playlistCard)
      })
    })
  }

  return {
    clickCard,
    addOnPlaylistCardListeners,
    showPlaylistTracks,
    playlistSelVerif
  }
})()

const infoRetrieval = (function () {
  const playlistObjs: Array<Playlist> = []

  /** Obtains playlist info from web api and displays their cards.
   *
   */
  async function getInitialInfo () {
    function onSuccesful (res: AxiosResponse<Array<PlaylistData>>) {
      // remove the info loading spinners as info has been loaded
      const infoSpinners = Array.from(
        document.getElementsByClassName(config.CSS.CLASSES.infoLoadingSpinners)
      )
      infoSpinners.forEach((spinner) => {
        spinner?.parentNode?.removeChild(spinner)
      })

      const playlistDatas = res.data

      // generate Playlist instances from the data
      playlistDatas.forEach((data) => {
        // deleted playlists will have no name, but will still show the songs (spotify api thing), so just don't show them
        if (data.name === '') {
          return
        }
        playlistObjs.push(new Playlist(data.name, data.images, data.id))
      })

      displayCardInfo.displayPlaylistCards(playlistObjs)
    }

    // get playlists data and execute call back on succesful
    await promiseHandler<AxiosResponse<Array<PlaylistData>>>(
      axios.get(config.URLs.getPlaylists),
      onSuccesful
    )
  }
  return {
    getInitialInfo,
    playlistObjs
  }
})()

const displayCardInfo = (function () {
  function determineResizeActiveness () {
    // allow resizing only when viewport is large enough to allow cards.
    if (window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches) {
      resizeActions.disableResize()
    } else {
      resizeActions.enableResize()
    }
  }
  /** Displays the playlist cards from a given array of playlists.
   *
   * @param {Array<Playlist>} playlistObjs
   */
  function displayPlaylistCards (playlistObjs: Array<Playlist>) {
    removeAllChildNodes(playlistsCardContainer)
    const isInTextForm =
      playlistsCardContainer?.classList.contains(config.CSS.CLASSES.textForm) ||
      window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches

    determineResizeActiveness()
    const selectedCard = playlistActions.playlistSelVerif.currSelectedVal

    // add card htmls to container element
    playlistObjs.forEach((playlistObj, idx) => {
      playlistsCardContainer?.appendChild(
        playlistObj.getPlaylistCardHtml(idx, isInTextForm)
      )

      // if before the form change this playlist was selected, simulate a click on it in order to select it in the new form
      if (playlistObj === selectedCard) {
        playlistActions.clickCard(
          playlistObjs,
          document.getElementById(selectedCard.cardId) as Element
        )
      }
    })

    // if there is a selected card scroll down to it.
    if (selectedCard) {
      document.getElementById(selectedCard.cardId)?.scrollIntoView()
    }

    // add event listener to cards
    playlistActions.addOnPlaylistCardListeners(playlistObjs)
    // animate the cards(show the cards)
    animationControl.animateAttributes('.playlist', config.CSS.CLASSES.appear, 0)
  }

  return {
    displayPlaylistCards
  }
})()

function removeAllChildNodes (parent: Node | null | undefined) {
  if (!parent) {
    throw new Error('parent is undefined and has no child nodes to remove')
  }
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild)
  }
}

const manageTracks = (function () {
  /** Sorts the tracks order depending on what the user sets it too and re-indexes the tracks order if order has changed.
   *
   * @param isSameOrder - whether the order is the same or not as before.
   */
  function sortExpandedTracksToOrder (isSameOrder: boolean) {
    let newOrderTracks: DoublyLinkedList<Track> = new DoublyLinkedList<Track>()
    let newOrderTracksArr: Array<Track> = []
    if (playlistOrder.value === 'custom-order') {
      newOrderTracks = selPlaylistTracks()
    } else if (playlistOrder.value === 'name') {
      newOrderTracksArr = orderTracksByName(selPlaylistTracks())
      newOrderTracks = arrayToDoublyLinkedList(newOrderTracksArr)
    } else if (playlistOrder.value === 'date-added') {
      newOrderTracksArr = orderTracksByDateAdded(selPlaylistTracks())
      newOrderTracks = arrayToDoublyLinkedList(newOrderTracksArr)
    }

    if (!isSameOrder) {
      // set the order of the playlist as the new order
      playlistActions.playlistSelVerif.currSelectedValNoNull.order =
        playlistOrder.value
    }
    rerenderPlaylistTracks(newOrderTracks, trackUl as HTMLUListElement)
  }

  function orderTracksByName (trackList: DoublyLinkedList<Track>): Array<Track> {
    // shallow copy just so we dont modify the original order
    const tracksCopy = [...trackList]
    tracksCopy.sort(function (a, b) {
      // -1 precedes, 1 suceeds, 0 is equal
      return a.title.toUpperCase() === b.title.toUpperCase()
        ? 0
        : a.title.toUpperCase() < b.title.toUpperCase()
          ? -1
          : 1
    })
    return tracksCopy
  }
  function orderTracksByDateAdded (trackList: DoublyLinkedList<Track>) {
    // shallow copy just so we dont modify the original order
    const tracksCopy = [...trackList]
    tracksCopy.sort(function (a, b) {
      // -1 'a' precedes 'b', 1 'a' suceeds 'b', 0 is 'a' equal 'b'
      return a.dateAddedToPlaylist === b.dateAddedToPlaylist
        ? 0
        : a.dateAddedToPlaylist < b.dateAddedToPlaylist
          ? -1
          : 1
    })
    return tracksCopy
  }

  function rerenderPlaylistTracks (trackList: DoublyLinkedList<Track>, trackArrUl: HTMLUListElement) {
    removeAllChildNodes(trackArrUl)
    for (const track of trackList.values()) {
      trackArrUl.appendChild(track.getPlaylistTrackHtml(trackList, true))
    }
  }

  return {
    sortExpandedTracksToOrder,
    orderTracksByDateAdded
  }
})()

const addEventListeners = (function () {
  function addExpandedPlaylistModsSearchbarEvent () {
    // add key up event to the mods expanded playlist's search bar element
    expandedPlaylistMods
      ?.getElementsByClassName(config.CSS.CLASSES.playlistSearch)[0]
      ?.addEventListener('keyup', () => {
        searchUl(trackUl as HTMLUListElement, playlistSearchInput)
      })
  }
  function addExpandedPlaylistModsOrderEvent () {
    // add on change event listener to the order selection element of the mods expanded playlist
    playlistOrder.addEventListener('change', () => {
      manageTracks.sortExpandedTracksToOrder(false)
    })
  }
  function addConvertCards () {
    const convertBtn = document.getElementById(config.CSS.IDs.convertCard)
    const convertImg = convertBtn?.getElementsByTagName('img')[0]

    function onClick () {
      if (convertImg === undefined) {
        throw new Error('convert cards to text form buttons image is not found')
      }
      playlistsCardContainer?.classList.toggle(config.CSS.CLASSES.textForm)
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs)
      if (
        playlistsCardContainer?.classList.contains(config.CSS.CLASSES.textForm)
      ) {
        saveLoad.savePlaylistForm(true)
        convertImg.src = config.PATHS.gridView
      } else {
        saveLoad.savePlaylistForm(false)
        convertImg.src = config.PATHS.listView
      }
    }

    convertBtn?.addEventListener('click', () => onClick())
  }
  /**
   * Add event listener onto
   */
  function addHideShowPlaylistTxt () {
    const toggleBtn = document.getElementById(config.CSS.IDs.hideShowPlaylistTxt)
    function onClick () {
      toggleBtn?.classList.toggle(config.CSS.CLASSES.selected)
      // if its selected we hide the cards otherwise we show them. This occurs when screen width is a certain size and a menu sliding from the left appears
      if (toggleBtn?.classList.contains(config.CSS.CLASSES.selected)) {
        cardResizeContainer.style.width = '0'
      } else {
        restrictResizeWidth()
      }
      updateHideShowPlaylistTxtIcon()
    }
    toggleBtn?.addEventListener('click', () => onClick())
  }
  return {
    addExpandedPlaylistModsSearchbarEvent,
    addExpandedPlaylistModsOrderEvent,
    addConvertCards,
    addHideShowPlaylistTxt
  }
})()

const saveLoad = (function () {
  function saveResizeWidth () {
    promiseHandler(
      axios.put(
        config.URLs.putPlaylistResizeData(cardResizeContainer.getBoundingClientRect().width.toString()))
    )
  }
  function savePlaylistForm (isInTextForm: boolean) {
    promiseHandler(
      axios.put(
        config.URLs.putPlaylistIsInTextFormData(String(isInTextForm))
      )
    )
  }

  return {
    saveResizeWidth,
    savePlaylistForm
  }
})()

/**
 * update the icon to show a chevron left or chevron right depending on whether the playlist text is shown or not.
 */
function updateHideShowPlaylistTxtIcon () {
  const toggleBtn = document.getElementById(config.CSS.IDs.hideShowPlaylistTxt)
  const btnIcon = toggleBtn?.getElementsByTagName('img')[0]

  if (btnIcon === undefined) {
    throw new Error('img to show and hide the text form cards is not found')
  }
  // if its selected we hide the cards otherwise we show them.
  if (toggleBtn?.classList.contains(config.CSS.CLASSES.selected)) {
    btnIcon.src = config.PATHS.chevronRight
  } else {
    btnIcon.src = config.PATHS.chevronLeft
  }
}

function checkIfCardFormChangeOnResize () {
  const prev = {
    vwIsSmall: window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches
  }
  window.addEventListener('resize', function () {
    const wasBigNowSmall =
      window.matchMedia(`(max-width: ${VIEWPORT_MIN}px)`).matches &&
      !prev.vwIsSmall

    const wasSmallNowBig =
      prev.vwIsSmall &&
      window.matchMedia(`(min-width: ${VIEWPORT_MIN}px)`).matches

    if (wasBigNowSmall || wasSmallNowBig) {
      if (wasSmallNowBig) {
        const toggleBtn = document.getElementById(config.CSS.IDs.hideShowPlaylistTxt)
        toggleBtn?.classList.remove(config.CSS.CLASSES.selected)
        updateHideShowPlaylistTxtIcon()
      }
      // card form has changed on window resize
      displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs)
      prev.vwIsSmall = window.matchMedia(
        `(max-width: ${VIEWPORT_MIN}px)`
      ).matches
    }
  })
}

const initialLoads = (function () {
  function loadPlaylistForm () {
    promiseHandler(
      axios
        .get(config.URLs.getPlaylistIsInTextFormData)
        .then((res) => {
          if (res.data === true) {
            const convertBtn = document.getElementById(
              config.CSS.IDs.convertCard
            )
            const convertImg = convertBtn?.getElementsByTagName('img')[0]
            if (convertImg === undefined) {
              throw new Error('convert cards to text form buttons image is not found')
            }
            playlistsCardContainer?.classList.add(config.CSS.CLASSES.textForm)
            displayCardInfo.displayPlaylistCards(infoRetrieval.playlistObjs)
            convertImg.src = config.PATHS.gridView
          }
          // else it is in card form which is the default.
        })
    )
  }
  function loadResizeWidth () {
    promiseHandler(
      axios
        .get(config.URLs.getPlaylistResizeData)
        .then((res) => {
          cardResizeContainer.style.width = res.data + 'px'
        })
    )
  }
  return {
    loadPlaylistForm,
    loadResizeWidth
  }
})();

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) => {
    onSuccessfulTokenCall(hasToken, () => {
      // get information and onSuccess animate the elements
      promiseHandler(
        infoRetrieval.getInitialInfo(),
        () =>
          animationControl.animateAttributes(
            '.playlist,#expanded-playlist-mods',
            config.CSS.CLASSES.appear,
            25
          ),
        () => console.log('Problem when getting information')
      )
    })
  })

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener()
  })
  checkIfCardFormChangeOnResize()
  Object.entries(initialLoads).forEach(([, loader]) => {
    loader()
  })
})()
