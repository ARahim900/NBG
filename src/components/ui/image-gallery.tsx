import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AspectRatio } from '@/components/ui/aspect-ratio'

export interface GalleryImage {
  id: string
  src: string
  fullSrc: string
  alt: string
  width: number
  height: number
}

interface ImageGalleryProps {
  images: GalleryImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const close = useCallback(() => setSelected(null), [])

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3" aria-label="Gallery photographs">
        {images.map((image, index) => (
          <AnimatedImage key={image.id} image={image} index={index} onOpen={() => setSelected(index)} />
        ))}
      </div>
      {selected !== null && (
        <GalleryViewer images={images} index={selected} onChange={setSelected} onClose={close} />
      )}
    </>
  )
}

function AnimatedImage({ image, index, onOpen }: { image: GalleryImage; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '120px' })
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const visible = status === 'ready' && (inView || reduceMotion)

  return (
    <div className="mb-5 break-inside-avoid">
      <button type="button" onClick={onOpen} disabled={status === 'error'}
        aria-label={`Enlarge photo ${index + 1}: ${image.alt}`}
        className="group relative block w-full overflow-hidden rounded-xl border border-[#A4C5BB]/50 bg-[#A4C5BB]/10 text-[#4E4456] shadow-sm outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#4E4456] focus-visible:ring-offset-4 dark:focus-visible:ring-[#A4C5BB]">
        <AspectRatio ref={ref} ratio={image.width / image.height}>
          {status === 'loading' && <span className="absolute inset-0 animate-pulse bg-[#A4C5BB]/15 motion-reduce:animate-none" aria-hidden="true" />}
          {status === 'error' ? (
            <span role="status" className="flex h-full flex-col items-center justify-center gap-2 p-4 text-sm dark:text-[#A4C5BB]">
              <ImageOff className="h-6 w-6" aria-hidden="true" />Photo unavailable
            </span>
          ) : (
            <img src={image.src} alt={image.alt} width={image.width} height={image.height}
              loading={index < 3 ? 'eager' : 'lazy'} decoding="async"
              className={cn('h-full w-full object-contain opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none', visible && 'opacity-100')}
              onLoad={() => setStatus('ready')}
              onError={() => { setStatus('error'); console.error('Gallery image failed to load:', image.src) }} />
          )}
        </AspectRatio>
        {status === 'ready' && (
          <span aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#4E4456] p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
            <Maximize2 className="h-4 w-4" />
          </span>
        )}
      </button>
    </div>
  )
}

function GalleryViewer({ images, index, onChange, onClose }: {
  images: GalleryImage[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const image = images[index]

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      trigger?.focus()
    }
  }, [])

  return (
    <dialog ref={ref} aria-labelledby="gallery-viewer-title" aria-describedby="gallery-viewer-caption"
      onCancel={onClose} onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' && index > 0) { event.preventDefault(); onChange(index - 1) }
        if (event.key === 'ArrowRight' && index < images.length - 1) { event.preventDefault(); onChange(index + 1) }
      }}
      className="fixed inset-0 m-auto max-h-[94dvh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border border-[#A4C5BB]/50 bg-surface p-0 text-ink shadow-2xl backdrop:bg-[#4E4456]/85">
      <div className="flex items-center justify-between gap-4 border-b border-[#A4C5BB]/30 px-4 py-3">
        <h2 id="gallery-viewer-title" className="text-sm font-semibold">Photo {index + 1} of {images.length}</h2>
        <button type="button" autoFocus onClick={onClose} aria-label="Close photograph"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-[#A4C5BB]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A4C5BB]">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {failedSource === image.fullSrc ? (
        <p role="alert" className="p-12 text-center">This photograph could not be loaded.</p>
      ) : (
        <img key={image.id} src={image.fullSrc} alt={image.alt} width={image.width} height={image.height}
          className="mx-auto h-[min(65dvh,760px)] w-full object-contain"
          onError={() => { setFailedSource(image.fullSrc); console.error('Gallery preview failed to load:', image.fullSrc) }} />
      )}
      <div className="flex items-center justify-between gap-3 border-t border-[#A4C5BB]/30 p-3">
        <button type="button" onClick={() => onChange(index - 1)} disabled={index === 0} aria-label="Previous photograph"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A4C5BB]/20 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A4C5BB]">
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p id="gallery-viewer-caption" className="text-center text-xs sm:text-sm">{image.alt}</p>
        <button type="button" onClick={() => onChange(index + 1)} disabled={index === images.length - 1} aria-label="Next photograph"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#A4C5BB]/20 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#A4C5BB]">
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </dialog>
  )
}
