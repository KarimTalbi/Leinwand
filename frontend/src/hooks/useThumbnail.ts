// hooks/useThumbnail.ts
import {useMemo} from 'react'
import {debounce} from 'lodash'
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react'
import { toJpeg } from 'html-to-image'

const IMAGE_WIDTH = 600
const IMAGE_HEIGHT = 360

export const useThumbnail = (graphId?: string | null) => {
  const { getNodes } = useReactFlow()

  const takeThumb = async () => {
    if (!graphId) return  // guard hier, nicht oben

    const nodesBounds = getNodesBounds(getNodes())
    const viewport = getViewportForBounds(nodesBounds, IMAGE_WIDTH, IMAGE_HEIGHT, 0.5, 2, 0)

    const dataUrl = await toJpeg(
      document.querySelector('.react-flow__viewport') as HTMLElement, {
        quality: 0.7,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        style: {
          width: IMAGE_WIDTH + 'px',
          height: IMAGE_HEIGHT + 'px',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(0.5)`,
        },
      }
    )

    await fetch(`/api/graphs/${graphId}/thumbnail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    })
  }

  const debouncedTakeThumb = useMemo(() => debounce(takeThumb, 5000), [])

  return { takeThumb: debouncedTakeThumb }
}
