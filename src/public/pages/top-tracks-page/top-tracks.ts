import Track, { generateTracksFromData } from '../../components/track'
import {
  config,
  promiseHandler,
  htmlToEl,
  capitalizeFirstLetter,
  removeAllChildNodes,
  animationControl,
  throwExpression,
  addItemsToPlaylist
} from '../../config'
import SelectableTabEls from '../../components/SelectableTabEls'
import {
  checkIfHasTokens,
  onSuccessfulTokenCall
} from '../../manage-tokens'
import AsyncSelectionVerif from '../../components/asyncSelectionVerif'
import CardActionsHandler from '../../components/card-actions'
import axios from 'axios'
import { Chart, LinearScale, CategoryScale, BarController, BarElement } from 'chart.js'
import { FeaturesData } from '../../../types'
import { determineTerm, loadTerm, saveTerm, selectStartTermTab, TERMS, TERM_TYPE } from '../../components/save-load-term'
import { arrayToDoublyLinkedList } from '../../components/doubly-linked-list'

Chart.register(LinearScale, CategoryScale, BarController, BarElement)
const DEFAULT_VIEWABLE_CARDS = 5
const MAX_VIEWABLE_CARDS = 50

const tracksTextContainer = document.getElementById(config.CSS.IDs.topTracksTextFormContainer)
const tracksCardContainer = document.getElementById(
  config.CSS.IDs.trackCardsContainer
)

const trackActions = (function () {
  const selectionVerif = new AsyncSelectionVerif<Array<Track>>()
  const cardActionsHandler = new CardActionsHandler(MAX_VIEWABLE_CARDS)
  const selections = {
    numViewableCards: DEFAULT_VIEWABLE_CARDS,
    term: TERMS.SHORT_TERM
  }
  function addTrackCardListeners (trackArr: Array<Track>) {
    const trackCards = Array.from(
      document.getElementsByClassName(config.CSS.CLASSES.track)
    )
    cardActionsHandler.addAllEventListeners(
      trackCards,
      trackArr,
      null,
      true,
      false
    )
  }

  function getCurrSelTopTracks () {
    if (selections.term === TERMS.SHORT_TERM) {
      return trackArrs.topTrackObjsShortTerm
    } else if (selections.term === TERMS.MID_TERM) {
      return trackArrs.topTrackObjsMidTerm
    } else if (selections.term === TERMS.LONG_TERM) {
      return trackArrs.topTrackObjsLongTerm
    } else {
      throw new Error('Selected track term is invalid ' + selections.term)
    }
  }

  /** Load the features of multiple tracks at once into the given arr from the
   * spotify web api and store them.
   *
   * @param {Array<Track>} trackArr - Array containing instances of Track whose features will be loaded.
   */
  async function loadFeatures (trackArr: Array<Track>) {
    const ids = trackArr.map((track) => track.id)
    const res = await axios
      .get(config.URLs.getTrackFeatures + ids)
      .catch((err) => {
        throw err
      })
    for (let i = 0; i < trackArr.length; i++) {
      const track = trackArr[i]
      const feats = res.data.audio_features[i]
      track.features = {
        danceability: feats.danceability,
        acousticness: feats.acousticness,
        instrumentalness: feats.instrumentalness,
        valence: feats.valence,
        energy: feats.energy
      }
    }
  }
  async function retrieveTracks (trackArr: Array<Track>) {
    const { res } = await promiseHandler(
      axios.get(config.URLs.getTopTracks + selections.term),
      () => {}, () => {
        throw new Error('Issue retrieving tracks')
      })
    generateTracksFromData(res?.data, trackArr)

    await promiseHandler(loadFeatures(trackArr), () => {}, () => {
      throw new Error('Issue retrieving tracks')
    })
  }
  return {
    addTrackCardListeners,
    getCurrSelTopTracks,
    retrieveTracks,
    selections,
    selectionVerif
  }
})()

const trackArrs = (function () {
  const topTrackObjsShortTerm: Array<Track> = []
  const topTrackObjsMidTerm: Array<Track> = []
  const topTrackObjsLongTerm: Array<Track> = []

  return {
    topTrackObjsShortTerm,
    topTrackObjsMidTerm,
    topTrackObjsLongTerm
  }
})()

