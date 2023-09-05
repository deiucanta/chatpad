import express from 'express'
import { Deta } from 'deta'

const app = express()
const deta = Deta()

const chats = deta.Base('chats')
const messages = deta.Base('messages')

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})