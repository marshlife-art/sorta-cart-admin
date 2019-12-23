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
  import_tag?: string
  vendor: string
}