const displayCardInfo = (function () {
  /**
   * Generates the cards to the DOM then makes them visible
   *
   * @param {Array<Track>} trackArr array of track objects whose cards should be generated.
   * @returns {Array<HTMLElement>} array of the card elements.
   */
  function generateAsCards (trackArr: Array<Track>) {
    removeAllChildNodes(tracksCardContainer as Node)
    const cardHtmls = []

    // array is used to update chart with the shown cards
    const tracksDisplayed = []

    for (let i = 0; i < trackArr.length; i++) {
      const trackObj = trackArr[i]
      const cardHtml = trackObj.getTrackCardHtml(i)
      cardHtmls.push(cardHtml)
      tracksCardContainer?.appendChild(cardHtml)
      if (i < trackActions.selections.numViewableCards) {
        tracksDisplayed.push(trackObj)
      } else {
        // make the card html invisible
        (cardHtml as HTMLElement).classList.add(config.CSS.CLASSES.displayNone)
      }
    }

    trackActions.addTrackCardListeners(trackArr)
    featureManager.changeTracksChart(tracksDisplayed)

    // set appear class on all cards, even though some are not going to be visible
    animationControl.animateAttributes(
      '.' + config.CSS.CLASSES.rankCard,
      config.CSS.CLASSES.appear,
      5
    )
  }
  /**
   * Generates the tracks as ranked tracks in a playlist to the DOM then makes them visible
   *
   * @param {Array<Track>} trackArr array of track objects whose cards should be generated.
   * @returns {Array<HTMLElement>} array of the card elements.
   */
  function generateAsRankedTracksHTML (trackArr: Array<Track>) {
    removeAllChildNodes(tracksTextContainer as Node)
    const rankedTrackHtmls = []

    // array is used to update chart with the shown cards
    const tracksDisplayed = []

    const trackLinkedList = arrayToDoublyLinkedList(trackArr)

    for (let i = 0; i < trackArr.length; i++) {
      const trackObj = trackArr[i]

      const rankedTrackHTML = trackObj.getRankedTrackHtml(trackLinkedList, i + 1)
      rankedTrackHtmls.push(rankedTrackHTML)
      tracksTextContainer?.appendChild(rankedTrackHTML)
      tracksDisplayed.push(trackObj)
    }

    featureManager.changeTracksChart(tracksDisplayed)

    // set appear class on all cards, even though some are not going to be visible
    animationControl.animateAttributes(
      '.' + config.CSS.CLASSES.rankCard,
      config.CSS.CLASSES.appear,
      5
    )
  }

  /**
   * Depending on the given card form, this function will generate the respective track html and append it to the DOM.
   * @param trackArr the array of tracks whose html should be appended
   * @param inTextForm whether the tracks are in card form or text form
   */
  function generateTrackHTML (trackArr: Array<Track>, inTextForm: boolean) {
    if (inTextForm) {
      generateAsRankedTracksHTML(trackArr)
    } else {
      generateAsCards(trackArr)
    }
  }

  /** Begins retrieving tracks then verifies it is the correct selected tracks.
   *
   * @param {Array<Track>} trackArr array to load tracks into.
   */
  function startLoadingTracks (trackArr: Array<Track>, inTextForm: boolean) {
    // initially show the loading spinner
    const htmlString = `
            <div>
              <img src="${config.PATHS.spinner}" alt="Loading..." />
            </div>`
    const spinnerEl = htmlToEl(htmlString)

    // append spinner to either text form container or card container as to have them properly removed when their respective function run
    if (inTextForm) {
      removeAllChildNodes(tracksTextContainer as Node)
      tracksTextContainer?.appendChild(spinnerEl as Node)
    } else {
      removeAllChildNodes(tracksCardContainer as Node)
      tracksCardContainer?.appendChild(spinnerEl as Node)
    }

    trackActions.retrieveTracks(trackArr).then(() => {
      // after retrieving async verify if it is the same arr of trackObjs as what was selected
      if (!trackActions.selectionVerif.isValid(trackArr)) {
        return
      }
      generateTrackHTML(trackArr, inTextForm)
    }).catch((err) => {
      throw new Error(err)
    })
  }

  /** Load track objects if not loaded, then generate track html with the objects using the savedLoad.savedOptions.isInTextForm to determine what form they will take.
   *
   * @param {Array<Track>} trackArr - List of track objects whose cards should be generated or
   * empty list that should be filled when loading tracks.
   */
  function displayTracks (trackArr: Array<Track>) {
    trackActions.selectionVerif.selectionChanged(trackArr)
    if (trackArr.length > 0) {
      generateTrackHTML(trackArr, saveLoad.savedOptions.inTextForm)
    } else {
      startLoadingTracks(trackArr, saveLoad.savedOptions.inTextForm)
    }
  }

  /**
   * Removes a css class off a given number of cards in order to make the visible.
   * @param numToDisplay the number of cards to display
   * @param trackArr the array of tracks that are currently displayed
   */
  function removeDisplayNoneClass (numToDisplay: number, trackArr: Array<Track>) {
    const cards = tracksCardContainer?.childNodes
    if (!cards || trackArr.length !== cards.length) {
      throw new Error('track array length and cards length do not match')
    } else if (!cards) {
      throw new Error('there are no valid card elements to display.')
    }

    const tracksDisplayed = []

    // by removing displayNone, we are displaying the number of cards wanted to be visible
    for (let i = 0; i < numToDisplay; i++) {
      tracksDisplayed.push(trackArr[i]);
      (cards[i] as HTMLElement).classList.remove(config.CSS.CLASSES.displayNone);

      // remove appear class if it exists as it will be added on through animation
      (cards[i] as HTMLElement).classList.remove(config.CSS.CLASSES.appear)
    }

    featureManager.changeTracksChart(tracksDisplayed)
    // animate the cards into view
    animationControl.animateAttributes(
      '.' + config.CSS.CLASSES.rankCard,
      config.CSS.CLASSES.appear,
      5
    )
  }

  /**
   * Adds a css class to cards starting from the last in order to hide them.
   * @param numToDisplay the number of cards to display
   * @param trackArr the array of tracks that are currently displayed
   */
  function setDisplayNoneClass (numToDisplay: number, trackArr: Array<Track>) {
    const cards = tracksCardContainer?.childNodes
    if (!cards) {
      return
    }

    const tracksDisplayed = []

    // from the last cards to the index of the card you want to keep visible, hide them.
    for (let i = cards.length - 1; i >= numToDisplay; i--) {
      (cards[i] as HTMLElement).classList.add(config.CSS.CLASSES.displayNone)
    }

    // add only the tracks that will end up shown
    for (let i = 0; i < numToDisplay; i++) {
      tracksDisplayed.push(trackArr[i])
    }

    featureManager.changeTracksChart(tracksDisplayed)
  }

  return {
    displayTracks,
    removeDisplayNoneClass,
    setDisplayNoneClass,
    generateAsRankedTracksHTML
  }
})()

