export type LineItem = {
  name: string
  unit: string
  quantity: number
  price?: number
  supplier?: string
  phone?: string
}

export type PRPayload = {
  date: string
  outlet: string
  items: LineItem[]
}

