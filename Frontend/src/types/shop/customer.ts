export type CustomerTag = {
    id: number
    name: string
    isActive: boolean
    createdAt: string
    createdBy?: number
    updatedAt?: string
    updatedBy?: number
}

export type CustomerNoteType = {
    id?: number
    note: string
    createdAt?: string
    createdBy?: number | string
}

export type CustomerType = {
    id: number
    shopId: number
    name: string
    phone: string
    isActive: boolean
    tags?: CustomerTag[]
    notes?: CustomerNoteType[]
    createdAt: string
    createdBy: string
}