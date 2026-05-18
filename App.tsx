import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Plus, 
  Search, 
  Clock, 
  BarChart3, 
  Trash2, 
  Settings2,
  UtensilsCrossed,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Recipe {
  _id: string;
  title: string;
  ingredients: string[];
  instructions: string;
  cookingTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  createdAt: string;
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    cookingTime: 30,
    difficulty: 'Medium' as const,
    category: 'General'
  });

  const checkApiHealth = async () => {
    try {
      const resp = await fetch('/api/health');
      if (resp.headers.get('content-type')?.includes('application/json')) {
        const data = await resp.json();
        console.log('API is healthy:', data);
        return true;
      }
    } catch (e) {
      console.warn('API health check failed', e);
    }
    return false;
  };

  const fetchRecipes = async (category = '', retryCount = 0) => {
    try {
      setLoading(true);
      const url = category ? `/api/recipes?category=${category}` : '/api/recipes';
      const response = await fetch(url);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        const headers = Object.fromEntries(response.headers.entries());
        console.error('Non-JSON response received. Headers:', headers);
        console.log('Response body start:', text.substring(0, 100));
        
        // Check if we got the "Starting Server" placeholder or a generic HTML response
        if ((text.includes('<!doctype') || text.includes('<html')) && retryCount < 12) {
          console.log(`Backend warm-up (got HTML)... Retry ${retryCount + 1}/12 in 4s`);
          setTimeout(() => fetchRecipes(category, retryCount + 1), 4000);
          return;
        }
        throw new Error(`Expected JSON but received HTML. Status: ${response.status}. Path: ${url}`);
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recipes');
      }
      
      setRecipes(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg.includes('Database not connected') || msg.includes('MONGODB_URI')) {
        setError('Database Connection Required: Please add your MONGODB_URI to the Secrets panel in the AI Studio settings and restart the app.');
      } else {
        setError(msg);
      }
      console.error('Fetch error:', err);
    } finally {
      // Only hide loading if we are not retrying
      if (retryCount === 0 || recipes.length > 0) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    checkApiHealth();
    fetchRecipes();
  }, []);

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecipe,
          ingredients: newRecipe.ingredients.split('\n').filter(i => i.trim() !== '')
        })
      });
      
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to add recipe (Server error)');
      }
      
      setIsAddModalOpen(false);
      setNewRecipe({
        title: '',
        ingredients: '',
        instructions: '',
        cookingTime: 30,
        difficulty: 'Medium',
        category: 'General'
      });
      fetchRecipes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error adding recipe');
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const response = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete recipe');
      fetchRecipes();
    } catch (err) {
      alert('Error deleting recipe');
    }
  };

  const filteredRecipes = recipes.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <ChefHat size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">The Global Kitchen</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search recipes..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full w-64 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm shadow-orange-200"
            >
              <Plus size={18} />
              Add Recipe
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-2">Build Your Signature Cookbook</h2>
            <p className="text-slate-400 mb-6 font-light">
              Store, organize, and manage your favorite recipes with our professional API-powered kitchen dashboard.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
                <ChefHat size={14} className="text-orange-400" />
                <span>3-Tier Architecture</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
                <UtensilsCrossed size={14} className="text-blue-400" />
                <span>RESTful API</span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <ChefHat size={300} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-4 text-orange-800">
            <AlertCircle className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                {error.includes('Database') ? 'Database Connection Status' : 'Application Error'}
              </p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-orange-500" size={48} />
            <p className="text-slate-500 font-medium tracking-wide">Cooking up your recipes...</p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Recipes Found</h3>
            <p className="text-slate-500">Start by adding your first recipe to the collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecipes.map((recipe) => (
                <motion.div
                  layout
                  key={recipe._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                        {recipe.category}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-orange-500 transition-colors">
                      {recipe.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-slate-500 text-sm mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-orange-400" />
                        <span>{recipe.cookingTime} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 size={14} className="text-blue-400" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-widest">Ingredients</p>
                        <ul className="text-sm text-slate-600 line-clamp-2">
                          {recipe.ingredients.join(', ')}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1 tracking-widest">Instructions</p>
                        <p className="text-sm text-slate-600 line-clamp-3 italic">
                          "{recipe.instructions}"
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            The Global Kitchen API Project &copy; 2024
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Developed by <span className="font-bold text-slate-600">TATA MOdepet</span>
          </p>
        </div>
      </footer>

      {/* Add Recipe Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl relative z-60 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-lg">Add New Recipe</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddRecipe} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Project Name / Recipe Title</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newRecipe.title}
                    onChange={e => setNewRecipe({...newRecipe, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={newRecipe.category}
                      onChange={e => setNewRecipe({...newRecipe, category: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Difficulty</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={newRecipe.difficulty}
                      onChange={e => setNewRecipe({...newRecipe, difficulty: e.target.value as any})}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Cooking Time (minutes)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newRecipe.cookingTime}
                    onChange={e => setNewRecipe({...newRecipe, cookingTime: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Ingredients (One per line)</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    placeholder="2 cups of Flour&#10;3 Large Eggs&#10;1 tsp Salt"
                    value={newRecipe.ingredients}
                    onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Cooking Instructions</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    value={newRecipe.instructions}
                    onChange={e => setNewRecipe({...newRecipe, instructions: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
                  >
                    Create Recipe
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
