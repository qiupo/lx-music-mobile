import { httpFetch } from '../../request'
import { requestMsg } from '../../message'
import { headers, timeout } from '../options'

const api_test = {
  // getMusicUrl(songInfo, type) {
  //   const requestObj = httpFetch(`http://45.32.53.128:3002/m/kw/u/${songInfo.songmid}/${type}`, {
  //     method: 'get',
  //     headers,
  //     timeout,
  //   })
  //   requestObj.promise = requestObj.promise.then(({ body }) => {
  //     return body.code === 0 ? Promise.resolve({ type, url: body.data }) : Promise.reject(new Error(body.msg))
  //   })
  //   return requestObj
  // },
  getMusicUrl(songInfo, type) {
    console.log('请求歌曲')
    // http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songInfo.songmid}&type=music&httpsStatus=1
    console.log(`http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songInfo.songmid}&type=music&httpsStatus=1`)
    const requestObj = httpFetch(`http://www.kuwo.cn/api/v1/www/music/playUrl?mid=${songInfo.songmid}&type=music&httpsStatus=1`, {
      method: 'get',
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:82.0) Gecko/20100101 Firefox/82.0',
        Referer: 'http://kuwo.cn/',
      },
      family: 4,
    })
    requestObj.promise = requestObj.promise.then(({ body }) => {
      return body.code === 200 ? Promise.resolve({ type, url: body.data }) : Promise.reject(new Error(requestMsg.fail))
    })

    return requestObj
  },
}

export default api_test
