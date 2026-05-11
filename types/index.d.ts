interface ResultCode {
  selectorName: string
  resultVal: string
}

interface ComputedResultCode {
  id: string
  selectorName: string
  resultVal: {
    id: string
    val: string
  }[]
}

interface TranslatorConfig {
  prefix?: string
  useAllDefaultValues?: boolean
  customTheme?: Record<string, Record<string, string>>
  arbitraryValueBrackets?: 'always' | 'smart' | 'never'
}

interface TranslatorConfigCopy extends Omit<TranslatorConfig, 'customTheme'> {
  customTheme: string
  wrapperTag: string
}