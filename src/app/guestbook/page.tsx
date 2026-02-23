'use client'

import { motion } from 'motion/react'
import GiscusBoard from '@/components/giscus-board'

export default function GuestbookPage() {
    return (
        <div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
            <div className='w-full max-w-[800px]'>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-12 text-center'>
                    <h1 className='mb-4 text-4xl font-bold'>留言板</h1>
                    <p className='text-secondary text-lg'>欢迎来到我的小站，有什么想说的都可以在这里留言。</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                    <GiscusBoard />
                </motion.div>
            </div>
        </div>
    )
}
