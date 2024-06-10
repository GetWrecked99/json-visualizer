'use client'

import { useEffect, useState } from 'react'
import { isValidJSON, jsonVisualizer } from './util'
import { JsonInput } from '@mantine/core'
import JSONRenderer from './JSONRenderer'

export default function Home() {
    const [oldJsonValue, setOldJsonValue] = useState('')
    const [newJsonValue, setNewJsonValue] = useState('')
    const [jsonData, setJsonData] = useState({})

    useEffect(() => {
        if (oldJsonValue && newJsonValue) {
            if (isValidJSON(oldJsonValue) && isValidJSON(newJsonValue)) {
                const val = jsonVisualizer(JSON.parse(oldJsonValue), JSON.parse(newJsonValue))
                setJsonData(val)
            }
        }
    }, [oldJsonValue, newJsonValue])

    return (
        <div className=' overflow-hidden w-screen min-h-screen flex flex-col gap-y-10 bg-neutral-50 p-12'>
            <div className='size-full grid grid-cols-2 gap-8 overflow-auto'>
                <JsonInput
                    label='Old Json'
                    placeholder='Please insert your old json'
                    validationError='Invalid JSON'
                    formatOnBlur
                    autosize
                    minRows={16}
                    maxRows={16}
                    value={oldJsonValue}
                    onChange={setOldJsonValue}
                />
                <JsonInput
                    label='New Json'
                    placeholder='Please insert your new json'
                    validationError='Invalid JSON'
                    formatOnBlur
                    autosize
                    minRows={16}
                    maxRows={16}
                    value={newJsonValue}
                    onChange={setNewJsonValue}
                />
            </div>
            <div>
                <JSONRenderer jsonData={jsonData} />
            </div>
        </div>
    )
}
