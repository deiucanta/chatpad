import express from 'express'
import { CardType, createActions, Inputs } from 'deta-space-actions'

import { chats, messages, prompts, settings, generateKey } from './db.js'
import type { Chat, Prompt, Settings } from './db.js'
import { createChatWithMessage } from './openai.js'

const app = express()
const actions = createActions()

const domain = process.env.DETA_SPACE_APP_HOSTNAME

app.use(express.json())

app.get('/public/chats/:key', async (req, res) => {
    const key = req.params.key

    const chat = await chats.get(key)
    if (!chat || !chat.shared) {
        return res.status(404).json({ message: 'Chat not found' })
    }

    res.json(chat)
})

app.get('/public/chats/:key/messages', async (req, res) => {
    const key = req.params.key

    const chat = await chats.get(key)
    if (!chat || !chat.shared) {
        return res.status(404).json({ message: 'Chat not found' })
    }

    const items = await messages.fetch({ chatId: key }, { desc: false })   
    res.json(items)
})

actions.add<{ prompt?: string }>({
	name: 'create_chat',
	title: 'Create Chat',
	input: [
        Inputs('prompt').String().Optional()
    ],
    card: CardType.DETAIL,
	handler: async (event) => {
		console.log(`Creating new chat`)

        const { prompt: promptName } = event

        let prompt
        if (promptName) {
            const { items } = await prompts.fetch({ title: promptName })
            prompt = items[0]
            if (!prompt) {
                return {
                    title: 'Prompt not found',
                    description: 'Please try again with a valid prompt key',
                }
            }
        }
        
		const chat = await chats.put({
            description: "New Chat",
            ...(prompt ? {
                prompt: prompt.key,
                writingInstructions: prompt.content,
                writingCharacter: prompt.writingCharacter,
                writingTone: prompt.writingTone,
                writingStyle: prompt.writingStyle,
                writingFormat: prompt.writingFormat,
            } : {}),
            totalTokens: 0,
            private: false,
            createdAt: new Date().toISOString(),
        }, generateKey())

        if (!chat) {
            return {
                title: 'Error creating chat',
                description: 'Please try again',
            }
        }

		return {
            title: chat?.description,
            url: `https://${ domain }/chats/${ chat?.key }`
        }
	}
})

actions.add<{ prompt?: string, message: string }>({
	name: 'run_prompt',
	title: 'Get Chat Response',
	input: [
        Inputs('message').String(),
        Inputs('prompt').String().Optional()
    ],
    card: CardType.DETAIL,
	handler: async (event) => {
        const { prompt: promptName, message } = event

        let prompt
        if (promptName) {
            console.log(`Checking if prompt exists`)
            const { items } = await prompts.fetch({ title: promptName })
            prompt = items[0] as unknown as Prompt
            if (!prompt) {
                console.log(`Prompt not found`)
            }
        }

        console.log(`Creating new chat`)
		const chatRes = await chats.put({
            description: "New Chat",
            ...(prompt ? {
                prompt: prompt.key,
                writingInstructions: prompt.content,
                writingCharacter: prompt.writingCharacter,
                writingTone: prompt.writingTone,
                writingStyle: prompt.writingStyle,
                writingFormat: prompt.writingFormat,
            } : {
                writingInstructions: promptName,
            }),
            totalTokens: 0,
            private: false,
            createdAt: new Date().toISOString(),
        }, generateKey())

        if (!chatRes) {
            return {
                title: 'Error creating chat',
                description: 'Please try again',
            }
        }

        let chat = (chatRes as unknown as Chat)

        const config = (await settings.get('general')) as unknown as Settings;

        console.log(`Generating chat response`)
        const response = await createChatWithMessage(chat, config, message, prompt)

        console.log('response:', response)

        chat = (await chats.get(chat?.key)) as unknown as Chat

		return {
            title: chat?.description,
            text: response,
            url: `http://localhost:4200/chats/${ chat?.key }`
        }
	}
})

actions.add({
	name: 'list_chats',
	title: 'List Chats',
	input: [],
    card: CardType.LIST,
	handler: async () => {
		console.log(`Getting all chats`)
		const { items } = await chats.fetch({})

		return {
            items: items.map((chat) => ({
                title: chat.description,
                url: `https://${ domain }/chats/${ chat.key }`,
                card: {
                    type: '@deta/detail',
                    data: {
                        title: chat.description,
                        ref: `https://${ domain }/chats/${ chat.key }`,
                        url: `https://${ domain }/chats/${ chat.key }`,
                    }
                }
            }))
        }
	}
})

actions.add({
	name: 'list_prompts',
	title: 'List Prompts',
	input: [],
    card: CardType.LIST,
	handler: async () => {
		console.log(`Getting all prompts`)
		const { items } = await prompts.fetch({})

		return {
            items: items.map((prompt) => ({
                title: prompt.title,
                url: `https://${ domain }/chats/${ prompt.key }`,
            }))
        }
	}
})

app.use(actions.middleware)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})