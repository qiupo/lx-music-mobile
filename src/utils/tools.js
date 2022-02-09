import { Platform, NativeModules, ToastAndroid, BackHandler, Linking, Dimensions, Alert } from 'react-native'
import ExtraDimensions from 'react-native-extra-dimensions-android'
import Clipboard from '@react-native-clipboard/clipboard'
import { getData, setData, getAllKeys, removeData, removeDataMultiple, setDataMultiple, getDataMultiple } from '@/plugins/storage'
import { storageDataPrefix } from '@/config'
import { throttle } from './index'
import { gzip, ungzip } from '@/utils/gzip'
import { readFile, writeFile, temporaryDirectoryPath, unlink } from '@/utils/fs'

const playInfoStorageKey = storageDataPrefix.playInfo
const listPositionPrefix = storageDataPrefix.listPosition
const syncAuthKeyPrefix = storageDataPrefix.syncAuthKey
const syncHostPrefix = storageDataPrefix.syncHost
const syncHostHistoryPrefix = storageDataPrefix.syncHostHistory
const listPrefix = storageDataPrefix.list
const listSortPrefix = storageDataPrefix.listSort
const defaultListKey = listPrefix + 'default'
const loveListKey = listPrefix + 'love'


// https://stackoverflow.com/a/47349998
let deviceLanguage = Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
  : NativeModules.I18nManager.localeIdentifier
deviceLanguage = typeof deviceLanguage === 'string' ? deviceLanguage.substring(0, 5).toLocaleLowerCase() : ''

const handleSaveListScrollPosition = throttle(data => {
  setData(listPositionPrefix, data)
}, 1000)


// fix https://github.com/facebook/react-native/issues/4934
export const getWindowSise = windowDimensions => {
  if (!windowDimensions) windowDimensions = Dimensions.get('window')
  if (Platform.OS === 'ios') return windowDimensions
  const windowSize = {
    width: ExtraDimensions.getRealWindowWidth(),
    height: ExtraDimensions.getRealWindowHeight(),
  }
  if (
    (windowDimensions.height > windowDimensions.width && windowSize.height < windowSize.width) ||
    (windowDimensions.width > windowDimensions.height && windowSize.width < windowSize.height)
  ) {
    windowSize.height = windowSize.width
  }
  windowSize.width = windowDimensions.width

  if (ExtraDimensions.isSoftMenuBarEnabled()) {
    windowSize.height -= ExtraDimensions.getSoftMenuBarHeight()
  }
  return windowSize
}


/**
 * 显示toast
 * @param {String} message 消息
 * @param {String} duration 时长，可用值：long、short
 * @param {String} position 位置，可用值：top、center、bottom
 */
export const toast = (message, duration = 'short', position = 'bottom') => {
  switch (duration) {
    case 'long':
      duration = ToastAndroid.LONG
      break
    case 'short':
    default:
      duration = ToastAndroid.SHORT
      break
  }
  switch (position) {
    case 'top':
      position = ToastAndroid.TOP
      break
    case 'center':
      position = ToastAndroid.CENTER
      break
    case 'bottom':
    default:
      position = ToastAndroid.BOTTOM
      break
  }
  ToastAndroid.show(message, duration, position)
}

export const openUrl = url => Linking.canOpenURL(url).then(() => Linking.openURL(url))

export const assertApiSupport = source => global.globalObj.qualityList[source] != undefined

// const handleRemoveDataMultiple = async keys => {
//   await removeDataMultiple(keys.splice(0, 500))
//   if (keys.length) return handleRemoveDataMultiple(keys)
// }


export const getAllListData = async() => {
  let defaultList
  let loveList
  let userList = []
  let keys = await getAllKeys()
  const listKeys = []
  for (const key of keys) {
    if (key.startsWith(listPrefix)) {
      listKeys.push(key)
    }
  }
  const listData = await getDataMultiple(listKeys)
  for (const { key, value } of listData) {
    switch (key) {
      case defaultListKey:
        defaultList = value
        break
      case loveListKey:
        loveList = value
        break
      default:
        userList.push(value)
        break
    }
  }
  const listPositionData = await getData(listPositionPrefix) || {}
  const listPosition = {}
  for (const [key, value] of Object.entries(listPositionData)) {
    listPosition[key] = value
  }
  const listSortData = await getData(listSortPrefix) || {}
  return {
    defaultList,
    loveList,
    userList,
    listPosition,
    listSort: listSortData,
  }
}

export const saveList = async listData => {
  if (Array.isArray(listData)) {
    await setDataMultiple(listData.map(list => ({ key: listPrefix + list.id, value: list })))
  } else {
    await setData(listPrefix + listData.id, listData)
  }
}
export const removeList = async listId => {
  if (Array.isArray(listId)) {
    await removeDataMultiple(listId.map(id => {
      delete global.listScrollPosition[id]
      delete global.listSort[id]
      return listPrefix + id
    }))
  } else {
    await removeData(listPrefix + listId)
  }
  await setData(listSortPrefix, global.listSort)
  handleSaveListScrollPosition(global.listScrollPosition)
}


export const saveListAllSort = async listSort => {
  global.listSort = listSort
  await setData(listSortPrefix, listSort)
}
export const saveListSort = (listId, index) => {
  global.listSort[listId] = index
  setData(listSortPrefix, global.listSort)
}
export const removeListSort = async listIds => {
  for (const id of listIds) {
    delete global.listSort[id]
  }
  setData(listSortPrefix, global.listSort)
}

