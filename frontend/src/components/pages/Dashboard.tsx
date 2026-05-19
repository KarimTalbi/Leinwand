import React, {useEffect, useState, FormEvent} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {Plus, Trash2, LogOut, FolderOpen, Pen, Play, Save} from 'lucide-react';
import useStore from '@/store';
import {CanvasRead} from '@/types';

export default function Dashboard() {
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedEdit, setSelectedEdit] = useState<string | null>(null);

  const {canvases, loadCanvases, createCanvas, deleteCanvas, selectCanvas, logout, user} = useStore(useShallow((s) => ({
    canvases: s.canvases,
    loadCanvases: s.loadCanvases,
    createCanvas: s.createCanvas,
    deleteCanvas: s.deleteCanvas,
    selectCanvas: s.selectCanvas,
    logout: s.logout,
    user: s.user,
  })));

  useEffect(() => {
    void loadCanvases();
  }, [loadCanvases]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    await createCanvas(name);
    setNewName('');
    setCreating(false);
  };

  const handleDelete = async (e: React.MouseEvent, canvasId: string) => {
    e.stopPropagation();
    setDeletingId(canvasId);
    await deleteCanvas(canvasId);
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">

      {/* Header */}
      <header className="px-6 py-4 flex flex-col items-end">

        <div className="h-12 flex items-center gap-4  rounded-full px-5 py-1">
          {user && (
            <span className="text-sm text-gray-500">{user.username}</span>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <LogOut className="size-4"/>
            Log out
          </button>
        </div>


      </header>

      <main className="flex-1 max-w-xl w-full mx-auto px-6 py-10">

        {/* Create new canvas */}
        <form onSubmit={handleCreate} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New project name..."
            className="flex-1 px-3 py-2  border border-gray-300 rounded-lg shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Plus className="size-4"/>
            Create
          </button>
        </form>

        {/* Canvas list */}
        {canvases.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen className="size-10 mx-auto mb-3 opacity-40"/>
            <p className="text-sm">No projects yet. Create one to get started.</p>
          </div>
        ) : (
          <div>

            <ul className="list bg-base-100">

              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Your Projects:</li>

              {canvases.map((canvas: CanvasRead) => (
                <div className="flex items-center justify-between p-2">
                  <div key={canvas.id}
                       className="w-full"
                  >
                    <li className=" flex flex-row justify-between items-center h-15">

                      {
                        selectedEdit === canvas.id
                          ? <input type="text" placeholder="Type here" value={canvas.name} className="input input-sm shadow-inner border outline-none"/>
                          :
                          <div>
                            <div className="text-bold text-base">{canvas.name}</div>
                            <div className="text-xs font-semibold opacity-60">last
                              edited: {canvas.data.updated_at || "N/A"}</div>
                          </div>
                      }

                      <div className="flex gap-1">

                        <button
                          onClick={selectedEdit === canvas.id ? () => setSelectedEdit(null) :  () => setSelectedEdit(canvas.id)}
                          className="btn btn-circle btn-neutral btn-sm bg-transparent border-none shadow-none text-black hover:bg-black hover:text-white">
                          {
                            selectedEdit === canvas.id
                              ? <Save size={14}></Save>
                              : <Pen size={14}></Pen>
                          }
                        </button>

                        <button
                          onClick={(e) => void handleDelete(e, canvas.id)}
                          disabled={deletingId === canvas.id}
                          className="btn btn-circle btn-neutral btn-sm bg-transparent border-none shadow-none text-black hover:bg-black hover:text-white">
                          <Trash2 size={14}></Trash2>
                        </button>

                        <button
                          onClick={() => void selectCanvas(canvas.id)}
                          disabled={deletingId === canvas.id || selectedEdit === canvas.id}
                          className="btn btn-circle btn-neutral btn-sm bg-transparent border-none shadow-none text-black hover:bg-black hover:text-white">
                          <Play size={14}></Play>
                        </button>
                      </div>


                    </li>

                  </div>

                </div>
              ))}


            </ul>
            <div className="grid gap-2">
              {canvases.map((canvas: CanvasRead) => (
                <div
                  key={canvas.id}
                  onClick={() => void selectCanvas(canvas.id)}
                  className="border border-gray-300 rounded-xl px-5 py-3 flex items-center justify-between cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors"/>
                    <span className="text-sm font-medium text-gray-900">{canvas.name}</span>
                    <span>{canvas.data.updated_at}</span>
                    <span>{canvas.data.node_count || "N/A"}</span>
                  </div>
                  <button
                    onClick={(e) => void handleDelete(e, canvas.id)}
                    disabled={deletingId === canvas.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <Trash2 className="size-4"/>
                  </button>
                </div>

              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}