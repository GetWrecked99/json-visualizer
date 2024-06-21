export type TJSObjectType = 'object' | 'array' | 'null' | 'date'

export type TJSNonObjectType = 'string' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'function' | 'symbol'

export type TJsonType = Record<string, unknown> | Record<string, unknown>[]

export type TObjectType = Record<string, unknown>

export type TArrayType = unknown[]

export type TStatusType = 'Added' | 'Deleted' | 'UnChanged' | 'Unknown' | 'UnknownObj'

export const getVariableObjectType = (variable: object): TJSObjectType => {
    if (variable instanceof Date) return 'date'
    else if (variable === null) return 'null'
    else if (Array.isArray(variable)) return 'array'
    return 'object'
}

export const getVariableDataType = (variable: unknown): TJSObjectType | TJSNonObjectType =>
    typeof variable !== 'object' ? typeof variable : getVariableObjectType(variable as object)

export const jsonVisualizer = (oldJsonVersion: TJsonType, newJsonVersion: TJsonType) => {
    const oldJsonVersionType = getVariableDataType(oldJsonVersion) as 'object' | 'array'
    const newJsonVersionType = getVariableDataType(newJsonVersion) as 'object' | 'array'

    if (oldJsonVersionType !== newJsonVersionType) {
        // It means newJsonVersion get old one's place
        return newJsonVersion
    } else {
        // both json has the same type ~> array or object
        if (newJsonVersionType === 'object') {
            // Do not needs to check both
            const oldJson = oldJsonVersion as TObjectType
            const newJson = newJsonVersion as TObjectType

            return objectVisualizer(oldJson, newJson)
        } else {
            // both are arrays
            const oldJson = oldJsonVersion as TArrayType
            const newJson = newJsonVersion as TArrayType

            return arrayVisualizer(oldJson, newJson)
        }
    }
}

//

const objectVisualizer = (oldObjectVersion: TObjectType, newObjectVersion: TObjectType): TObjectType => {
    const merged: TObjectType = {}

    const oldKeys = Object.keys(oldObjectVersion)
    const newKeys = Object.keys(newObjectVersion)
    const allKeys = Array.from(new Set([...oldKeys, ...newKeys]))

    for (const key of allKeys) {
        const oldValue = oldObjectVersion[key]
        const newValue = newObjectVersion[key]
        const oldValueType = getVariableDataType(oldValue)
        const newValueType = getVariableDataType(newValue)
        if (!oldKeys.includes(key)) {
            // key added to the newObjectVersion
            merged[`++${key}`] = `%${newValueType}%` + newValue
        } else if (!newKeys.includes(key)) {
            // key removed from the newObjectVersion
            merged[`--${key}`] = `%${oldValueType}%` + oldValue
        } else {
            // key exists in both objects, should check the types & values of them

            if (oldValueType !== newValueType) {
                // the values does not have the same type, it means new one takes the old one's place
                if (oldValueType != 'object') merged[`--${key}`] = `%${oldValueType}%` + oldValue
                else merged[`--${key}`] = oldValue
                if (newValueType != 'object') merged[`++${key}`] = `%${newValueType}%` + newValue
                else merged[`++${key}`] = newValue
            } else {
                // both values has the same type, so we can declare the type like this :
                const valuesType = newValueType // its the same as oldValueType
                if (['undefined', 'null'].includes(valuesType)) {
                    const value = '%null%' + newValue // since the types are equal, its the same as oldValue
                    merged[`==${key}`] = value
                } else if (['string', 'number', 'bigint', 'boolean'].includes(valuesType)) {
                    const oldValueWithType = oldValue as string | number | bigint | boolean
                    const newValueWithType = newValue as string | number | bigint | boolean
                    if (oldValueWithType !== newValueWithType) {
                        // the values are not equal. since both of them has the same type, it means new one takes the old one's place
                        merged[`--${key}`] = `%${oldValueType}%` + oldValue
                        merged[`++${key}`] = `%${newValueType}%` + newValue

                        // merged[`--${key}`] = oldValue
                        // merged[`++${key}`] = newValue
                    } else {
                        // the values are equal, its the same as oldValue
                        merged[`==${key}`] = `%${newValueType}%` + newValue
                    }
                } else if (valuesType === 'date') {
                    const oldValueWithType = oldValue as Date
                    const newValueWithType = newValue as Date
                    if (oldValueWithType.getTime() !== newValueWithType.getTime()) {
                        // the values are not equal, it means new one takes the old one's place
                        merged[`--${key}`] = `%${valuesType}%` + oldValue
                        merged[`++${key}`] = `%${valuesType}%` + newValue
                    } else {
                        // the values are equal, its the same as oldValue
                        merged[`==${key}`] = `%${valuesType}%` + newValue
                    }
                } else if (valuesType === 'array') {
                    const oldValueWithType = oldValue as TArrayType
                    const newValueWithType = newValue as TArrayType
                    const mergedInnerArray = arrayVisualizer(oldValueWithType, newValueWithType)
                    merged[`==${key}`] = mergedInnerArray
                } else if (valuesType === 'object') {
                    const oldValueWithType = oldValue as TObjectType
                    const newValueWithType = newValue as TObjectType
                    const mergedInnerObject = objectVisualizer(oldValueWithType, newValueWithType)
                    merged[`==${key}`] = { ...mergedInnerObject }
                } else {
                    // It means the type is neither function or symbol
                    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                        // the values are not equal, it means new one takes the old one's place

                        merged[`--${key}`] = oldValue
                        merged[`++${key}`] = newValue
                    } else {
                        // the values are equal, its the same as oldValue
                        merged[`==${key}`] = newValue
                    }
                }
            }
        }
    }

    return merged
}

