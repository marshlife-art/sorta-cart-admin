import { parse, ParseStepResult } from 'papaparse'

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

const KNOWN_HEADERS = [
  'unf',
  'upc_code',
  'name',
  'description',
  'pk',
  'size',
  'unit_type',
  'ws_price',
  'u_price',
  'ws_price_markup',
  'u_price_markup',
  'category',
  'sub_category',
  'no_backorder',
  'codes',
  ...CODE_COLZ
]

const HEADER_MAP: { [index: string]: string | null } = {
  'UPC Code': 'upc_code',
  'Long Name': 'name',
  'Advertising Description': 'description',
  'Unit Type': 'unit_type',
  M: null,
  'W/S Price': 'ws_price',
  'U Price': 'u_price',
  'Category Description': 'sub_category'
}

function transformHeader(header: string, index: number): string {
  if (HEADER_MAP[header]) {
    return HEADER_MAP[header] || ''
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
  problems: string[]
}): void {
  const { row, import_tag, vendor, markup, results, problems } = props
  let cat = props.cat
  console.log('zomg step results:', row)

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
    } else if (Object.values(data).filter(String).length) {
      data['category'] = data['category'] || cat

      // aggregate codes cols into single col
      let codes: string[] = []

      CODE_COLZ.forEach((code) => {
        if (data[code]) {
          codes.push(data[code])
        }
        delete data[code]
      })
      if (data['codes']) {
        data['codes'] = [
          ...data['codes'].split(',').map((s: string) => s.trim()),
          ...codes
        ].join(', ')
      } else {
        data['codes'] = codes.join(', ')
      }

      // WS_PRICE && MARKUPZ
      const ws_price =
        data['ws_price'] && data['ws_price'].replace('$', '').replace(',', '')

      data['ws_price'] =
        ws_price && !isNaN(parseFloat(ws_price)) ? parseFloat(ws_price) : 0
      if (data['ws_price'] === 0) {
        throw 'ws_price is 0!'
      }
      // in the database we track ws_price_cost instead of _markup so switch those around:
      data['ws_price_cost'] = data['ws_price']

      const ws_price_markup =
        data['ws_price_markup'] &&
        data['ws_price_markup'].replace('$', '').replace(',', '')

      data['ws_price_markup'] =
        ws_price_markup && !isNaN(parseFloat(ws_price_markup))
          ? parseFloat(ws_price_markup)
          : 0

      // so then if there's no ws_price_markup specified, apply the global markup.
      if (data['ws_price_markup'] === 0) {
        data['ws_price_markup'] = data['ws_price'] + data['ws_price'] * markup
        data['ws_price'] = data['ws_price'] + data['ws_price'] * markup
      } else {
        data['ws_price'] = data['ws_price_markup']
      }

      delete data['ws_price_markup']

      // U_PRICE && MARKUPZ
      const u_price =
        data['u_price'] && data['u_price'].replace('$', '').replace(',', '')

      data['u_price'] =
        u_price && !isNaN(parseFloat(u_price)) ? parseFloat(u_price) : 0
      if (data['u_price'] === 0) {
        throw 'u_price is 0!'
      }
      // in the database we track ws_price_cost instead of _markup so switch those around:
      data['u_price_cost'] = data['u_price']

      const u_price_markup =
        data['u_price_markup'] &&
        data['u_price_markup'].replace('$', '').replace(',', '')

      data['u_price_markup'] =
        u_price_markup && !isNaN(parseFloat(u_price_markup))
          ? parseFloat(u_price_markup)
          : 0
      // ...so then if there's no u_price_markup specified, apply the global markup.
      if (data['u_price_markup'] === 0) {
        data['u_price_markup'] = data['u_price'] + data['u_price'] * markup
        data['u_price'] = data['u_price'] + data['u_price'] * markup
      } else {
        data['u_price'] = data['u_price_markup']
      }

      delete data['u_price_markup']

      const pk = data['pk'] && data['pk'].replace(',', '')
      data['pk'] = pk && !isNaN(parseInt(pk)) ? parseInt(pk) : 1 // i guess default 1 makes sense here

      // no_backorder is BOOLEAN type
      data['no_backorder'] =
        data['no_backorder'] === 'FALSE' ? false : !!data['no_backorder']

      data['import_tag'] = import_tag
      data['vendor'] = vendor
      results.push(data)
    }
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
  let cat: string = ''
  const results: any[] = []
  const problems: string[] = []

  return new Promise((resolve, reject) => {
    // any cuz getting error: Argument of type 'File' is not assignable to parameter of type 'unique symbol'
    parse(file as any, {
      complete: () => resolve({ results, problems }),
      error: reject,
      header: true,
      transformHeader,
      transform,
      step: (row) =>
        step({ row, import_tag, vendor, markup, cat, results, problems })
    })
  })
}
