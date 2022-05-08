import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import '../styles/globals.css'
import initAuth from '../utils/initAuth'

initAuth()


function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