const arrayVisualizer = (oldArrayVersion: TArrayType, newArrayVersion: TArrayType) => {
    const merged: {
        status: TStatusType
        value: unknown
        index: number
    }[] = []

    const DEVELOPMENT_FLAG_MESSAGE = 'VALUE_OF_THIS_INDEX_DOES_NOT_EXIST'

    for (let index = 0; index < Math.max(oldArrayVersion.length, newArrayVersion.length); index++) {
        const oldIndexValue = index < oldArrayVersion.length ? oldArrayVersion[index] : DEVELOPMENT_FLAG_MESSAGE
        const newIndexValue = index < newArrayVersion.length ? newArrayVersion[index] : DEVELOPMENT_FLAG_MESSAGE

        const oldIndexValueType = getVariableDataType(oldIndexValue)
        const newIndexValueType = getVariableDataType(newIndexValue)

        const isOldIndexValueExist = oldIndexValue !== DEVELOPMENT_FLAG_MESSAGE
        const isNewIndexValueExist = newIndexValue !== DEVELOPMENT_FLAG_MESSAGE

        if (isOldIndexValueExist && !isNewIndexValueExist) {
            const formattedValue = {
                status: 'Deleted' as const,
                value: oldIndexValue,
                index
            }

            merged.push(formattedValue)
        } else if (!isOldIndexValueExist && isNewIndexValueExist) {
            const formattedValue = {
                status: 'Added' as const,
                value: newIndexValue,
                index
            }

            merged.push(formattedValue)
        } else {
            // Both Index Values Are Exist. Must Check The Types First, Then Check Each Values
            if (oldIndexValueType !== newIndexValueType) {
                // The Types Are Not Equal, Its Means That The New One Takes The Old One's Place
                const deletedFormattedValue = {
                    status: 'Deleted' as const,
                    value: oldIndexValue,
                    index
                }

                const addedFormattedValue = {
                    status: 'Added' as const,
                    value: newIndexValue,
                    index
                }

                merged.push(deletedFormattedValue)
                console.log('yo', deletedFormattedValue, oldArrayVersion)

                merged.push(addedFormattedValue)
            } else {
                // both values has the same type, so we can declare the type like this :
                const valuesType = newIndexValueType // its the same as oldIndexValueType
                if (['undefined', 'null'].includes(valuesType)) {
                    const value = newIndexValue // since the types are equal, its the same as oldIndexValue

                    const formattedValue = {
                        status: 'UnChanged' as const,
                        value,
                        index
                    }

                    merged.push(formattedValue)
                } else if (['string', 'number', 'bigint', 'boolean'].includes(valuesType)) {
                    const oldIndexValueWithType = oldIndexValue as string | number | bigint | boolean
                    const newIndexValueWithType = newIndexValue as string | number | bigint | boolean
                    if (oldIndexValueWithType !== newIndexValueWithType) {
                        // the values are not equal, it means new one takes the old one's place
                        const deletedFormattedValue = {
                            status: 'Deleted' as const,
                            value: oldIndexValueWithType,
                            index
                        }

                        const addedFormattedValue = {
                            status: 'Added' as const,
                            value: newIndexValueWithType,
                            index
                        }

                        merged.push(deletedFormattedValue)
                        merged.push(addedFormattedValue)
                    } else {
                        // the values are equal, its the same as oldIndexValue
                        const formattedValue = {
                            status: 'UnChanged' as const,
                            value: newIndexValue,
                            index
                        }

                        merged.push(formattedValue)
                    }
                } else if (valuesType === 'date') {
                    const oldIndexValueWithType = oldIndexValue as Date
                    const newIndexValueWithType = newIndexValue as Date
                    if (oldIndexValueWithType.getTime() !== newIndexValueWithType.getTime()) {
                        // the values are not equal, it means new one takes the old one's place
                        const deletedFormattedValue = {
                            status: 'Deleted' as const,
                            value: oldIndexValueWithType,
                            index
                        }

                        const addedFormattedValue = {
                            status: 'Added' as const,
                            value: newIndexValueWithType,
                            index
                        }

                        merged.push(deletedFormattedValue)
                        merged.push(addedFormattedValue)
                    } else {
                        // the values are equal, its the same as oldIndexValue
                        const formattedValue = {
                            status: 'UnChanged' as const,
                            value: newIndexValue,
                            index
                        }

                        merged.push(formattedValue)
                    }
                } else if (valuesType === 'array') {
                    const oldIndexValueWithType = oldIndexValue as TArrayType
                    const newIndexValueWithType = newIndexValue as TArrayType
                    const mergedInnerArray = arrayVisualizer(oldIndexValueWithType, newIndexValueWithType)

                    // the values are equal, its the same as oldIndexValue
                    const formattedValue = {
                        status: 'Unknown' as const,
                        value: mergedInnerArray,
                        index
                    }

                    merged.push(formattedValue)
                } else if (valuesType === 'object') {
                    const oldIndexValueWithType = oldIndexValue as TObjectType
                    const newIndexValueWithType = newIndexValue as TObjectType
                    const mergedInnerObject = objectVisualizer(oldIndexValueWithType, newIndexValueWithType)

                    // the values are equal, its the same as oldIndexValue
                    const formattedValue = {
                        status: 'UnknownObj' as const,
                        value: { ...mergedInnerObject },
                        index
                    }

                    merged.push(formattedValue)
                } else {
                    // It means the type is neither function or symbol
                    if (JSON.stringify(oldIndexValue) !== JSON.stringify(newIndexValue)) {
                        // the values are not equal, it means new one takes the old one's place
                        const deletedFormattedValue = {
                            status: 'Deleted' as const,
                            value: oldIndexValue,
                            index
                        }

                        const addedFormattedValue = {
                            status: 'Added' as const,
                            value: newIndexValue,
                            index
                        }

                        merged.push(deletedFormattedValue)
                        merged.push(addedFormattedValue)
                    } else {
                        // the values are equal, its the same as oldIndexValue
                        const formattedValue = {
                            status: 'UnChanged' as const,
                            value: newIndexValue,
                            index
                        }

                        merged.push(formattedValue)
                    }
                }
            }
        }
    }

    return merged
}

export const isValidJSON = (str: string) => {
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}