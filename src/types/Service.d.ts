interface ServiceInit {
  status: 'init'
}

interface ServiceLoading {
  status: 'loading'
}

interface ServiceLoaded<T> {
  status: 'loaded'
  payload: T
}

interface ServiceSaved<T> {
  status: 'saved'
  payload: T
}

interface ServiceError {
  status: 'error'
  error: Error
}

export type Service<T> =
  | ServiceInit
  | ServiceLoading
  | ServiceLoaded<T>
  | ServiceSaved<T>
  | ServiceError
