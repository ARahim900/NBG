import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, ImageOff, LoaderCircle, X } from 'lucide-react'
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
      <div role="group" className="columns-2 gap-3 md:gap-5 xl:columns-3" aria-label="Gallery photographs">
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
    <div className="mb-3 break-inside-avoid md:mb-5">
      <button type="button" onClick={onOpen} disabled={status === 'error'}
        aria-label={`Enlarge photo ${index + 1}: ${image.alt}`}
        className="group block w-full overflow-hidden rounded-xl border border-line/10 bg-surface text-left shadow-sm outline-none transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-azure focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transform-none motion-reduce:transition-none">
        <AspectRatio ref={ref} ratio={image.width / image.height} className="overflow-hidden bg-teal/10">
          {status === 'loading' && <span className="absolute inset-0 animate-pulse bg-teal/15 motion-reduce:animate-none" aria-hidden="true" />}
          {status === 'error' ? (
            <span role="status" className="flex h-full flex-col items-center justify-center gap-2 p-4 text-sm text-heading dark:text-glow">
              <ImageOff className="h-6 w-6" aria-hidden="true" />Photo unavailable
            </span>
          ) : (
            <img src={image.src} alt={image.alt} width={image.width} height={image.height}
              loading={index < 3 ? 'eager' : 'lazy'} decoding="async"
              className={cn('h-full w-full object-contain opacity-0 transition-opacity duration-500 ease-out motion-reduce:transition-none', visible && 'opacity-100')}
              onLoad={() => setStatus('ready')}
              onError={() => { setStatus('error'); console.error('Gallery image failed to load:', image.src) }} />
          )}
        </AspectRatio>
        <span aria-hidden="true" className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs text-heading dark:text-glow">
          <span className="font-medium tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
        </span>
      </button>
    </div>
  )
}

function ViewerImage({ image }: { image: GalleryImage }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <>
      <img src={image.src} alt="" aria-hidden="true" draggable={false}
        className="absolute inset-0 h-full w-full object-contain" />
      {status !== 'error' && (
        <img src={image.fullSrc} alt={image.alt} draggable={false}
          className={cn('absolute inset-0 h-full w-full object-contain transition-opacity duration-200 motion-reduce:transition-none', status === 'ready' ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setStatus('ready')}
          onError={() => { setStatus('error'); console.error('Gallery preview failed to load:', image.fullSrc) }} />
      )}
      {status === 'loading' && (
        <span role="status" className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy px-3 py-2 text-xs text-white">
          <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Loading photograph
        </span>
      )}
      {status === 'error' && (
        <span role="alert" className="absolute inset-x-3 bottom-3 rounded-lg bg-navy p-3 text-center text-sm text-white">
          Full-size photograph unavailable. Showing the preview.
        </span>
      )}
    </>
  )
}

function GalleryViewer({ images, index, onChange, onClose }: {
  images: GalleryImage[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const activeThumbnail = useRef<HTMLButtonElement>(null)
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()
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

  useEffect(() => {
    activeThumbnail.current?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'instant' : 'smooth' })
  }, [index, reduceMotion])

  const navigate = (next: number) => {
    if (next < 0 || next >= images.length || next === index) return
    setDirection(next > index ? 1 : -1)
    onChange(next)
  }
  const controlClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line/20 text-heading transition-colors hover:bg-teal/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-azure aria-disabled:opacity-30 dark:text-glow'

  return (
    <dialog ref={ref} aria-labelledby="gallery-viewer-title" aria-describedby="gallery-viewer-caption"
      onCancel={(event) => { event.preventDefault(); onClose() }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(index - 1) }
        if (event.key === 'ArrowRight') { event.preventDefault(); navigate(index + 1) }
      }}
      className="fixed inset-0 m-auto h-[100dvh] max-h-[100dvh] w-full max-w-none overflow-hidden border-0 bg-surface p-0 text-ink shadow-2xl backdrop:bg-navy/90 sm:h-[min(92dvh,960px)] sm:w-[calc(100%-3rem)] sm:max-w-6xl sm:rounded-2xl">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
          <div>
            <h2 id="gallery-viewer-title" className="text-sm font-semibold text-heading dark:text-glow">Women &amp; Child Health</h2>
            <p className="mt-1 text-xs tabular-nums text-ink/65">Photo {index + 1} of {images.length}</p>
          </div>
          <button type="button" autoFocus onClick={onClose} aria-label="Close photograph" className={controlClass}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-navy/5 dark:bg-black/20">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div key={image.id} custom={direction}
              variants={{ enter: (d: number) => ({ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : d * 28 }), visible: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : d * -28 }) }}
              initial="enter" animate="visible" exit="exit"
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.25, 1, 0.5, 1] }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12}
              onDragEnd={(_, info) => { if (info.offset.x < -45) navigate(index + 1); else if (info.offset.x > 45) navigate(index - 1) }}
              className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing">
              <ViewerImage image={image} />
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="shrink-0 border-t border-line/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
          <div className="mb-3 flex items-center gap-3">
            <button type="button" onClick={() => navigate(index - 1)} aria-disabled={index === 0} aria-label="Previous photograph" className={controlClass}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p id="gallery-viewer-caption" aria-live="polite" aria-atomic="true" className="min-w-0 flex-1 text-center text-sm leading-snug">{image.alt}</p>
            <button type="button" onClick={() => navigate(index + 1)} aria-disabled={index === images.length - 1} aria-label="Next photograph" className={controlClass}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div role="group" className="flex gap-2 overflow-x-auto p-1" aria-label="Choose a photograph">
            {images.map((photo, photoIndex) => (
              <button key={photo.id} ref={photoIndex === index ? activeThumbnail : undefined} type="button"
                onClick={() => navigate(photoIndex)} aria-label={`View photograph ${photoIndex + 1}: ${photo.alt}`}
                aria-current={photoIndex === index ? 'true' : undefined}
                className={cn('h-12 w-14 shrink-0 overflow-hidden rounded-md outline-none transition-opacity focus-visible:ring-[3px] focus-visible:ring-azure motion-reduce:transition-none', photoIndex === index ? 'ring-2 ring-azure ring-offset-2 ring-offset-surface' : 'opacity-50 hover:opacity-100')}>
                <img src={photo.src} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </footer>
      </div>
    </dialog>
  )
}
