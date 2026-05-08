export type CustomerTag = {
    id: number
    name: string
    isActive: boolean
    createdAt: string
    createdBy?: number
    updatedAt?: string
    updatedBy?: number
}

export type CustomerType = {
    id: number
    shopId: number
    name: string
    phone: string
    isActive: boolean
    tags: CustomerTag[]
    createdAt: string
    createdBy: string
}