import axios, { AxiosResponse } from 'axios'
import { config, promiseHandler } from '../config'
import SelectableTabEls from './SelectableTabEls'

export enum TERMS {
    SHORT_TERM = 'short_term',
    MID_TERM = 'medium_term',
    LONG_TERM = 'long_term'
}

export enum TERM_TYPE {
    ARTISTS = 'artists',
    TRACKS = 'tracks'
}

export function determineTerm (val: string) : TERMS {
  switch (val) {
    case TERMS.SHORT_TERM:
      return TERMS.SHORT_TERM
    case TERMS.MID_TERM:
      return TERMS.MID_TERM
    case TERMS.LONG_TERM:
      return TERMS.LONG_TERM
    default:
      throw new Error('NO CORRECT TERM WAS FOUND')
  }
}

export async function loadTerm (termType: TERM_TYPE) : Promise<TERMS> {
  const { res, err } = await promiseHandler<AxiosResponse<string | null>>((axios.request<string | null>({ method: 'GET', url: config.URLs.getTerm(termType) })))
  if (err) {
    return TERMS.SHORT_TERM
  }
  return determineTerm(res?.data as string)
}

export async function saveTerm (term: TERMS, termType: TERM_TYPE) {
  await promiseHandler(axios.put(config.URLs.putTerm(term, termType)))
}

/**
 * Get the index that points to the tab elements
 * @param term the term relating to the tab elements
 * @returns the index to find the tab elements
 */
export function IdxFromTerm (term: TERMS) {
  switch (term) {
    case TERMS.SHORT_TERM:
      return 0
    case TERMS.MID_TERM:
      return 1
    case TERMS.LONG_TERM:
      return 2
  }
}

export function selectStartTermTab (term: TERMS, termTab: SelectableTabEls, tabParent: Element) {
  const idx = IdxFromTerm(term)
  const btn = tabParent.getElementsByTagName('button')[idx]
  const border = tabParent.getElementsByClassName(config.CSS.CLASSES.borderCover)[idx]

  termTab.selectNewTab(btn, border)
}
