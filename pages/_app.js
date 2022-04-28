import '../styles/globals.css'
import {StoreProvider} from "../store/store-reducer";

function MyApp({ Component, pageProps }) {

  return <StoreProvider><Component {...pageProps} /></StoreProvider>
}

export default MyApp
