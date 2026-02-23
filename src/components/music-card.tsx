'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

type PlayMode = 'sequence' | 'random' | 'loop'

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard

	const musicList = (siteContent as any).musicList || [
		{
			name: 'Close To You',
			artist: 'Carpenters',
			url: '/music/close-to-you.mp3'
		}
	]

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [playMode, setPlayMode] = useState<PlayMode>('sequence')
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentIndexRef = useRef(0)

	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		// If not on home page, always position at bottom-right corner when playing
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}

		// Default position on home page
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [isHomePage, center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	const { x, y } = position

	const skipToNext = () => {
		let nextIndex = currentIndex
		if (playMode === 'random') {
			nextIndex = Math.floor(Math.random() * musicList.length)
		} else {
			nextIndex = (currentIndex + 1) % musicList.length
		}
		setCurrentIndex(nextIndex)
		setIsPlaying(true)
	}

	const skipToPrevious = () => {
		let nextIndex = (currentIndex - 1 + musicList.length) % musicList.length
		setCurrentIndex(nextIndex)
		setIsPlaying(true)
	}

	const togglePlayMode = () => {
		const modes: PlayMode[] = ['sequence', 'random', 'loop']
		const nextMode = modes[(modes.indexOf(playMode) + 1) % modes.length]
		setPlayMode(nextMode)
	}

	// Initialize audio element
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio()
		}

		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
		}

		const handleEnded = () => {
			if (playMode === 'loop') {
				audio.currentTime = 0
				audio.play().catch(console.error)
			} else {
				skipToNext()
			}
		}

		const handleTimeUpdate = () => {
			updateProgress()
		}

		const handleLoadedMetadata = () => {
			updateProgress()
		}

		audio.addEventListener('timeupdate', handleTimeUpdate)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', handleLoadedMetadata)

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
		}
	}, [playMode, musicList.length])

	// Handle currentIndex change - load new audio
	useEffect(() => {
		currentIndexRef.current = currentIndex
		if (audioRef.current) {
			const wasPlaying = !audioRef.current.paused || isPlaying
			audioRef.current.pause()
			audioRef.current.src = musicList[currentIndex].url
			audioRef.current.loop = false
			setProgress(0)

			if (wasPlaying) {
				audioRef.current.play().catch(console.error)
				setIsPlaying(true)
			}
		}
	}, [currentIndex])

	// Handle play/pause state change
	useEffect(() => {
		if (!audioRef.current) return

		if (isPlaying) {
			audioRef.current.play().catch(console.error)
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying])

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])

	const togglePlayPause = () => {
		setIsPlaying(!isPlaying)
	}

	const currentMusic = musicList[currentIndex]

	// Hide component if not on home page and not playing
	if (!isHomePage && !isPlaying) {
		return null
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className={clsx('flex items-center gap-3', !isHomePage && 'fixed')}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-10.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
						/>
						<img
							src='/images/christmas/snow-11.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<div className='group relative flex h-8 w-8 items-center justify-center' onClick={togglePlayMode}>
					<MusicSVG className={clsx('h-8 w-8 transition-opacity', isPlaying && 'animate-spin-slow')} />
					<div className='bg-card absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100'>
						{playMode === 'sequence' && <Repeat className='text-brand h-4 w-4' />}
						{playMode === 'random' && <Shuffle className='text-brand h-4 w-4' />}
						{playMode === 'loop' && <Repeat1 className='text-brand h-4 w-4' />}
					</div>
				</div>

				<div className='flex-1 overflow-hidden'>
					<div className='flex items-center gap-2'>
						<div className='text-secondary truncate text-sm font-medium'>{currentMusic.name}</div>
						<div className='text-secondary/60 truncate text-xs'>- {currentMusic.artist}</div>
					</div>

					<div className='mt-1.5 h-1.5 rounded-full bg-white/40'>
						<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
					</div>
				</div>

				<div className='flex items-center gap-1'>
					<button onClick={skipToPrevious} className='text-secondary hover:text-brand transition-colors max-sm:hidden'>
						<SkipBack className='h-4 w-4' />
					</button>

					<button
						onClick={togglePlayPause}
						className='flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition-all hover:scale-105 active:scale-95'>
						{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
					</button>

					<button onClick={skipToNext} className='text-secondary hover:text-brand transition-colors'>
						<SkipForward className='h-4 w-4' />
					</button>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
