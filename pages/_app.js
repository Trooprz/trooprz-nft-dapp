import React from "react";

import '../styles/globals.css'
import {ChakraProvider} from "@chakra-ui/react";
import {StoreProvider} from "../store/store-reducer";
import '@fontsource/montserrat/400.css'
import '@fontsource/open-sans/700.css'
import theme from "../styles/theme";

function MyApp({Component, pageProps}) {
    return (
        <React.StrictMode>
            <ChakraProvider theme={theme}>
                <StoreProvider>
                    <Component {...pageProps} />
                </StoreProvider>
            </ChakraProvider>
        </React.StrictMode>
    )
}
export default MyApp
