import React from "react";

import '../styles/globals.css'
import {ChakraProvider} from "@chakra-ui/react";
import {StoreProvider} from "../store/store-reducer";

function MyApp({Component, pageProps}) {
    return (
        <React.StrictMode>
            <ChakraProvider>
                <StoreProvider>
                    <Component {...pageProps} />
                </StoreProvider>
            </ChakraProvider>
        </React.StrictMode>
    )
}
export default MyApp