/** Manages a feature's information for all tracks in a term. */
class Feature {
  featKey: string;
  data: Array<number> // contains the feature values of all tracks in a term
  EMA: number;
  mean: number;
  std: number;
  definition: string;
  constructor (featKey: string, definition: string) {
    this.featKey = featKey
    this.data = []
    this.EMA = 0
    this.mean = 0
    this.std = 0
    this.definition = definition
  }

  setData (data: Array<number>) {
    this.data = data
    this.calculateAverageAndStd()
  }

  /** Calculate the arithemtic average of the data for this feature. */
  calculateAverageAndStd () {
    this.calculateAverage()
    this.calculateStd()
  }

  calculateAverage () {
    let mean = 0

    this.data.forEach((val) => {
      mean += val
    })
    mean /= this.data.length

    this.mean = Math.round(mean)
  }

  calculateStd () {
    let sum = 0

    this.data.forEach((val) => {
      const distance = Math.abs(val - this.mean) ** 2
      sum += distance
    })
    sum /= this.data.length

    this.std = Math.sqrt(sum)
  }
}

const featureManager = (function () {
/** The feature keys that are used in the 'feature' objectsobjects outputted by the spotify web api. */
enum FEATURE_KEYS {
  POPULARITY = 'popularity',
  VALENCE = 'valence',
  DANCEABILITY = 'danceability',
  INSTRUMENTALNESS = 'instrumentalness',
  ENERGY = 'energy',
  ACOUSTICNESS = 'acousticness'
}
const tracksChartEl = document.getElementById(config.CSS.IDs.tracksChart)
const FEAT_HIGH = 60
const FEAT_LOW = 40
const charts = {
  tracksChart: null
}
  type TrackFeatsType = {
    [key: string]: Feature
  }

  const TRACK_FEATS: TrackFeatsType = {
    popularity: new Feature(
      FEATURE_KEYS.POPULARITY,
      'Popularity is the value of how often this song has been listened too by everyone on spotify.'
    ),
    valence: new Feature(
      FEATURE_KEYS.VALENCE,
      'Higher valence sound more positive (e.g. happy, cheerful, euphoric). Lower valence sound more negative (e.g. sad, depressed, angry).'
    ),
    danceability: new Feature(
      FEATURE_KEYS.DANCEABILITY,
      `Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo,
        rhythm stability, beat strength, and overall regularity.`
    ),
    instrumentalness: new Feature(
      FEATURE_KEYS.INSTRUMENTALNESS,
      'Instrumentalness represents the amount of vocals in the song. The closer it is to 100, the less vocals there are in the song.'
    ),
    energy: new Feature(
      FEATURE_KEYS.ENERGY,
      'Energy represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy.'
    ),
    acousticness: new Feature(
      FEATURE_KEYS.ACOUSTICNESS,
      'Acousticness describes how acoustic a song is. Which is measured by the amount of the song that does not contain electrical amplification.'
    )
  }
  const selections = {
    feature: TRACK_FEATS.popularity
  }

  /** Updates the chart if it exists or generates it.
   *
   * @param trackObjs - track objects that the chart data depends on
   */
  function changeTracksChart (trackObjs: Array<Track>) {
    const titles = updateFeatData(trackObjs)
    if (charts.tracksChart == null) {
      generateTracksChart(titles)
    } else {
      updateTracksChart(titles)
    }
  }
  function updatePopularity (trackObjs: Array<Track>) {
    TRACK_FEATS.popularity.setData(trackObjs.map((track) => parseInt(track.popularity)))
  }

  /** Recalculate/Update the attributes for each feature.
   *
   * @param {Array<FeaturesData>} featsDataArr - contains the objects that hold features for each Track instance
   */
  function updateFeaturesAttrs (featsDataArr: Array<FeaturesData>) {
    const keys = Object.keys(TRACK_FEATS)
    keys.forEach((key) => {
      // avoid the popularity key as that is not contained in a tracks features
      if (key !== FEATURE_KEYS.POPULARITY) {
        const feat: Feature = TRACK_FEATS[key]
        feat.setData(
          featsDataArr.map((features) => {
            return Math.round(parseFloat(features[feat.featKey]) * 100)
          })
        )
      }
    })
  }

  /** Creates the chart.js chart with the initial trackObjects given.
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used in the chart.
   */
  function generateTracksChart (titles: Array<string>) {
    updateTracksChartInfo()

    // remove loading spinner for chart
    charts.tracksChart = new Chart(tracksChartEl, {
      type: 'bar',
      data: {
        labels: titles,
        datasets: [
          {
            label: capitalizeFirstLetter(selections.feature.featKey),
            data: selections.feature.data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Top Tracks Comparison'
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 100,
            grid: {
              color: '#4b4b4ba9'
            }
          },
          x: {
            ticks: {
              callback: function (val) {
                const labelSubStr = this.getLabelForValue(val).substr(0, 20)

                if (labelSubStr.length === this.getLabelForValue(val).length) {
                  return labelSubStr
                } else {
                  return labelSubStr + '...'
                }
              }
            },
            grid: {
              color: '#4b4b4ba9'
            }
          }
        }
      }
    })
  }

  /** Update the feature data using the given tracks. NOTE THIS RUNS MANY TIMES BECAUSE FEATURES AREN'T STORED FOR EVERY TERM: TODO: OPTIMIZE THIS
   *
   * @param {Array<Track>} trackObjs tracks whose features will be used to update the data.
   * @returns {Array<String>} array holding the name of each track.
   */
  function updateFeatData (trackObjs: Array<Track>): Array<string> {
    // update popularity Feature class in TRACK_FEATS
    updatePopularity(trackObjs)
    const featsDataArr = trackObjs.map((track) => track.features)

    // update other Feature class's in TRACK_FEATS
    updateFeaturesAttrs(featsDataArr as Array<FeaturesData>)
    generateEmojis()

    const titles = trackObjs.map((track) => track.title)
    return titles
  }

  /** Update the chart.js chart, feature attributes, and chart info
   *  with the given track object's feature data.
   *
   * @param {Array<Track>} trackObjs array of Track's whose feature data will update the chart.
   */
  function updateTracksChart (titles: Array<string>) {
    updateTracksChartInfo()

    const chart = charts.tracksChart
    if (chart === null) {
      throw new Error('Chart has not been initialized')
    }
    chart.data.labels = []
    chart.data.datasets[0].data = []

    chart.data.labels = titles
    chart.data.datasets[0].data = selections.feature.data
    chart.data.datasets[0].label = capitalizeFirstLetter(
      selections.feature.featKey
    )
    chart.update()
  }

  /** Update the info in the chart info section of the page. */
  function updateTracksChartInfo () {
    const selFeat = selections.feature

    function computeTendency () {
      if (selFeat.mean <= FEAT_LOW) {
        featAverage.textContent =
          'On average you tend to like tracks with LESS ' +
          selFeat.featKey +
          '.'
      } else if (selFeat.mean >= FEAT_HIGH) {
        featAverage.textContent =
          'On average you tend to like tracks with MORE ' +
          selFeat.featKey +
          '.'
      } else {
        featAverage.textContent =
          "On average you have a NEUTRAL tendency towards a track's " +
          selFeat.featKey +
          '.'
      }

      if (selFeat.std > 15) {
        featAverage.textContent +=
          ' However some tracks vary GREATLY from others.'
      } else if (selFeat.std > 10) {
        featAverage.textContent +=
          ' However some tracks vary SLIGHTLY from others.'
      }
    }
    const featDef = document.getElementById(config.CSS.IDs.featDef) ?? throwExpression(`element of id ${config.CSS.IDs.featDef} does not exist`)
    const featAverage = document.getElementById(config.CSS.IDs.featAverage) ?? throwExpression(`element of id ${config.CSS.IDs.featAverage} does not exist`)
    featDef.textContent = selFeat.definition
    computeTendency()
  }

  function generateEmojis () {
    const emojiContainer = document.getElementById(config.CSS.IDs.emojis) ?? throwExpression(`Emoji container of id ${config.CSS.IDs.emojis} does not exist`)

    const emojiHelpers = (function () {
      function popularityEmoji () {
        if (TRACK_FEATS.popularity.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.sheepEmoji))
        } else if (TRACK_FEATS.popularity.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.wolfEmoji))
        } else {
          // TODO
        }
      }
      function valenceEmoji () {
        if (TRACK_FEATS.valence.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.happyEmoji))
        } else if (TRACK_FEATS.valence.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.sadEmoji))
        } else {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.neutralEmoji))
        }
      }
      function acousticEmoji () {
        if (TRACK_FEATS.acousticness.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.acousticEmoji))
        } else if (TRACK_FEATS.acousticness.mean <= FEAT_LOW) {
          emojiContainer.appendChild(
            getEmojiHtml(config.PATHS.nonAcousticEmoji)
          )
        } else {
          // TODO
        }
      }
      function instrumentalEmoji () {
        if (TRACK_FEATS.instrumentalness.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(
            getEmojiHtml(config.PATHS.instrumentEmoji)
          )
        } else if (TRACK_FEATS.instrumentalness.mean <= FEAT_LOW) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.singerEmoji))
        } else {
          // TODO
        }
      }
      function danceEmoji () {
        if (TRACK_FEATS.danceability.mean >= FEAT_HIGH) {
          emojiContainer.appendChild(getEmojiHtml(config.PATHS.dancingEmoji))
        } else if (TRACK_FEATS.danceability.mean <= FEAT_LOW) {
          // TODO
        } else {
          // TODO
        }
      }
      function getEmojiHtml (path: string) {
        const html = `<img src=${path} alt="emoji"/>`

        return htmlToEl(html) as Node
      }
      return {
        popularityEmoji,
        valenceEmoji,
        acousticEmoji,
        instrumentalEmoji,
        danceEmoji
      }
    })()

    removeAllChildNodes(emojiContainer as Node)
    Object.entries(emojiHelpers).forEach(([, generator]) => {
      generator()
    })
  }

  return {
    updateTracksChart,
    changeTracksChart,
    TRACK_FEATS,
    selections
  }
})()

