interface Options{
    basePath?:string
    skipLinks?: boolean
    query?:string
    url?: string
    page?: number
    pageSize?: number
    count?: number
    excludeFields?: Array<string>
}

export default Options