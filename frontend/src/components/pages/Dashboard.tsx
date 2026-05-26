import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Plus,
  Trash2,
  FolderOpen,
  Pen,
  Save,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Hexagon
} from 'lucide-react';
import useStore from '@/store';
import { CanvasRead } from '@/types';
import {DashboardNavbar} from '@/components/Navigation/NavBar.tsx';
import {NodeTypes, Panel, ReactFlow, ReactFlowProvider} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';
import {cn, timeAgo} from "@/lib/utils.ts";

const nodeTypes: NodeTypes = {
  promptNode: PromptNode,
  textNode: TextNode,
  mergeNode: MergeNode,
  summaryNode: SummaryNode,
};

const ITEMS_PER_PAGE = 6;

export default function Dashboard() {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nameEdit, setNameEdit] = useState<string>('');
  const [selectedEdit, setSelectedEdit] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const updateCanvas = useStore((s) => s.updateCanvas);

  const { canvases, loadCanvases, createCanvas, deleteCanvas, selectCanvas } = useStore(
    useShallow((s) => ({
      canvases: s.canvases,
      loadCanvases: s.loadCanvases,
      createCanvas: s.createCanvas,
      deleteCanvas: s.deleteCanvas,
      selectCanvas: s.selectCanvas,
      logout: s.logout,
    }))
  );

  useEffect(() => {
    void loadCanvases();
  }, [loadCanvases]);

  const filteredCanvases = canvases.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCanvases.length / ITEMS_PER_PAGE);
  const paginatedCanvases = filteredCanvases.slice(
    currentPage * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    await createCanvas(name);
    setNewName('');
    setCreating(false);
    setShowCreate(false);
  };

  const handleDelete = async (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation();
    setDeletingId(canvasId);
    await deleteCanvas(canvasId);
    setDeletingId(null);
    if (paginatedCanvases.length === 1 && currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(0);
  };

  const handleStartEdit = (canvas: CanvasRead) => {
    setSelectedEdit(canvas.id);
    setNameEdit(canvas.name);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEdit) {
      await updateCanvas(selectedEdit, nameEdit);
      setSelectedEdit(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <DashboardNavbar/>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">

        {/* Toolbar */}
        <form onSubmit={handleCreate} className="flex items-center gap-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search..."
              className="max-w-40 pl-8 pr-3 py-1.5 ring-1 ring-neutral-200 rounded-sm text-xs focus:outline-none focus:ring-neutral-300"
            />
          </div>

          {showCreate && (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name..."
              autoFocus
              className="max-w-40 flex-1 ml-auto px-3 py-1.5 ring-1 ring-neutral-200 rounded-sm text-xs focus:outline-none focus:ring-neutral-300"
            />
          )}

          <button
            type={showCreate ? 'submit' : 'button'}
            disabled={showCreate && (creating || !newName.trim())}
            onClick={showCreate ? undefined : () => setShowCreate(true)}
            className={cn(
              "btn btn-sm flex items-center gap-1 border-none shadow-none font-normal bg-neutral-200 hover:bg-neutral-300",
              !showCreate ? "ml-auto" : "ml-2"
              )}
          >
            <Plus className="size-3" />
            {showCreate ? (creating ? 'Creating…' : 'Create') : 'New project'}
          </button>

          {showCreate && (
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </form>

        {/* Empty state */}
        {canvases.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <FolderOpen className="size-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <>
            {filteredCanvases.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <Search className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No projects match "{search}".</p>
              </div>
            ) : (
              <>
                {/* Project grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {paginatedCanvases.map((canvas: CanvasRead) => (
                    <div
                      key={canvas.id}
                      className="ring-1 ring-neutral-200 rounded-md overflow-hidden hover:shadow-xs hover:border-gray-300 transition-all"
                    >
                      {/* Canvas preview */}
                      <div
                        className="relative bg-neutral-50 cursor-pointer hover:bg-neutral-100"
                        style={{ height: 160 }}
                        onClick={() => void selectCanvas(canvas.id, canvas.name)}
                      >
                        <ReactFlowProvider>
                          <ReactFlow
                            nodes={canvas.data.nodes}
                            edges={[]}
                            nodeTypes={nodeTypes}
                            fitView
                            minZoom={0.1}
                            proOptions={{ hideAttribution: true }}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            panOnScroll={false}
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            zoomOnDoubleClick={false}
                            panOnDrag={false}
                          >
                            <Panel position="top-right">
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-neutral-400 text-white text-[10px] font-bold rounded-full translate-x-2 -translate-y-2">
                                <Hexagon size={10} ></Hexagon>
                                <p>{canvas.data.nodes.length}</p>
                              </div>
                            </Panel>
                          </ReactFlow>
                        </ReactFlowProvider>
                      </div>

                      {/* Card footer */}
                      <div className="border-t border-neutral-200 px-3 py-2 bg-white flex items-center justify-between gap-2 h-12">
                        <div className="min-w-0 flex-1 items-center">
                          {selectedEdit === canvas.id ? (
                            <input
                              type="text"
                              value={nameEdit}
                              onChange={(e) => setNameEdit(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-neutral-500 border ring-1 ring-neutral-200 rounded px-1.5 my-1 w-full focus:outline-none focus:ring-neutral-300"
                            />
                          ) : (
                            <>
                              <div className="text-xs font-medium truncate text-neutral-600">{canvas.name}</div>
                              <div className="text-[10px] text-neutral-400 truncate">
                                {canvas.data.updated_at ? timeAgo(canvas.data.updated_at) : 'Never edited'}
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
                            className="btn btn-square btn-xs btn-ghost border-none shadow-none text-neutral-500 hover:text-neutral-800 hover:bg-transparent"
                          >
                            {selectedEdit === canvas.id ? <Save size={12} /> : <Pen size={12} />}
                          </button>

                          <button
                            onClick={(e) => void handleDelete(e, canvas.id)}
                            disabled={deletingId === canvas.id}
                            className="btn btn-square btn-xs btn-ghost border-none shadow-none text-neutral-500 hover:text-neutral-800 hover:bg-transparent"
                          >
                            <Trash2 size={12} />
                          </button>

                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 0}
                      className="btn btn-circle btn-xs bg-transparent border border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ChevronLeft size={12} />
                    </button>

                    <span className="text-xs text-neutral-500">
                  {currentPage + 1} / {totalPages}
                </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="btn btn-circle btn-xs bg-transparent border border-neutral-300 hover:border-neutral-400 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}