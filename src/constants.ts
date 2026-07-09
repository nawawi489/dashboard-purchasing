export const OUTLETS = [
  'Pizza Nyantuy Sungai Poso',
  'Pizza Nyantuy Gowa',
  'Pizza Nyantuy Sudiang',
  'Pizza Nyantuy Barombong',
  'Pizza Nyantuy Limbung',
  'Pizza Nyantuy Pare-Pare',
  'Pizza Nyantuy Tamalate',
  'Back Office'
] as const

export type OutletName = typeof OUTLETS[number]
