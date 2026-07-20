"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Toaster, toast } from 'sonner';
import { Search, GraduationCap, CreditCard, Heart, Bookmark, Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';

interface Note {
  id: string;
  title: string;
  course_code: string;
  institution: string;
  price_zar: number;
  likesCount: number;
}

interface Suggestion {
  type: 'subject' | 'module' | 'school';
  value: string;
  text: string;
}

const autocompleteCache: Record<string, Suggestion[]> = {};

const SOUTH_AFRICAN_SUBJECTS = [
  // Official Languages
  "Afrikaans", "English", "isiNdebele", "sePedi", "seSotho", "Sign Language", "siSwati", "xiTsonga", "seTswana", "Tshivenda", "isiXhosa", "isiZulu",
  // Additional subjects
  "Urdu", "Arabic", "German", "Greek", "Gujarati", "Hebrew", "Hindi", "Portuguese", "Sanskrit", "Tamil", "Telugu",
  // Core subjects
  "Mathematics", "Mathematical Literacy", "Life Orientation",
  // Elective subjects
  "Physical Sciences", "Computer Applications Technology (CAT)", "History", "Geography", "Tourism", "Business Studies", "Accounting", "Music", "Information Technology (IT)", "Economics", "Life Sciences", "Engineering Graphics and Design (EGD)", "Visual Arts", "Drama"
];

function ExploreContent() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useClickOutside(containerRef, () => {
    setShowDropdown(false);
    setFocusedIndex(-1);
  });

  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex !== -1 && suggestions[focusedIndex]) {
        setSearch(suggestions[focusedIndex].value);
      }
      setShowDropdown(false);
      setFocusedIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowDropdown(true);
      if (suggestions.length > 0) {
        setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setShowDropdown(true);
      if (suggestions.length > 0) {
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setFocusedIndex(-1);
    }
  };

  const fetchSuggestions = async (term: string) => {
    const cleanTerm = term.toLowerCase().trim();
    if (!cleanTerm || cleanTerm.length < 2) {
      setSuggestions([]);
      return;
    }

    if (autocompleteCache[cleanTerm]) {
      setSuggestions(autocompleteCache[cleanTerm]);
      return;
    }

    // Match static South African subjects locally
    const matchedStatic = SOUTH_AFRICAN_SUBJECTS.filter(subj =>
      subj.toLowerCase().includes(cleanTerm)
    ).map(subj => ({
      type: 'subject' as const,
      value: subj,
      text: subj
    }));
    
    setSuggestionsLoading(true);
    let items: Suggestion[] = [...matchedStatic];
    const added = new Set<string>(matchedStatic.map(s => `subject:${s.value}`));

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('title, course_code, institution')
        .eq('status', 'published')
        .or(`title.ilike.%${term}%,course_code.ilike.%${term}%,institution.ilike.%${term}%`)
        .limit(15);

      if (error) throw error;

      (data || []).forEach(note => {
        const t = term.toLowerCase();
        
        if (note.title.toLowerCase().includes(t)) {
          const key = `subject:${note.title}`;
          if (!added.has(key)) {
            added.add(key);
            items.push({ type: 'subject', value: note.title, text: note.title });
          }
        }
        
        if (note.course_code.toLowerCase().includes(t)) {
          const key = `module:${note.course_code}`;
          if (!added.has(key)) {
            added.add(key);
            items.push({ type: 'module', value: note.course_code, text: note.course_code });
          }
        }
        
        if (note.institution.toLowerCase().includes(t)) {
          const key = `school:${note.institution}`;
          if (!added.has(key)) {
            added.add(key);
            items.push({ type: 'school', value: note.institution, text: note.institution });
          }
        }
      });
    } catch (e) {
      console.error('Error fetching suggestions from DB:', e);
    } finally {
      const slicedItems = items.slice(0, 6);
      autocompleteCache[cleanTerm] = slicedItems;
      setSuggestions(slicedItems);
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(debouncedSearch);
  }, [debouncedSearch]);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 12;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userWishlists, setUserWishlists] = useState<Set<string>>(new Set());
  
  const searchParams = useSearchParams();



  const fetchUserInteractions = async (uid: string) => {
    try {
      // Fetch likes
      const { data: likesData } = await supabase
        .from('likes')
        .select('note_id')
        .eq('user_id', uid);
        
      if (likesData) {
        setUserLikes(new Set(likesData.map(l => l.note_id)));
      }

      // Fetch wishlists
      const { data: wishlistData } = await supabase
        .from('wishlists')
        .select('note_id')
        .eq('user_id', uid);
        
      if (wishlistData) {
        setUserWishlists(new Set(wishlistData.map(w => w.note_id)));
      }
    } catch (e) {
      console.error('Error fetching interactions:', e);
    }
  };

  const fetchNotes = async (pageIndex = 0, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          id, 
          title, 
          course_code, 
          institution, 
          price_zar,
          likes(count)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      
      const formattedNotes = (data || []).map((note: any) => ({
        id: note.id,
        title: note.title,
        course_code: note.course_code,
        institution: note.institution,
        price_zar: note.price_zar,
        likesCount: note.likes?.[0]?.count || 0
      }));

      setHasMore(formattedNotes.length === PAGE_SIZE);

      if (append) {
        setNotes(prev => [...prev, ...formattedNotes]);
      } else {
        setNotes(formattedNotes);
      }
    } catch (error: any) {
      toast.error('Failed to load notes');
      console.error('Fetch Notes Error:', error.message, error.details, error.hint, error.code, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Your notes are ready to download.');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment cancelled.');
    }
    
    // Check auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        fetchUserInteractions(session.user.id);
      }
      fetchNotes(0, false);
    });
  }, [searchParams]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotes(nextPage, true);
  };

  const toggleLike = async (noteId: string) => {
    if (!userId) {
      toast.error("Please sign in to like notes.");
      return;
    }

    const isLiked = userLikes.has(noteId);
    
    // Optimistic UI update
    const newLikes = new Set(userLikes);
    if (isLiked) newLikes.delete(noteId);
    else newLikes.add(noteId);
    setUserLikes(newLikes);

    setNotes(prev => prev.map(n => {
      if (n.id === noteId) {
        return { ...n, likesCount: n.likesCount + (isLiked ? -1 : 1) };
      }
      return n;
    }));

    try {
      if (isLiked) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('note_id', noteId);
      } else {
        await supabase.from('likes').insert({ user_id: userId, note_id: noteId });
      }
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const toggleWishlist = async (noteId: string) => {
    if (!userId) {
      toast.error("Please sign in to save notes to your wishlist.");
      return;
    }

    const isWishlisted = userWishlists.has(noteId);
    
    // Optimistic UI update
    const newWishlists = new Set(userWishlists);
    if (isWishlisted) newWishlists.delete(noteId);
    else newWishlists.add(noteId);
    setUserWishlists(newWishlists);
    
    if (isWishlisted) toast.success("Removed from wishlist.");
    else toast.success("Added to wishlist!");

    try {
      if (isWishlisted) {
        await supabase.from('wishlists').delete().eq('user_id', userId).eq('note_id', noteId);
      } else {
        await supabase.from('wishlists').insert({ user_id: userId, note_id: noteId });
      }
    } catch (e) {
      console.error("Error toggling wishlist:", e);
    }
  };

  const handleBuy = async (noteId: string) => {
    setProcessingId(noteId);
    toast.loading('Initializing secure checkout...');

    try {
      if (!userId) {
        toast.dismiss();
        toast.error('You must be logged in to purchase notes.');
        setProcessingId(null);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/payfast/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ note_id: noteId })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Checkout failed');
      }

      toast.dismiss();
      toast.success('Redirecting to PayFast...');

      const payfastUrl = 'https://sandbox.payfast.co.za/eng/process';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payfastUrl;

      for (const key in result.payfastData) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = result.payfastData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message);
      setProcessingId(null);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.course_code.toLowerCase().includes(search.toLowerCase()) ||
      n.institution.toLowerCase().includes(search.toLowerCase());
      
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-col mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Explore Feed</h1>
          <p className="text-gray-500 mt-2">Discover, like, and save top-tier study material.</p>
        </div>
        
        {/* Advanced Filters */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div ref={containerRef} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm transition-all"
              placeholder="Search by subject, module (e.g. INF1002S), or university..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
            />

            {/* Suggestions Overlay */}
            {showDropdown && search.trim().length >= 2 && (suggestions.length > 0 || suggestionsLoading) && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-150 overflow-hidden divide-y divide-gray-100">
                {suggestionsLoading ? (
                  <div className="p-4 flex items-center justify-center text-sm text-gray-500 space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading suggestions...</span>
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSearch(suggestion.value);
                        setShowDropdown(false);
                        setFocusedIndex(-1);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between text-sm transition-colors group ${
                        index === focusedIndex ? 'bg-blue-50/70 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {suggestion.type === 'subject' && <Search className={`h-4 w-4 text-gray-400 group-hover:text-blue-500 ${index === focusedIndex ? 'text-blue-500' : ''}`} />}
                        {suggestion.type === 'module' && <Bookmark className={`h-4 w-4 text-gray-400 group-hover:text-blue-500 ${index === focusedIndex ? 'text-blue-500' : ''}`} />}
                        {suggestion.type === 'school' && <GraduationCap className={`h-4 w-4 text-gray-400 group-hover:text-blue-500 ${index === focusedIndex ? 'text-blue-500' : ''}`} />}
                        <span className={`${index === focusedIndex ? 'font-medium' : ''}`}>
                          {(() => {
                            const match = search.trim();
                            const text = suggestion.text;
                            if (!match) return text;
                            const regex = new RegExp(`(${match.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
                            const parts = text.split(regex);
                            return parts.map((part, i) => 
                              regex.test(part) ? <strong key={i} className="font-semibold text-blue-600">{part}</strong> : <span key={i}>{part}</span>
                            );
                          })()}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md capitalize ${
                        index === focusedIndex ? 'bg-blue-100 text-blue-800' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {suggestion.type}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Suggestions Empty State */}
            {showDropdown && search.trim().length >= 2 && !suggestionsLoading && suggestions.length === 0 && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-150 p-4 text-center text-sm text-gray-500">
                No matching suggestions found for "{search}"
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center bg-gray-50 rounded-2xl p-16 border border-gray-100">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const isLiked = userLikes.has(note.id);
            const isWishlisted = userWishlists.has(note.id);
            
            return (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col group">
                <div className="p-6 flex-grow space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 pr-2">{note.title}</h3>
                    
                    {/* Social Actions */}
                    <div className="flex flex-col items-center space-y-2">
                      <button 
                        onClick={() => toggleWishlist(note.id)}
                        className={`p-1.5 rounded-full transition-colors ${isWishlisted ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Bookmark className="h-5 w-5" fill={isWishlisted ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {note.course_code}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {note.institution}
                  </div>
                  
                  <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-auto">
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-extrabold text-gray-900">R{note.price_zar}</span>
                      
                      {/* Like Button */}
                      <button 
                        onClick={() => toggleLike(note.id)}
                        className={`flex items-center space-x-1 p-1.5 rounded-full transition-colors ${isLiked ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50 hover:text-red-400'}`}
                        title={isLiked ? "Unlike" : "Like"}
                      >
                        <Heart className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-xs font-medium">{note.likesCount}</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleBuy(note.id)}
                      disabled={processingId === note.id}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-colors ${
                        processingId === note.id ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {processingId === note.id ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Buy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && filteredNotes.length > 0 && hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <React.Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ExploreContent />
    </React.Suspense>
  );
}