export const getMusicUrl = (musicInfo, type) => getData(`${storageDataPrefix.musicUrl}${musicInfo.source}_${musicInfo.songmid}_${type}`).then(url => url || '')
export const saveMusicUrl = (musicInfo, type, url) => setData(`${storageDataPrefix.musicUrl}${musicInfo.source}_${musicInfo.songmid}_${type}`, url)
export const clearMusicUrl = async() => {
  let keys = (await getAllKeys()).filter(key => key.startsWith(storageDataPrefix.musicUrl))
  await removeDataMultiple(keys)
}

export const getLyric = musicInfo => getData(`${storageDataPrefix.lyric}${musicInfo.source}_${musicInfo.songmid}`).then(lrcInfo => lrcInfo || {})
export const saveLyric = (musicInfo, { lyric, tlyric, lxlyric }) => setData(`${storageDataPrefix.lyric}${musicInfo.source}_${musicInfo.songmid}`, { lyric, tlyric, lxlyric })
export const clearLyric = async() => {
  let keys = (await getAllKeys()).filter(key => key.startsWith(storageDataPrefix.lyric))
  await removeDataMultiple(keys)
}

export const clearMusicUrlAndLyric = async() => {
  let keys = (await getAllKeys()).filter(key => key.startsWith(storageDataPrefix.musicUrl) || key.startsWith(storageDataPrefix.lyric))
  await removeDataMultiple(keys)
}

export const delaySavePlayInfo = throttle(n => {
  setData(playInfoStorageKey, n)
}, 2000)
export const savePlayInfo = (info, isDelay) => {
  isDelay
    ? delaySavePlayInfo(info)
    : setData(playInfoStorageKey, info)
}
export const getPlayInfo = () => getData(playInfoStorageKey)


export const saveListScrollPosition = (listId, position) => {
  global.listScrollPosition[listId] = position
  handleSaveListScrollPosition(global.listScrollPosition)
}
export const getListScrollPosition = listId => {
  return global.listScrollPosition[listId] || 0
}
export const removeListScrollPosition = async listIds => {
  for (const id of listIds) {
    delete global.listScrollPosition[id]
  }
  handleSaveListScrollPosition(global.listScrollPosition)
}

export const getSyncAuthKey = async serverId => {
  const keys = await getData(syncAuthKeyPrefix)
  if (!keys) return null
  return keys[serverId] || null
}

export const setSyncAuthKey = async(serverId, key) => {
  let keys = await getData(syncAuthKeyPrefix) || {}
  keys[serverId] = key
  await setData(syncAuthKeyPrefix, keys)
}

let syncHostInfo
export const getSyncHost = async() => {
  if (syncHostInfo === undefined) {
    syncHostInfo = await getData(syncHostPrefix) || { host: '', port: '23332' }
  }
  return { ...syncHostInfo }
}
export const setSyncHost = async({ host, port }) => {
  // let hostInfo = await getData(syncHostPrefix) || {}
  // hostInfo.host = host
  // hostInfo.port = port
  syncHostInfo.host = host
  syncHostInfo.port = port
  await setData(syncHostPrefix, syncHostInfo)
}
let syncHostHistory
export const getSyncHostHistory = async() => {
  if (syncHostHistory === undefined) {
    syncHostHistory = await getData(syncHostHistoryPrefix) || []
  }
  return syncHostHistory
}
export const addSyncHostHistory = async(host, port) => {
  let syncHostHistory = await getSyncHostHistory()
  if (syncHostHistory.some(h => h.host == host && h.port == port)) return
  syncHostHistory.unshift({ host, port })
  if (syncHostHistory.length > 20) syncHostHistory = syncHostHistory.slice(0, 20) // 最多存储20个
  await setData(syncHostHistoryPrefix, syncHostHistory)
}
export const removeSyncHostHistory = async index => {
  syncHostHistory.splice(index, 1)
  await setData(syncHostHistoryPrefix, syncHostHistory)
}

export const exitApp = BackHandler.exitApp

export const handleSaveFile = async(path, data) => {
  // if (!path.endsWith('.json')) path += '.json'
  // const buffer = gzip(data)
  const tempFilePath = `${temporaryDirectoryPath}/tempFile.json`
  await writeFile(tempFilePath, JSON.stringify(data), 'utf8')
  await gzip(tempFilePath, path)
  await unlink(tempFilePath)
}
export const handleReadFile = async(path) => {
  let isJSON = path.endsWith('.json')
  let data
  if (isJSON) {
    data = await readFile(path, 'utf8')
  } else {
    const tempFilePath = `${temporaryDirectoryPath}/tempFile.json`
    await ungzip(path, tempFilePath)
    data = await readFile(tempFilePath, 'utf8')
    await unlink(tempFilePath)
  }
  return JSON.parse(data)
}

export const confirmDialog = ({
  message = '',
  cancelButtonText = global.i18n.t('dialog_cancel'),
  confirmButtonText = global.i18n.t('dialog_confirm'),
  bgClose = true,
}) => {
  return new Promise(resolve => {
    Alert.alert(null, message, [
      {
        text: cancelButtonText,
        onPress() {
          resolve(false)
        },
      },
      {
        text: confirmButtonText,
        onPress() {
          resolve(true)
        },
      },
    ], {
      cancelable: bgClose,
      onDismiss() {
        resolve(false)
      },
    })
  })
}

export const clipboardWriteText = str => {
  Clipboard.setString(str)
}

export {
  deviceLanguage,
}
