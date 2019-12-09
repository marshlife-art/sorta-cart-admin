const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb: () => void) {
    this.isAuthenticated = true
    setTimeout(cb, 100)
  },
  signout(cb: () => void) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}

export { fakeAuth }
