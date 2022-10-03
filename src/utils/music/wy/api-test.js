import { httpFetch } from '../../request'
import { requestMsg } from '../../message'
import { headers, timeout } from '../options'
import { eapi } from './utils/crypto'

const qualitys = {
  '128k': 128000,
  '320k': 320000,
  flac: 999000,
}



const api_test = {
  getMusicUrl(songInfo, type) {
    type = qualitys[type]
    const target_url = 'https://interface3.music.163.com/eapi/song/enhance/player/url'
    const eapiUrl = '/api/song/enhance/player/url'
    const d = {
      ids: `[${songInfo.songmid}]`,
      br: type,
    }
    const data = eapi(eapiUrl, d)
    let cookie = 'os=pc'

    const requestObj = httpFetch(target_url, {
      method: 'post',
      timeout,
      headers: {
        cookie,
      },
      form: data,
    })
    requestObj.promise = requestObj.promise.then(({ body }) => {
      console.log('网易body')
      const { url } = body.data[0]
      console.log(url)
      if (!url) return Promise.reject(new Error(requestMsg.fail))
      return body.code === 200 ? Promise.resolve({ type, url: body.data }) : Promise.reject(new Error(requestMsg.fail))
    })
    return requestObj
  },
/*   getPic(songInfo) {
    const requestObj = httpFetch(`http://localhost:3100/pic/wy/${songInfo.songmid}`, {
      method: 'get',
      timeout,
      headers,
      family: 4,
    })
    requestObj.promise = requestObj.promise.then(({ body }) => {
      return body.code === 0 ? Promise.resolve(body.data) : Promise.reject(new Error(requestMsg.fail))
    })
    return requestObj
  },
  getLyric(songInfo) {
    const requestObj = httpFetch(`http://localhost:3100/lrc/wy/${songInfo.songmid}`, {
      method: 'get',
      timeout,
      headers,
      family: 4,
    })
    requestObj.promise = requestObj.promise.then(({ body }) => {
      return body.code === 0 ? Promise.resolve(body.data) : Promise.reject(new Error(requestMsg.fail))
    })
    return requestObj
  }, */
}

export default api_test
