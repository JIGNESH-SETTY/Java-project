import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionApi } from '../api/collectionApi';
import { paperApi } from '../api/paperApi';
import { FolderKanban, Plus, Trash2, X, BookOpen, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const CollectionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.listCollections(),
  });

  const { data: papers = [] } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 100),
  });

  const createMutation = useMutation({
    mutationFn: () => collectionApi.createCollection({ name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setIsCreateOpen(false);
      setName('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionApi.deleteCollection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  });

  const addPaperMutation = useMutation({
    mutationFn: ({ colId, paperId }: { colId: string; paperId: string }) =>
      collectionApi.addPaper(colId, paperId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  });

  const removePaperMutation = useMutation({
    mutationFn: ({ colId, paperId }: { colId: string; paperId: string }) =>
      collectionApi.removePaper(colId, paperId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Curated Paper Collections</h1>
          <p className="text-xs text-slate-500">
            Group research papers by topic, thesis chapter, or benchmark investigation
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          New Collection
        </GlassButton>
      </div>

      {/* Collections Grid */}
      {isLoading ? (
        <div className="text-center py-20 text-slate-500 text-xs font-medium">Loading collections...</div>
      ) : collections.length === 0 ? (
        <GlassPanel className="p-12 text-center rounded-2xl border-dashed space-y-3">
          <FolderKanban className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No collections yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create a collection to organize your literature corpus for targeted comparison and reviews.
          </p>
          <div className="pt-2">
            <GlassButton
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateOpen(true)}
            >
              Create your first collection
            </GlassButton>
          </div>
        </GlassPanel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col) => {
            const colPapers = papers.filter((p) => col.paperIds.includes(p.paper.id));
            const availableToAdd = papers.filter((p) => !col.paperIds.includes(p.paper.id));

            return (
              <GlassPanel
                key={col.id}
                className="rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-glass-hover transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {col.paperCount} Papers
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(col.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{col.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                {/* Papers list in collection */}
                <div className="space-y-2 pt-3 border-t border-slate-200/80 text-xs">
                  <span className="text-[11px] font-semibold text-slate-700">Included Papers:</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {colPapers.map((p) => (
                      <div
                        key={p.paper.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-slate-200/70 text-[11px]"
                      >
                        <Link
                          to={`/papers/${p.paper.id}`}
                          className="font-medium text-slate-800 hover:text-indigo-600 truncate max-w-[200px]"
                        >
                          {p.paper.title}
                        </Link>
                        <button
                          onClick={() => removePaperMutation.mutate({ colId: col.id, paperId: p.paper.id })}
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition"
                          title="Remove from collection"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {colPapers.length === 0 && (
                      <div className="text-[11px] text-slate-400 italic">No papers added yet.</div>
                    )}
                  </div>
                </div>

                {/* Add Paper Quick Dropdown */}
                {availableToAdd.length > 0 && (
                  <div className="pt-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addPaperMutation.mutate({ colId: col.id, paperId: e.target.value });
                          e.target.value = '';
                        }
                      }}
                      className="w-full glass-select px-2.5 py-1.5 text-xs text-slate-700 font-medium"
                    >
                      <option value="">+ Add paper to this collection...</option>
                      {availableToAdd.map((p) => (
                        <option key={p.paper.id} value={p.paper.id}>
                          {p.paper.title} ({p.paper.publicationYear})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}

      {/* Create Collection Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <GlassPanelStrong className="w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-base">Create Research Collection</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Collection Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Neural Sequence Transduction"
                  className="w-full glass-input p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Focus of this literature collection..."
                  className="w-full glass-input p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <GlassButton
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </GlassButton>
                <GlassButton
                  type="submit"
                  variant="primary"
                  disabled={createMutation.isPending || !name.trim()}
                >
                  Create Collection
                </GlassButton>
              </div>
            </form>
          </GlassPanelStrong>
        </div>
      )}
    </div>
  );
};
