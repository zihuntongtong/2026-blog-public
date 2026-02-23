'use client'

import { useEffect, useRef } from 'react'
import { useConfigStore } from '@/app/(home)/stores/config-store'

export default function GiscusBoard() {
    const ref = useRef<HTMLDivElement>(null)
    const { siteContent } = useConfigStore()

    useEffect(() => {
        if (!ref.current || ref.current.hasChildNodes()) return

        const script = document.createElement('script')
        script.src = 'https://giscus.app/client.js'
        script.setAttribute('data-repo', 'zihuntongtong/2026-blog-public')
        script.setAttribute('data-repo-id', 'R_kgDORVndtg')
        script.setAttribute('data-category', 'General')
        script.setAttribute('data-category-id', 'DIC_kwDORVndts4C3Da2')
        script.setAttribute('data-mapping', 'pathname')
        script.setAttribute('data-strict', '0')
        script.setAttribute('data-reactions-enabled', '1')
        script.setAttribute('data-emit-metadata', '0')
        script.setAttribute('data-input-position', 'bottom')
        script.setAttribute('data-theme', 'preferred_color_scheme')
        script.setAttribute('data-lang', 'zh-CN')
        script.setAttribute('crossorigin', 'anonymous')
        script.async = true

        ref.current.appendChild(script)
    }, [])

    return (
        <div className='card mt-12 overflow-hidden p-6 max-sm:px-4'>
            <div ref={ref} />
        </div>
    )
}
