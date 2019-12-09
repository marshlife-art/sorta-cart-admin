// note: all these Preferences are persisted to localStorage,
// so: USE STRINGZ!
export interface Preferences {
  dark_mode: string
}

export interface PreferencesError {
  error: string
  reason: string
}
