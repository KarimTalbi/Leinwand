import {useEffect, useState, FormEvent} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {Plus, Trash2, LogOut, FolderOpen} from 'lucide-react';
import useStore from '@/store';
import {CanvasRead} from '@/types';

export default function Dashboard() {
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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
        <div className="min-h-screen bg-[#ebebeb] flex flex-col">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">NodeLLM</h1>
                <div className="flex items-center gap-4">
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

            <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">Your projects</h2>
                </div>

                {/* Create new canvas */}
                <form onSubmit={handleCreate} className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="New project name..."
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={creating || !newName.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors cursor-pointer"
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
                    <div className="grid gap-3">
                        {canvases.map((canvas: CanvasRead) => (
                            <div
                                key={canvas.id}
                                onClick={() => void selectCanvas(canvas.id)}
                                className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between cursor-pointer hover:border-gray-400 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors"/>
                                    <span className="text-sm font-medium text-gray-900">{canvas.name}</span>
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
                )}
            </main>
        </div>
    );
}
