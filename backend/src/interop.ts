import { fetchFn } from "deta-space-client"
import { AppAction } from "./types"

export const useInterop = (token?: string) => {
    const authToken = token || process.env.SPACE_ACCESS_TOKEN || ''
    const fetch = fetchFn(authToken)

    const request = async (path: string, body?: any, method = 'GET') => {
        const res = await fetch(path, {
            method,
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        return res.json()
    }

    const listActions = async () => {
        const data = await request('/actions')
        return data.actions as AppAction[]
    }

    const invokeAction = async (instanceId: string, actionName: string, payload?: any) => {
        const data = await request(`/actions/${instanceId}/${actionName}`, payload, 'POST')
        return data
    }

    return {
        request,
        listActions,
        invokeAction,
        isSetup: !!authToken
    }
}
