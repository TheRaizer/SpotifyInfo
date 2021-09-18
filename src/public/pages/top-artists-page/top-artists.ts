import Artist, { generateArtistsFromData } from '../../components/artist'
import {
  config,
  promiseHandler,
  htmlToEl,
  removeAllChildNodes,
  animationControl,
  throwExpression
} from '../../config'
import SelectableTabEls from '../../components/SelectableTabEls'
import {
  checkIfHasTokens,
  onSuccessfulTokenCall
} from '../../manage-tokens'
import AsyncSelectionVerif from '../../components/asyncSelectionVerif'
import axios from 'axios'

const MAX_VIEWABLE_CARDS = 5

const artistActions = (function () {
  const selections = {
    numViewableCards: MAX_VIEWABLE_CARDS,
    term: 'short_term'
  }
  function loadArtistTopTracks (artistObj: Artist, callback: Function) {
    artistObj
      .loadTopTracks()
      .then(() => {
        callback()
      })
      .catch((err: unknown) => {
        console.log('Error when loading artists')
        console.error(err)
      })
  }
  function showTopTracks (artistObj: Artist) {
    loadArtistTopTracks(artistObj, () => {
      const trackList = getTopTracksUlFromArtist(artistObj)
      let rank = 1
      if (artistObj.topTracks === undefined) {
        throwExpression('artist does not have top tracks loaded on request to show them')
      }
      for (const track of artistObj.topTracks.values()) {
        trackList.appendChild(track.getRankedTrackHtml(artistObj.topTracks, rank))
        rank++
      }
    })
  }

  function getTopTracksUlFromArtist (artistObj: Artist) {
    const artistCard = document.getElementById(artistObj.cardId) ?? throwExpression('artist card does not exist')
    const trackList = artistCard.getElementsByClassName(config.CSS.CLASSES.trackList)[0]

    if (trackList === null) {
      throwExpression(`track ul on artist element with id ${artistObj.cardId} does not exist`)
    }
    return trackList
  }

  async function retrieveArtists (artistArr: Array<Artist>) {
    const { res, err } = await promiseHandler(
      axios.get(config.URLs.getTopArtists + selections.term)
    )
    if (err) {
      return
    }
    // we know res is not null because it is only null if an error exists in which we have already returned
    generateArtistsFromData(res!.data, artistArr)
  }
  function getCurrSelTopArtists () {
    if (selections.term === 'short_term') {
      return artistArrs.topArtistObjsShortTerm
    } else if (selections.term === 'medium_term') {
      return artistArrs.topArtistObjsMidTerm
    } else if (selections.term === 'long_term') {
      return artistArrs.topArtistObjsLongTerm
    } else {
      throw new Error('Selected track term is invalid ' + selections.term)
    }
  }
  return {
    showTopTracks,
    retrieveArtists,
    selections,
    getCurrSelTopArtists
  }
})()

const artistCardsHandler = (function () {
  const selectionVerif = new AsyncSelectionVerif<Array<Artist>>()
  const artistContainer = document.getElementById(
    config.CSS.IDs.artistCardsContainer
  ) ?? throwExpression(`artist container of id ${config.CSS.IDs.artistCardsContainer} does not exist`)

  /**
   * Generates the cards to the DOM then makes them visible
   * @param {Array<Artist>} artistArr array of track objects whose cards should be generated.
   * @param {Boolean} autoAppear whether to show the card without animation or with animation.
   * @returns {Array<HTMLElement>} array of the card elements.
   */
  function generateCards (artistArr: Array<Artist>, autoAppear: Boolean) {
    removeAllChildNodes(artistContainer)
    // fill arr of card elements and append them to DOM
    for (let i = 0; i < artistArr.length; i++) {
      if (i < artistActions.selections.numViewableCards) {
        const artistObj = artistArr[i]
        const cardHtml = artistObj.getArtistHtml(i)

        artistContainer.appendChild(cardHtml)

        artistActions.showTopTracks(artistObj)
      } else {
        break
      }
    }
    if (!autoAppear) {
      animationControl.animateAttributes(
        '.' + config.CSS.CLASSES.artist,
        config.CSS.CLASSES.appear,
        25
      )
    }
  }

  /**
   * Begins retrieving artists then when done verifies it is the correct selected artist.
   * @param {Array<Artist>} artistArr array to load artists into.
   */
  function startLoadingArtists (artistArr: Array<Artist>) {
    // initially show the loading spinner
    const htmlString = `
            <div>
              <img src="${config.PATHS.spinner}" alt="Loading..." />
            </div>`
    const spinnerEl = htmlToEl(htmlString)

    removeAllChildNodes(artistContainer)
    artistContainer.appendChild(spinnerEl as Node)

    artistActions.retrieveArtists(artistArr).then(() => {
      // after retrieving async verify if it is the same arr of Artist's as what was selected
      if (!selectionVerif.isValid(artistArr)) {
        return
      }
      return generateCards(artistArr, false)
    })
  }

  /** Load artist objects if not loaded, then generate cards with the objects.
   *
   * @param {Array<Artist>} artistArr - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   * @param {Boolean} autoAppear whether to show the cards without animation.
   * @returns {Array<HTMLElement>} list of Card HTMLElement's.
   */
  function displayArtistCards (artistArr: Array<Artist>, autoAppear = false) {
    selectionVerif.selectionChanged(artistArr)
    if (artistArr.length > 0) {
      generateCards(artistArr, autoAppear)
    } else {
      startLoadingArtists(artistArr)
    }
  }

  return {
    displayArtistCards
  }
})()

