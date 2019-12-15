export interface Product {
  id: number
  unf?: string
  upc_code: string
  category: string
  sub_category: string
  name: string
  description: string
  pk: number
  size: string
  unit_type: string
  ws_price: string
  u_price?: string
  codes?: string
}

interface LineItemProps {
  product_id: number
  quantity: number
  selected_unit: string
  total: number
}

export type LineItem = Product & LineItemProps
