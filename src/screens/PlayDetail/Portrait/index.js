import React, { useEffect, useCallback, memo, useState, useMemo, useRef } from 'react'
import {View, StyleSheet ,SafeAreaView } from 'react-native'

import Header from './components/Header'
// import Aside from './components/Aside'
// import Main from './components/Main'
import Player from './Player'
import { useGetter, useDispatch } from '@/store'
import PagerView from 'react-native-pager-view'
import Pic from './Pic'
import Lyric from './Lyric'
import { screenkeepAwake, screenUnkeepAwake } from '@/utils/utils'
import { onNavigationComponentDidDisappearEvent } from '@/navigation'

const LyricPage = ({ activeIndex }) => {
  const initedRef = useRef(false)
  const lyric = useMemo(() => <Lyric />, [])
  switch (activeIndex) {
    // case 3:
    case 1:
      if (!initedRef.current) initedRef.current = true
      return lyric
    default:
      return initedRef.current ? lyric : null
  }
  // return activeIndex == 0 || activeIndex == 1 ? setting : null
}

// global.iskeep = false
export default memo(({ componentId, animated }) => {
  const theme = useGetter('common', 'theme')
  const [pageIndex, setPageIndex] = useState(0)
  const componentIds = useGetter('common', 'componentIds')
  const currentIndexRef = useRef(pageIndex)

  useEffect(() => {
    let listener
    if (componentIds.comment) {
      if (currentIndexRef.current == 1) screenUnkeepAwake()
      listener = onNavigationComponentDidDisappearEvent(componentIds.comment, () => {
        if (currentIndexRef.current == 1) screenkeepAwake()
      })
    }
    return () => {
      if (listener) listener.remove()
    }
  }, [componentIds])

  const onPageSelected = useCallback(({ nativeEvent }) => {
    setPageIndex(nativeEvent.position)
    currentIndexRef.current = nativeEvent.position
    if (nativeEvent.position == 1) {
      screenkeepAwake()
    } else {
      screenUnkeepAwake()
    }
  }, [])

  return (
    <>
      <SafeAreaView>
      <Header />
      </SafeAreaView>
      <View style={{ flex: 1, flexDirection: 'column', height: '100%', backgroundColor: theme.primary }}>
        <PagerView
          onPageSelected={onPageSelected}
          // onPageScrollStateChanged={onPageScrollStateChanged}
          style={styles.pagerView}
        >
          <View collapsable={false} style={styles.pageStyle}>
            <Pic componentId={componentId} animated={animated} />
          </View>
          <View collapsable={false} style={styles.pageStyle}>
            <LyricPage activeIndex={pageIndex} />
          </View>
        </PagerView>
        <View style={styles.pageIndicator} nativeID="pageIndicator">
          <View style={{ ...styles.pageIndicatorItem, backgroundColor: pageIndex == 0 ? theme.secondary20 : theme.normal60 }}></View>
          <View style={{ ...styles.pageIndicatorItem, backgroundColor: pageIndex == 1 ? theme.secondary20 : theme.normal60 }}></View>
        </View>
        <View style={styles.player} nativeID="player">
          <Player />
        </View>
      </View>
    </>
  )
})

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: '#fff',
  },
  pagerView: {
    flex: 1,
  },
  pageIndicator: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
  pageIndicatorItem: {
    height: 3,
    width: '5%',
    marginLeft: 2,
    marginRight: 2,
    borderRadius: 2,
  },
  player: {
    flex: 0,
  },
})
