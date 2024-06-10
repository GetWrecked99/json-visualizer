'use client'

import { type PropsWithChildren } from 'react'
import { ColorSchemeScript, DirectionProvider, MantineProvider } from '@mantine/core'

export const RootProvider = ({ children }: PropsWithChildren) => {
    return (
        <DirectionProvider>
            <MantineProvider>{children}</MantineProvider>
            <ColorSchemeScript defaultColorScheme='light' />
        </DirectionProvider>
    )
}
