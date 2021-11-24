import axios, { AxiosResponse } from 'axios'
import { config, promiseHandler } from './config'

export async function displayUsername () {
  promiseHandler<AxiosResponse<string | null>>(axios.request<string | null>({ method: 'GET', url: config.URLs.getUsername }), (res) => {
    const username = document.getElementById(config.CSS.IDs.username)
    if (username) {
      username.textContent = res.data
    }
  })
}
