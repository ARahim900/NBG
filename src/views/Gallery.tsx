import { Images } from 'lucide-react'
import { ImageGallery } from '@/components/ui/image-gallery'
import photos from '@/data/gallery.json'

export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl" aria-label="Women and Child Health gallery">
      <div className="mb-6 border-b border-line/15 pb-5 sm:mb-8 sm:pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-heading dark:text-glow">Women &amp; Child Health</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight text-heading dark:text-white">Our work in pictures</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">Activities, learning and shared moments from across the department.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-heading dark:text-glow">
            <Images className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">{photos.length} photographs</span>
          </div>
        </div>
        <p className="mt-4 text-xs text-ink/60">Select a photograph to explore the collection.</p>
      </div>
      <ImageGallery images={photos} />
    </section>
  )
}
