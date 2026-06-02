import React, {useEffect, useState} from 'react'
import {NodeTypes, ReactFlow, ReactFlowProvider} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  AArrowDown,
  ArrowLeft,
  ArrowRight,
  ClockArrowDown,
  FolderOpen,
  Pen,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react'
import {useShallow} from 'zustand/react/shallow'

import {DashboardNavbar} from '@/components/navigation/NavBar'
import MergeNode from '@/components/node-types/MergeNode'
import PromptNode from '@/components/node-types/PromptNode'
import SummaryNode from '@/components/node-types/SummaryNode'
import TextNode from '@/components/node-types/TextNode'
import {cn, timeAgo} from '@/lib/utils'
import useStore from '@/store'
import {CanvasRead} from '@/types'
import {bgColor, flowButtonStyle, foreground, ring, text} from "@/lib/styles.ts";

const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
}

const ITEMS_PER_PAGE = 6

export default function Dashboard() {
  const [newName, setNewName] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [nameEdit, setNameEdit] = useState<string>('')
  const [selectedEdit, setSelectedEdit] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  const updateCanvas = useStore((s) => s.updateCanvas)
  const SortIcon = sortBy === 'date' ? ClockArrowDown : AArrowDown

  const {canvases, loadCanvases, createCanvas, deleteCanvas, selectCanvas} = useStore(
    useShallow((s) => ({
      canvases: s.canvases,
      loadCanvases: s.loadCanvases,
      createCanvas: s.createCanvas,
      deleteCanvas: s.deleteCanvas,
      selectCanvas: s.selectCanvas,
      logout: s.logout,
    }))
  )

  useEffect(() => {
    void loadCanvases()
  }, [loadCanvases])

  const filteredCanvases = canvases
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'title') {
        return a.name.localeCompare(b.name)
      }
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return bTime - aTime
    })

  const totalPages = Math.ceil(filteredCanvases.length / ITEMS_PER_PAGE)
  const paginatedCanvases = filteredCanvases.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  )

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    await createCanvas(name)
    setNewName('')
  }

  const handleDelete = async (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation()
    setDeletingId(canvasId)
    await deleteCanvas(canvasId)
    setDeletingId(null)
    if (paginatedCanvases.length === 1 && currentPage > 0) {
      setCurrentPage((p) => p - 1)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setCurrentPage(0)
  }

  const handleStartEdit = (canvas: CanvasRead) => {
    setSelectedEdit(canvas.id)
    setNameEdit(canvas.name)
  }

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedEdit) {
      await updateCanvas(selectedEdit, nameEdit)
      setSelectedEdit(null)
    }
  }

  const handleSort = () => {
    setSortBy(sortBy === 'date' ? 'title' : 'date')
    setCurrentPage(0)
  }

  return (
    <div className={cn("flex flex-col min-h-screen", text, bgColor)}>

      <DashboardNavbar/>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">

        <form onSubmit={handleCreate} className="flex flex-col justify-center items-start gap-2 mb-6 w-full">

          <div className="flex flex-row gap-2 w-1/3">
            <button
              type="button"
              onClick={handleSort}
              className={cn(flowButtonStyle)}
            >
              <SortIcon size={16}/>
            </button>

            <div
              className={cn("flex flex-row rounded-full items-center gap-2 px-2 h-9 w-full", text, foreground, ring)}>
              <Search size={16} className={cn(text)}/>
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search..."
                className="focus:outline-none w-full"
              />
            </div>


          </div>

          <div className="flex flex-row gap-2 w-1/3">

            <button
              type='submit'
              disabled={!newName.trim()}
              className={cn(flowButtonStyle)}
            >
              <Plus size={16}/>
            </button>

            <div
              className={cn("flex flex-row rounded-full items-center gap-2 px-2 h-9 w-full", text, foreground, ring)}>
              <Plus size={16} className={cn(text)}/>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New project name..."
                className="focus:outline-none w-full"
              />
            </div>


          </div>

        </form>

        {canvases.length === 0 ? (
          <div className={cn("text-center py-16", text)}>
            <FolderOpen strokeWidth={1.5} size={50} className="mx-auto mb-2 opacity-50"/>
            <p className="text-sm opacity-50">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <>
            {filteredCanvases.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <Search strokeWidth={1.5} size={50} className="mx-auto mb-2 opacity-50"/>
                <p className="text-sm opacity-50">No projects match &quot;{search}&quot;.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {paginatedCanvases.map((canvas: CanvasRead) => (
                    <div
                      key={canvas.id}
                      className={cn("rounded-3xl shadow-xs overflow-hidden hover:shadow-md transition-all", ring, "cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700", foreground)}
                    >
                      <div

                        style={{height: 200}}
                        onClick={() => void selectCanvas(canvas.id, canvas.name)}
                      >
                        <ReactFlowProvider>
                          <ReactFlow
                            nodes={canvas.data.nodes}
                            edges={[]}
                            nodeTypes={nodeTypes}
                            fitView
                            minZoom={0.1}
                            proOptions={{hideAttribution: true}}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnScroll={false}
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            zoomOnDoubleClick={false}
                            panOnDrag={false}
                          >
                          </ReactFlow>
                        </ReactFlowProvider>
                      </div>

                      <div
                        className={cn("px-4 py-2 flex items-center justify-between gap-2 h-14", text)}>
                        <div className="min-w-0 flex-1 items-center">
                          {selectedEdit === canvas.id ? (
                            <input
                              type="text"
                              value={nameEdit}
                              onChange={(e) => setNameEdit(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className={cn(text, foreground, ring, "rounded-full text-sm h-9 w-full px-2 outline-none")}
                            />
                          ) : (
                            <>
                              <div className="font-semibold truncate">{canvas.name}</div>
                              <div className="text-[10px] truncate">
                                {!!canvas.updatedAt ? timeAgo(canvas.updatedAt) : 'Never edited'}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={
                              selectedEdit === canvas.id
                                ? handleSaveEdit
                                : () => handleStartEdit(canvas)
                            }
                            className={flowButtonStyle}
                          >
                            {selectedEdit === canvas.id ? <Save size={14}/> : <Pen size={14}/>}
                          </button>

                          <button
                            onClick={(e) => void handleDelete(e, canvas.id)}
                            disabled={deletingId === canvas.id}
                            className={flowButtonStyle}
                          >
                            <Trash2 size={14}/>
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 0}
                    className={cn(flowButtonStyle, "btn-sm")}
                  >
                    <ArrowLeft size={14}/>
                  </button>

                  <span className={cn(text)}>
                  {currentPage + 1} / {totalPages}
                </span>

                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={cn(flowButtonStyle, "btn-sm")}
                  >
                    <ArrowRight size={14}/>
                  </button>
                </div>

              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
