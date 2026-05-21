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
  LogOut, Hexagon
} from 'lucide-react';
import useStore from '@/store';
import { CanvasRead } from '@/types';
import { Navbar } from '@/components/Navigation/NavBar.tsx';
import {NodeTypes, Panel, ReactFlow, ReactFlowProvider} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import PromptNode from '@/components/NodeTypes/PromptNode.tsx';
import TextNode from '@/components/NodeTypes/TextNode.tsx';
import MergeNode from '@/components/NodeTypes/MergeNode.tsx';
import SummaryNode from '@/components/NodeTypes/SummaryNode.tsx';
import {cn} from "@/lib/utils.ts";
import {navbarButtonStyle} from "@/lib/styles.ts";

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

  const { canvases, loadCanvases, createCanvas, deleteCanvas, selectCanvas, logout } = useStore(
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

      <Navbar
      child4={
        <button className={navbarButtonStyle} onClick={logout}>
          <LogOut size={14}/>
          <p>Log out</p>
        </button>
      }
      />

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
              className="max-w-40 pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {showCreate && (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name..."
              autoFocus
              className="max-w-40 flex-1 ml-auto px-3 py-2 border border-gray-300 rounded-lg shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          )}

          <button
            type={showCreate ? 'submit' : 'button'}
            disabled={showCreate && (creating || !newName.trim())}
            onClick={showCreate ? undefined : () => setShowCreate(true)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap",
              !showCreate ? "ml-auto" : "ml-2"
              )}
          >
            <Plus className="size-3.5" />
            {showCreate ? (creating ? 'Creating…' : 'Create') : 'New project'}
          </button>

          {showCreate && (
            <button
              type="button"
              onClick={() => { setShowCreate(false); setNewName(''); }}
              className="p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        {/* Empty state */}
        {canvases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen className="size-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <>
            {filteredCanvases.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="size-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No projects match "{search}".</p>
              </div>
            ) : (
              <>
                {/* Project grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {paginatedCanvases.map((canvas: CanvasRead) => (
                    <div
                      key={canvas.id}
                      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      {/* Canvas preview */}
                      <div
                        className="relative bg-gray-50 cursor-pointer"
                        style={{ height: 160 }}
                        onClick={() => void selectCanvas(canvas.id, canvas.name)}
                      >
                        <ReactFlowProvider>
                          <ReactFlow
                            nodes={canvas.data.nodes}
                            edges={canvas.data.edges}
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
                              <div className="flex items-center gap-1 px-2 py-1 bg-neutral-500 text-white text-[10px] font-bold rounded-full translate-x-2 -translate-y-2">
                                <Hexagon size={10} ></Hexagon>
                                <p>{canvas.data.nodes.length}</p>
                              </div>
                            </Panel>
                          </ReactFlow>
                        </ReactFlowProvider>
                      </div>

                      {/* Card footer */}
                      <div className="border-t border-gray-200 px-3 py-2.5 bg-white flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 items-center">
                          {selectedEdit === canvas.id ? (
                            <input
                              type="text"
                              value={nameEdit}
                              onChange={(e) => setNameEdit(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm font-medium border border-gray-300 rounded px-1.5 py-1.75 w-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                            />
                          ) : (
                            <>
                              <div className="text-sm font-medium truncate">{canvas.name}</div>
                              <div className="text-xs text-gray-400 truncate">
                                {canvas.data.updated_at ?? 'Never edited'}
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
                            className="btn btn-square btn-xs btn-ghost border-none shadow-none"
                          >
                            {selectedEdit === canvas.id ? <Save size={13} /> : <Pen size={13} />}
                          </button>

                          <button
                            onClick={(e) => void handleDelete(e, canvas.id)}
                            disabled={deletingId === canvas.id}
                            className="btn btn-square btn-xs btn-ghost border-none shadow-none"
                          >
                            <Trash2 size={13} />
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
                      className="btn btn-circle btn-sm bg-transparent border border-gray-300 text-gray-500 hover:bg-gray-900 hover:text-white disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                    </button>

                    <span className="text-sm text-gray-500">
                  {currentPage + 1} / {totalPages}
                </span>

                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="btn btn-circle btn-sm bg-transparent border border-gray-300 text-gray-500 hover:bg-gray-900 hover:text-white disabled:opacity-30"
                    >
                      <ChevronRight size={14} />
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