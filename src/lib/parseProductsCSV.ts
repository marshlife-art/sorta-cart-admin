import { parse, ParseStepResult } from 'papaparse'
import { SupaProduct } from '../types/SupaTypes'

const CODE_COLZ = [
  'a',
  'r',
  'c',
  'l',
  'd',
  'f',
  'g',
  'v',
  'w',
  'y',
  'k',
  'ft',
  'm',
  'og',
  's',
  'n'
]

const PRODUCT_KEYS: Array<keyof SupaProduct> = [
  'unf',
  'upc_code',
  'name',
  'description',
  'pk',
  'size',
  'unit_type',
  'ws_price',
  'u_price',
  'category',
  'sub_category',
  'no_backorder',
  'codes'
]

const KNOWN_HEADERS: string[] = [
  'ws_price_markup',
  'u_price_markup',
  ...PRODUCT_KEYS,
  ...CODE_COLZ
]

const HEADER_MAP: { [index: string]: string } = {
  'UPC Code': 'upc_code',
  'Long Name': 'name',
  'Advertising Description': 'description',
  'Unit Type': 'unit_type',
  M: '',
  'W/S Price': 'ws_price',
  'U Price': 'u_price',
  'Category Description': 'sub_category'
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
  import_tag: string
  vendor: string
  markup: number
  cat: string
  results: any[]
  products: SupaProduct[]
  problems: string[]
}): void {
  const { row, import_tag, vendor, markup, results, products, problems } = props
  let cat = props.cat
  const { data, errors } = row

  if (errors.length) {
    console.warn('onoz! parse step errors:', errors)
    return
  }

  try {
    if (
      data['upc_code'] === '' &&
      data['name'] === '' &&
      data['description'] === '' &&
      data['unf']
    ) {
      // if the first and only field is something, then it's probably a category.
      cat = data['unf']
      return
    }
    if (!Object.values(data).filter(String).length) {
      console.warn('parseProductsCSV row was empty?! row:', row)
      return
    }

    // there could probably be a better way to pull out known Product properties
    const { unf, upc_code, name, description, size, unit_type, sub_category } =
      data
    let product: SupaProduct = {
      id: 666, // #TODO: use unf & upc_code composite keyz
      unf,
      upc_code,
      name,
      description,
      size,
      unit_type,
      sub_category
    }

    product.category = data['category'] || cat

    // aggregate codes cols into single col
    let codes: string[] = []

    CODE_COLZ.forEach((code) => {
      if (data[code]) {
        codes.push(data[code])
      }
    })
    if (data['codes']) {
      product.codes = [
        ...data['codes'].split(',').map((s: string) => s.trim()),
        ...codes
      ].join(', ')
    } else {
      product.codes = codes.join(', ')
    }

    // WS_PRICE && MARKUPZ
    const ws_price =
      data['ws_price'] && data['ws_price'].replace('$', '').replace(',', '')

    product.ws_price =
      ws_price && !isNaN(parseFloat(ws_price)) ? parseFloat(ws_price) : 0
    if (product.ws_price === 0) {
      throw 'ws_price is 0!'
    }

    // in the database we track ws_price_cost instead of _markup so switch those around:
    product.ws_price_cost = product.ws_price

    const _ws_price_markup =
      data['ws_price_markup'] &&
      data['ws_price_markup'].replace('$', '').replace(',', '')

    const ws_price_markup =
      _ws_price_markup && !isNaN(parseFloat(_ws_price_markup))
        ? parseFloat(_ws_price_markup)
        : 0

    // so then if there's no ws_price_markup specified, apply the global markup.
    if (ws_price_markup === 0) {
      product.ws_price = parseFloat(
        (product.ws_price + product.ws_price * markup).toFixed(2)
      )
    } else {
      product.ws_price = ws_price_markup
    }

    // U_PRICE && MARKUPZ
    const u_price =
      data['u_price'] && data['u_price'].replace('$', '').replace(',', '')

    product.u_price =
      u_price && !isNaN(parseFloat(u_price)) ? parseFloat(u_price) : 0
    if (product.u_price === 0) {
      throw 'u_price is 0!'
    }

    // in the database we track ws_price_cost instead of _markup so switch those around:
    product.u_price_cost = product.u_price

    const _u_price_markup =
      data['u_price_markup'] &&
      data['u_price_markup'].replace('$', '').replace(',', '')

    const u_price_markup =
      _u_price_markup && !isNaN(parseFloat(_u_price_markup))
        ? parseFloat(_u_price_markup)
        : 0

    // ...so then if there's no u_price_markup specified, apply the global markup.
    if (u_price_markup === 0) {
      product.u_price = parseFloat(
        (product.u_price + product.u_price * markup).toFixed(2)
      )
    } else {
      product.u_price = u_price_markup
    }

    const pk = data['pk'] && data['pk'].replace(',', '')
    product.pk = pk && !isNaN(parseInt(pk)) ? parseInt(pk) : 1 // i guess default 1 makes sense here

    // no_backorder is BOOLEAN type
    product.no_backorder =
      data['no_backorder'] === 'FALSE' ? false : !!data['no_backorder']

    product.import_tag = import_tag
    product.vendor = vendor
    results.push(data)
    products.push(product)
  } catch (e) {
    problems.push(
      `error (${e}) processing row: unf: ${data['unf']} upc_code: ${data['upc_code']}, name: ${data['name']}, description: ${data['description']}`
    )
  }
}

export default function parseProductsCSV(
  file: File,
  import_tag: string = `import${Date.now()}`,
  vendor: string = 'default',
  markup: number = 0.0
) {
  // mutable cat here because vendor sheets sometimes have categories as their own row
  // so need a value that can persist across per-row step() fn
  let cat: string = ''
  // this probably should be Product[]
  const results: any[] = []
  const products: SupaProduct[] = []
  const problems: string[] = []

  return new Promise((resolve, reject) => {
    // any cuz getting tsc is squaks: Argument of type 'File' is not assignable to parameter of type 'unique symbol'
    parse(file as any, {
      complete: () => resolve({ results, products, problems }),
      error: reject,
      skipEmptyLines: 'greedy',
      header: true,
      transformHeader,
      transform,
      step: (row) =>
        step({
          row,
          import_tag,
          vendor,
          markup,
          cat,
          results,
          products,
          problems
        })
    })
  })
}
