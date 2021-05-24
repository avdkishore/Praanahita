import React, { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WebView } from 'react-native-webview'
import { useBackHandler } from '@react-native-community/hooks'

import {
  BackHandler,
  Alert,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { Brand } from '@/Components'
import { useTheme } from '@/Theme'
import FetchOne from '@/Store/User/FetchOne'
import { useTranslation } from 'react-i18next'
import ChangeTheme from '@/Store/Theme/ChangeTheme'

const IndexMainContainer = () => {
  const uri = 'https://praanahita.com'
  const WEBVIEW_REF = useRef()

  const { t } = useTranslation()
  const { Common, Fonts, Gutters, Layout } = useTheme()
  const dispatch = useDispatch()

  const user = useSelector(state => state.user.item)
  const fetchOneUserLoading = useSelector(state => state.user.fetchOne.loading)
  const fetchOneUserError = useSelector(state => state.user.fetchOne.error)

  const [userId, setUserId] = useState('1')
  const [canGoBack, setCanGoBack] = useState(false)
  const [loading, setLoading] = useState(false)

  useBackHandler(() => {
    // check if the menu or search is opened. if opened, close them
    const run = `
      const noScrollElem = document.querySelector('.no-scroll-y');

      if (noScrollElem) {
        const openedMenuElem = document.querySelector('.mobile-menu-opened');

        if (openedMenuElem) {
          const openedElem = document.querySelector('.opened');

          openedMenuElem.classList.remove('mobile-menu-opened');
          openedElem.classList.remove('opened');
          noScrollElem.classList.remove('no-scroll-y');
        }

        const openedSearchElem = document.querySelector('.opened');

        if (openedSearchElem) {
          openedSearchElem.classList.remove('opened');
          noScrollElem.classList.remove('no-scroll-y');
        }

      }

      console.log('inside here')
      true;
    `
    WEBVIEW_REF.current.injectJavaScript(run)

    if (canGoBack) {
      // handle it
      WEBVIEW_REF.current.goBack()
      return true
    }

    // let the default thing happen
    return false
  })

  useEffect(() => {
    const backAction = async () => {
      Alert.alert('Hold on!', 'Are you sure you want to go exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ])
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    )

    return () => backHandler.remove()
  }, [])

  const renderLoader = () => {
    if (!loading) {
      return null
    }

    return (
      <ActivityIndicator size="large" color="#00ff00" style={styles.loader} />
    )
  }

  const fetch = id => {
    setUserId(id)
    dispatch(FetchOne.action(id))
  }

  const changeTheme = ({ theme, darkMode }) => {
    dispatch(ChangeTheme.action({ theme, darkMode }))
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={WEBVIEW_REF}
        source={{ uri }}
        startInLoadingState={true}
        renderLoading={renderLoader}
        onNavigationStateChange={navState => {
          // Keep track of going back navigation within component
          // this.canGoBack = navState.canGoBack

          setCanGoBack(navState.canGoBack)
          setLoading(navState.loading)
          console.log(navState)
        }}
      />
      {renderLoader()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }],
  },
})

export default IndexMainContainer
