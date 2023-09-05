import React, { useState } from 'react'

export function useChatScroll<T>(dep: T, elem = document.documentElement) {
    const [autoScroll, setAutoScroll] = useState(true)

    document.onscroll = () => {
        const scrollBottom = Math.floor(elem.scrollTop + elem.clientHeight)
        const val = scrollBottom >= elem.scrollHeight - 70
        
        setAutoScroll(val)
    }

    React.useEffect(() => {
        if (elem && autoScroll) {
            elem.scrollTop = elem.scrollHeight;
        }
    }, [dep, autoScroll]);

    return { autoScroll, setAutoScroll }
}