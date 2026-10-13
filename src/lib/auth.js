const KEY = 'ka_auth'
const USER = 'kollegeapply'
const PASS = 'kollegeapply@1234'
export const isAuthed = () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return false } }
export const login = (u, p) => { if (u.trim() === USER && p === PASS) { try { sessionStorage.setItem(KEY, '1') } catch {} return true } return false }
export const logout = () => { try { sessionStorage.removeItem(KEY) } catch {} }
