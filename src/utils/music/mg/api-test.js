import {httpFetch} from '../../request'
import {requestMsg} from '../../message'
import {headers, timeout} from '../options'


const qualitys = {
  '128k': 'PQ',
  '320k': 'HQ',
  flac: 'SQ',
  flac32bit: 'ZQ',
}

const api_test = {
  getMusicUrl(songInfo, type) {
    type = qualitys[type]
    // https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2?netType=01&resourceType=E&songId=${songInfo.songmid}&toneFlag=${type}
    const requestObj = httpFetch(`https://app.c.nf.migu.cn/MIGUM2.0/strategy/listen-url/v2.2?netType=01&resourceType=E&songId=${songInfo.songmid}&toneFlag=${type}`, {
      method: 'get',
      timeout,
      headers: {
        channel: '0146951',
        uid: 1234,
      },
    })
    requestObj.promise = requestObj.promise.then(({body}) => {
      console.log('咪咕body-----')
      console.log(body)
      let playUrl = body.data?.url
      if (!playUrl) return Promise.reject(new Error(requestMsg.fail))

      if (playUrl.startsWith('//')) playUrl = `https:${playUrl}`

      playUrl = playUrl.replace(/\+/g, '%2B')
      return body.code === 0 ? Promise.resolve(playUrl) : Promise.reject(new Error(requestMsg.fail))
    })
    return requestObj
  },
}

export default api_test
