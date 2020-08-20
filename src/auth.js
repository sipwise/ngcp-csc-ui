
import {
	getLocal,
	setLocal,
	deleteLocal
} from 'src/storage'

export function getJwt () {
	return getLocal('jwt')
}

export function hasJwt () {
	return getJwt() !== null
}

export function setJwt (jwt) {
	setLocal('jwt', jwt)
}

export function deleteJwt () {
	deleteLocal('jwt')
	deleteLocal('subscriberId')
}

export function setSubscriberId (subscriberId) {
	setLocal('subscriberId', subscriberId)
}

export function getSubscriberId () {
	return getLocal('subscriberId')
}
