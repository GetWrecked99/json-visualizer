type JSONRendererProps = {
    jsonData: Record<string, unknown>
}

const JSONRenderer = ({ jsonData }: JSONRendererProps) => {
    // console.log('jj', jsonData)

    const renderValue = (key: string, value: unknown, isLast: boolean) => {
        const cleanKey = key.replace(/^(\+\+|--|==)/, '')
        const hint = key.startsWith('++') ? 'new Item' : key.startsWith('--') ? 'removed Item' : ''
        const keyStyle = key.startsWith('++')
            ? { backgroundColor: 'lightgreen' }
            : key.startsWith('--')
              ? { backgroundColor: 'lightcoral' }
              : {}

        //in case is normall child of array
        console.log('000')

        if (typeof value == 'object' && value) {
            console.log('111')

            if ('status' in value && 'value' in value && 'index' in value) {
                console.log('222')

                if (value.status === 'Added' || value.status === 'Deleted' || value.status === 'UnChanged') {
                    console.log(value, 'is')
                    const keyStyle =
                        value.status === 'Added'
                            ? { backgroundColor: 'lightgreen' }
                            : value.status === 'Deleted'
                              ? { backgroundColor: 'lightcoral' }
                              : {}

                    const style =
                        value.status !== 'UnChanged'
                            ? { borderBottom: ' 2px solid #fff', position: 'relative' as const }
                            : {}
                    if (typeof value.value === 'object') {
                        return (
                            <div style={{ ...keyStyle, ...style }}>
                                {Array.isArray(value.value) ? '[' : '{'}
                                <div>
                                    {Object.entries(value.value as Record<string, unknown>).map(
                                        ([innerKey, innerValue], index, arr) => (
                                            <div key={innerKey}>
                                                {renderValue(
                                                    Array.isArray(value.value) ? '' : innerKey,
                                                    innerValue,
                                                    index === arr.length - 1
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                                {Array.isArray(value.value) ? ']' : '}'}
                                {!isLast && <span>,</span>}
                                {
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            translate: ' 0 -50%',
                                            textAlign: 'right'
                                        }}
                                    >
                                        {`${value.status === 'Added' ? 'added to' : 'removed from'} ---> index:${value.index}`}{' '}
                                    </span>
                                }
                            </div>
                        )
                    } else {
                        return (
                            <div style={{ ...keyStyle, ...style }}>
                                <span>{`"${value.value}"`}</span>
                                {!isLast && <span>,</span>}
                                {value.status !== 'UnChanged' && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            translate: ' 0 -50%'
                                        }}
                                    >
                                        {`${value.status === 'Added' ? 'added to' : 'removed from'} ---> index:${value.index}`}
                                    </span>
                                )}
                            </div>
                        )
                    }
                }
            }
        }
        if (typeof value === 'object') {
            return (
                <div style={{ ...keyStyle, position: 'relative' }}>
                    <span>{`"${cleanKey}"`}:</span> {Array.isArray(value) ? '[' : '{'}
                    <div style={{ marginLeft: '20px' }}>
                        {Object.entries(value as Record<string, unknown>).map(([innerKey, innerValue], index, arr) => (
                            <div key={innerKey}>
                                {renderValue(
                                    Array.isArray(value) ? '' : innerKey,
                                    innerValue,
                                    index === arr.length - 1
                                )}
                            </div>
                        ))}
                    </div>
                    {Array.isArray(value) ? ']' : '}'}
                    <span
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            translate: ' 0 -50%'
                        }}
                    >
                        {hint}
                    </span>
                    {!isLast && <span>,</span>}
                </div>
            )
        } else {
            return (
                <div style={{ ...keyStyle, position: 'relative' }}>
                    {cleanKey && <span>{`"${cleanKey}"`}:</span>}
                    {`"${value}"`}
                    {!isLast && <span>,</span>}
                    <span
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            translate: ' 0 -50%'
                        }}
                    >
                        {hint}
                    </span>
                </div>
            )
        }
    }

    return (
        <div style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
            {Array.isArray(jsonData) ? '[' : '{'}
            <div className='flex flex-col gap-y-0.5 ml-5'>
                {Object.entries(jsonData).map(([key, value], index, arr) => (
                    <div key={key}>{renderValue(key, value, index === arr.length - 1)}</div>
                ))}
            </div>
            {Array.isArray(jsonData) ? ']' : '}'}
        </div>
    )
}

export default JSONRenderer
