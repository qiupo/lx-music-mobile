import { httpFetch } from '../../request'
import { requestMsg } from '../../message'
import { headers, timeout } from '../options'

const api_test = {
  getMusicUrl(songInfo, type) {
    // https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${songInfo._types[type].hash}&dfid=dfid&mid=mid&platid=4&album_id=${songInfo.albumId}
    const requestObj = httpFetch(`https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash=${songInfo._types[type].hash}&dfid=dfid&mid=mid&platid=4&album_id=${songInfo.albumId}`, {
      method: 'get',
      timeout,
      headers,
      family: 4,
    })
    requestObj.promise = requestObj.promise.then(({ body }) => {
      console.log('酷狗body-----')
      console.log(body)
      return body.code === 200 ? Promise.resolve({ type, play_url: body.data }) : Promise.reject(new Error(requestMsg.fail))
    })
    return requestObj
  },
  getPic(songInfo) {
    const requestObj = httpFetch(`http://ts.tempmusic.tk/pic/kg/${songInfo.hash}`, {
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
    const requestObj = httpFetch(`http://ts.tempmusic.tk/lrc/kg/${songInfo.hash}`, {
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
}

export default api_test
