
import {
	LocalStorage,
	SessionStorage
} from 'quasar'

const prefix = 'csc_'

export function setLocal (name, value) {
	LocalStorage.set(prefix + name, value)
}

export function hasLocal (name) {
	return LocalStorage.has(prefix + name)
}

export function getLocal (name) {
	return LocalStorage.getItem(prefix + name)
}

export function deleteLocal (name) {
	LocalStorage.remove(prefix + name)
}

export function setSession (name, value) {
	SessionStorage.set(prefix + name, value)
}

export function hasSession (name) {
	return SessionStorage.has(prefix + name)
}

export function getSession (name) {
	return SessionStorage.getItem(prefix + name)
}

export function deleteSession (name) {
	SessionStorage.remove(prefix + name)
}
