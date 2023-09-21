import { Deta } from 'deta'
import { nanoid } from "nanoid"

export * from '../../src/db/types.js'

const deta = Deta()

export const chats = deta.Base('chats')
export const prompts = deta.Base('prompts')
export const messages = deta.Base('messages')
export const settings = deta.Base('settings')

export const generateKey = (ascending = true) => {
    const maxDateNowValue = 8.64e15 
	const timestamp = ascending ? Date.now() : maxDateNowValue - Date.now()

	return `${ timestamp.toString(16) }${ nanoid(5) }`
}