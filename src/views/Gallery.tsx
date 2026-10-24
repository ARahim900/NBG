import { ImageGallery } from '@/components/ui/image-gallery'
import photos from '@/data/gallery.json'

export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl" aria-label="Women and Child Health gallery">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#A4C5BB]/40 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#4E4456] dark:text-[#A4C5BB]">Women &amp; Child Health</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#4E4456] dark:text-white sm:text-3xl">Our work in pictures</h2>
          <p className="mt-3 text-sm text-ink/75">A collection of activities, learning and shared moments. Select a photograph to explore.</p>
        </div>
        <span className="rounded-full border border-[#A4C5BB]/60 bg-[#A4C5BB]/15 px-4 py-2 text-sm font-medium text-[#4E4456] dark:text-[#A4C5BB]">{photos.length} photographs</span>
      </div>
      <ImageGallery images={photos} />
    </section>
  )
}