const featureSelections = document
  .getElementById(config.CSS.IDs.featureSelections) ?? throwExpression(`element of id ${config.CSS.IDs.featureSelections} does not exist`)
const trackTermSelections = document
  .getElementById(config.CSS.IDs.tracksTermSelections) ?? throwExpression(`element of id ${config.CSS.IDs.tracksTermSelections} does not exist`)

const selections = {
  featureTabManager: new SelectableTabEls(),
  termTabManager: new SelectableTabEls()
}

function selectInitialTabs (term: TERMS) {
  selectStartTermTab(term, selections.termTabManager, trackTermSelections)

  const featBtn = featureSelections.getElementsByTagName('button')[0]
  const featBorder = featureSelections.getElementsByClassName(config.CSS.CLASSES.borderCover)[0]

  selections.featureTabManager.selectNewTab(featBtn, featBorder)
}

function hideViewAllButtonOnTextForm () {
  const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks) ?? throwExpression(`element of id ${config.CSS.IDs.viewAllTopTracks} does not exist`)
  viewAllEl.classList.add(config.CSS.CLASSES.displayNone)
  viewAllEl.textContent = 'See Less'
}

const addEventListeners = (function () {
  function addTrackFeatureButtonEvents () {
    function onClick (btn: Element, borderCover: Element) {
      const feature = btn.getAttribute(config.CSS.ATTRIBUTES.dataSelection) ?? throwExpression('track feature button does not contain data selection attribute')
      const selectedFeat = featureManager.TRACK_FEATS[feature]
      if (selectedFeat === undefined) {
        console.error(
          'The selected attribute ' +
            feature +
            ' from ' +
            config.CSS.ATTRIBUTES.dataSelection +
            ' is not valid. Occured in element(see next log):'
        )
        console.error(btn)
        return
      }
      selections.featureTabManager.selectNewTab(btn, borderCover)

      const currTracks = trackActions.getCurrSelTopTracks()
      featureManager.selections.feature = selectedFeat
      featureManager.changeTracksChart(
        currTracks.slice(0, trackActions.selections.numViewableCards)
      )
    }

    const featBtns = featureSelections
      .getElementsByTagName('button')
    const featBorderCovers = featureSelections
      .getElementsByClassName(config.CSS.CLASSES.borderCover)

    if (featBtns.length !== featBorderCovers.length) {
      console.error('Not all feat buttons contain a border cover')
      return
    }

    for (let i = 0; i < featBtns.length; i++) {
      const btn = featBtns[i]
      const borderCover = featBorderCovers[i]
      btn.addEventListener('click', () => onClick(btn, borderCover))
    }
  }

  function addTrackTermButtonEvents () {
    function onClick (btn: Element, borderCover: Element) {
      trackActions.selections.term = determineTerm(btn.getAttribute(config.CSS.ATTRIBUTES.dataSelection) ?? throwExpression('a track term button does not have the data selection attribute'))
      saveTerm(trackActions.selections.term, TERM_TYPE.TRACKS)
      selections.termTabManager.selectNewTab(btn, borderCover)

      const currTracks = trackActions.getCurrSelTopTracks()
      displayCardInfo.displayTracks(currTracks)
    }

    const trackTermBtns = trackTermSelections
      .getElementsByTagName('button')
    const trackTermBorderCovers = trackTermSelections
      .getElementsByClassName(config.CSS.CLASSES.borderCover)

    if (trackTermBorderCovers.length !== trackTermBtns.length) {
      console.error('Not all track term buttons contain a border cover')
      return
    }
    for (let i = 0; i < trackTermBtns.length; i++) {
      const btn = trackTermBtns[i]
      const borderCover = trackTermBorderCovers[i]
      btn.addEventListener('click', () => onClick(btn, borderCover))
    }
  }

  function addExpandDescOnHoverEvents () {
    const DEFAULT_FLEX_BASIS = 60
    const TOP_PADDING = 20
    const BTM_PADDING = 10
    // get each description area for the chart info
    const descDivs = document.getElementsByClassName(
      config.CSS.CLASSES.chartInfo
    )[0].children

    for (let i = 0; i < descDivs.length; i++) {
      // obtain the description and the drop down button
      const desc = descDivs[i] as HTMLElement
      const textContainer = desc.getElementsByClassName(
        config.CSS.CLASSES.expandableTxtContainer
      )[0] as HTMLElement
      if (!textContainer) {
        continue
      }
      const ellipsisText = textContainer.children[0]
      desc.addEventListener('mouseenter', () => {
        ellipsisText.classList.remove(config.CSS.CLASSES.ellipsisWrap)
        desc.style.flexBasis =
          TOP_PADDING + BTM_PADDING + textContainer.offsetHeight + 'px'
      })
      desc.addEventListener('mouseleave', () => {
        ellipsisText.classList.add(config.CSS.CLASSES.ellipsisWrap)
        desc.style.flexBasis = DEFAULT_FLEX_BASIS + 'px'
      })
    }
  }

  function resetViewableCards () {
    const currTracks = trackActions.getCurrSelTopTracks()
    const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks) ?? throwExpression(`element of id ${config.CSS.IDs.viewAllTopTracks} does not exist`)
    trackActions.selections.numViewableCards = DEFAULT_VIEWABLE_CARDS
    viewAllEl.textContent = 'See All 50'

    displayCardInfo.setDisplayNoneClass(trackActions.selections.numViewableCards, currTracks)
  }

  function addViewAllTracksEvent () {
    const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks) ?? throwExpression(`element of id ${config.CSS.IDs.viewAllTopTracks} does not exist`)
    function onClick () {
      if (trackActions.selections.numViewableCards === DEFAULT_VIEWABLE_CARDS) {
        trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS
        viewAllEl.textContent = 'See Less'
      } else {
        resetViewableCards()
      }
      const currTracks = trackActions.getCurrSelTopTracks()
      displayCardInfo.removeDisplayNoneClass(trackActions.selections.numViewableCards, currTracks)
    }

    viewAllEl.addEventListener('click', () => onClick())
  }

  function addGeneratePlaylistEvent () {
    async function generatePlaylistFromTopTracks (term: TERMS) {
      const promise = await promiseHandler(
        axios({
          method: 'post',
          url: config.URLs.postPlaylist('Top ' + term + ' tracks of ' + new Date().toDateString()),
          data: {
            description: 'description'
          }
        }),
        () => {}, () => {
          throw new Error('Issue creating playlist')
        })
      const uris = trackActions.getCurrSelTopTracks().map((track) => track.uri)
      await addItemsToPlaylist(promise.res?.data.id, uris)
    }
    const button = document.getElementById(config.CSS.IDs.generatePlaylist)
    button?.addEventListener('click', () => generatePlaylistFromTopTracks(trackActions.selections.term))
  }

  function addConvertCards () {
    const convertBtn = document.getElementById(config.CSS.IDs.convertCard)
    const convertImg = convertBtn?.getElementsByTagName('img')[0]
    const viewAllEl = document.getElementById(config.CSS.IDs.viewAllTopTracks) ?? throwExpression(`element of id ${config.CSS.IDs.viewAllTopTracks} does not exist`)

    function onClick () {
      if (convertImg === undefined) {
        throw new Error('convert cards to text form buttons image is not found')
      }
      // hide the respective container
      tracksTextContainer?.classList.toggle(config.CSS.CLASSES.displayNone)
      tracksCardContainer?.classList.toggle(config.CSS.CLASSES.displayNone)

      // show either the text form or card form and save it
      if (
        tracksTextContainer?.classList.contains(config.CSS.CLASSES.displayNone)
      ) {
        saveLoad.savedOptions.inTextForm = false
        saveLoad.saveTopTracksForm(false)
        convertImg.src = config.PATHS.listView

        if (tracksTextContainer) {
          removeAllChildNodes(tracksTextContainer)
        }

        viewAllEl.classList.remove(config.CSS.CLASSES.displayNone)
      } else {
        saveLoad.savedOptions.inTextForm = true
        saveLoad.saveTopTracksForm(true)
        trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS
        if (tracksCardContainer) {
          removeAllChildNodes(tracksCardContainer)
        }
        // also disable see all button
        convertImg.src = config.PATHS.gridView
        hideViewAllButtonOnTextForm()
      }
      displayCardInfo.displayTracks(trackActions.getCurrSelTopTracks())
    }

    convertBtn?.addEventListener('click', () => onClick())
  }

  return {
    addTrackFeatureButtonEvents,
    addTrackTermButtonEvents,
    addExpandDescOnHoverEvents,
    addViewAllTracksEvent,
    addGeneratePlaylistEvent,
    addConvertCards
  }
})()

