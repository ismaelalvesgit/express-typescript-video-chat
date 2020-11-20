interface RequestFile{
    typeUpload: "single" | "multiple"
    files: Array<{field: string, path:string}>
}

export default RequestFile