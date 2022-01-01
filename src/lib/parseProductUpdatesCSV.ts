import { parse, ParseStepResult } from 'papaparse'
import { SupaProduct } from '../types/SupaTypes'

const KNOWN_HEADERS: string[] = [
  'unf',
  'upc_code',
  'plu',
  'ws_price',
  'u_price',
  'name',
  'description_edit',
  'no_backorder',
  'featured',
  'count_on_hand'
]
const HEADER_MAP: { [index: string]: string } = {
  'UPC Code': 'upc_code',
  'Long Name': 'name',
  'W/S Price': 'ws_price',
  'U Price': 'u_price',
  UNFI: 'unf',
  UPCPLU: 'upc_code',
  Price: 'ws_price',
  UnitCost: 'u_price',
  'Item Number': 'unf'
}

function transformHeader(header: string, index: number): string {
  if (HEADER_MAP[header]) {
    return HEADER_MAP[header]
  }
  return KNOWN_HEADERS.includes(header.toLowerCase())
    ? header.toLowerCase()
    : ''
}

function transform(value: string, field: string | number): any {
  return value.trim()
}

function step(props: {
  row: ParseStepResult<any>

  products: SupaProduct[]
  problems: string[]
}): void {
  const { row, products, problems } = props
  const { data, errors } = row

  if (errors.length) {
    console.warn('onoz! parse step errors:', errors)
    return
  }

  try {
    if (data['unf'] === '' && data['upc_code'] === '' && data['plu'] === '') {
      console.warn('no unf, upc_code, or plu!')
      problems.push(`error processing row: no unf, upc_code, or plu found.`)
      return
    }
    if (!Object.values(data).filter(String).length) {
      console.warn(
        'parseProductsUpdatesCSV row was empty?! prolly no big deal... row:',
        row
      )
      return
    }

    // there could probably be a better way to pull out known Product properties
    const {
      unf,
      upc_code: orig_upc_code,
      plu,
      name,
      description_edit,
      count_on_hand
    } = data

    const upc_code: string = orig_upc_code
      ? orig_upc_code.replace(/-/g, '')
      : orig_upc_code // strip dashes (-) from upc_code

    const product: SupaProduct = {
      id: `${unf ? unf : ''}__${upc_code ? upc_code : ''}`, // "natural" pk
      unf,
      upc_code,
      plu,
      name,
      description_edit,
      count_on_hand
    }

    // WS_PRICE
    const ws_price =
      data['ws_price'] && data['ws_price'].replace('$', '').replace(',', '')

    if (!isNaN(parseFloat(ws_price))) {
      product.ws_price = parseFloat(ws_price)
    }

    // U_PRICE
    const u_price =
      data['u_price'] && data['u_price'].replace('$', '').replace(',', '')

    if (!isNaN(parseFloat(u_price))) {
      product.u_price = parseFloat(u_price)
    }

    if (data['no_backorder'] !== undefined && data['no_backorder'].length) {
      // no_backorder is BOOLEAN type
      product.no_backorder =
        data['no_backorder'] === 'FALSE' ? false : !!data['no_backorder']
    }

    if (data['featured'] !== undefined && data['featured'].length) {
      // featured is BOOLEAN type
      product.featured =
        data['featured'] === 'FALSE' ? false : !!data['featured']
    }

    products.push(
      Object.entries(product).reduce((acc, entry) => {
        const key = entry[0]
        const v = entry[1]
        if (key && v !== undefined && v !== null) {
          acc[key] = v
        }

        return acc
      }, {} as { [index: string]: any }) as SupaProduct
    )
  } catch (e) {
    problems.push(
      `error (${e}) processing row: unf: ${data['unf']} upc_code: ${data['upc_code']}, name: ${data['name']}, description: ${data['description']}`
    )
  }
}

interface IParseProductsCSV {
  products: SupaProduct[]
  problems: string[]
}

export default function parseProductUpdatesCSV(
  file: File
): Promise<IParseProductsCSV> {
  const products: SupaProduct[] = []
  const problems: string[] = []

  return new Promise((resolve, reject) => {
    // any cuz getting tsc is squaks: Argument of type 'File' is not assignable to parameter of type 'unique symbol'
    parse(file as any, {
      complete: () => resolve({ products, problems }),
      error: reject,
      skipEmptyLines: 'greedy',
      header: true,
      transformHeader,
      transform,
      step: (row) =>
        step({
          row,
          products,
          problems
        })
    })
  })
}
