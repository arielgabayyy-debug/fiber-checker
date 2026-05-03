import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}