const saveLoad = (function () {
  const savedOptions = { inTextForm: false }
  function saveTopTracksForm (isInTextForm: boolean) {
    promiseHandler(
      axios.put(
        config.URLs.putTopTracksIsInTextFormData(String(isInTextForm))
      )
    )
  }

  return { saveTopTracksForm, savedOptions }
})()

const initialLoads = (function () {
  function loadPlaylistForm () {
    function determineDisplay (isInTextForm: boolean) {
      if (isInTextForm) {
        tracksTextContainer?.classList.remove(config.CSS.CLASSES.displayNone)
        tracksCardContainer?.classList.add(config.CSS.CLASSES.displayNone)

        trackActions.selections.numViewableCards = MAX_VIEWABLE_CARDS
        hideViewAllButtonOnTextForm()
      } else {
        tracksTextContainer?.classList.add(config.CSS.CLASSES.displayNone)
        tracksCardContainer?.classList.remove(config.CSS.CLASSES.displayNone)
      }
    }

    promiseHandler(
      axios
        .get(config.URLs.getTopTracksIsInTextFormData)
        .then((res) => {
          if (res.data === true) {
            const convertBtn = document.getElementById(
              config.CSS.IDs.convertCard
            )
            const convertImg = convertBtn?.getElementsByTagName('img')[0]
            if (convertImg === undefined) {
              throw new Error('convert cards to text form buttons image is not found')
            }
            // show text versions of the cards and hide card versions
            convertImg.src = config.PATHS.gridView
          }
          saveLoad.savedOptions.inTextForm = res.data
          determineDisplay(saveLoad.savedOptions.inTextForm)

          // display tracks after loading whether it was in text or card form
          displayCardInfo.displayTracks(trackActions.getCurrSelTopTracks())
        })
    )
  }
  return {
    loadPlaylistForm
  }
})();

(function () {
  promiseHandler<boolean>(checkIfHasTokens(), (hasToken) =>
    onSuccessfulTokenCall(hasToken, () => {
      // load the term that was the user last had it on
      loadTerm(TERM_TYPE.TRACKS).then(term => {
        trackActions.selections.term = term
        selectInitialTabs(term)
      })
    })
  )

  Object.entries(addEventListeners).forEach(([, addEventListener]) => {
    addEventListener()
  })
  Object.entries(initialLoads).forEach(([, loader]) => {
    loader()
  })
})()