const artistArrs = (function () {
  const topArtistObjsShortTerm: Array<Artist> = []
  const topArtistObjsMidTerm: Array<Artist> = []
  const topArtistObjsLongTerm: Array<Artist> = []

  return {
    topArtistObjsShortTerm,
    topArtistObjsMidTerm,
    topArtistObjsLongTerm
  }
})()

const addEventListeners = (function () {
  const artistTermSelections = document
    .getElementById(config.CSS.IDs.artistTermSelections) ?? throwExpression(`term selection of id ${config.CSS.IDs.artistTermSelections} does not exist`)
  const selections = {
    termTabManager: new SelectableTabEls(
      artistTermSelections.getElementsByTagName('button')[0], // first tab is selected first by default
      artistTermSelections.getElementsByClassName(config.CSS.CLASSES.borderCover)[0] // first tab is selected first by default
    )
  }

  function addArtistTermButtonEvents () {
    function onClick (btn: Element, borderCover: Element) {
      const attr = btn.getAttribute(
        config.CSS.ATTRIBUTES.dataSelection
      )
      if (attr === null) {
        throwExpression(`attribute ${config.CSS.ATTRIBUTES.dataSelection} does not exist on term button`)
      }
      artistActions.selections.term = attr
      selections.termTabManager.selectNewTab(btn, borderCover)

      const currArtists = artistActions.getCurrSelTopArtists()
      artistCardsHandler.displayArtistCards(currArtists)
    }

    const artistTermBtns = artistTermSelections.getElementsByTagName('button')
    const trackTermBorderCovers = artistTermSelections.getElementsByClassName(config.CSS.CLASSES.borderCover)

    if (trackTermBorderCovers.length !== artistTermBtns.length) {
      console.error('Not all track term buttons contain a border cover')
      return
    }
    for (let i = 0; i < artistTermBtns.length; i++) {
      const btn = artistTermBtns[i]
      const borderCover = trackTermBorderCovers[i]
      btn.addEventListener('click', () => onClick(btn, borderCover))
    }
  }

  // function resetViewableCards () {
  //   const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks)
  //   trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS
  //   viewAllEl.textContent = 'See All 50'
  // }

  // function addViewAllTracksEvent () {
  //   const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks)
  //   function onClick () {
  //     if (trackActions.selections.numViewableCards == DEFAULT_VIEWABLE_CARDS) {
  //       trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS
  //       viewAllEl.textContent = 'See Less'
  //     } else {
  //       resetViewableCards()
  //     }
  //     const currTracks = trackActions.getCurrSelTopTracks()
  //     displayCardInfo.displayTrackCards(currTracks)
  //   }

  //   viewAllEl.addEventListener('click', () => onClick())
  // }

  return {
    addArtistTermButtonEvents
    // addViewAllTracksEvent,
  }
})();

(function () {
  promiseHandler(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken, () => {
      // when entering the page always show short term tracks first
      artistActions.selections.term = 'short_term'
      artistCardsHandler.displayArtistCards(artistArrs.topArtistObjsShortTerm)
    })
  )
  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener()
  })
})()
