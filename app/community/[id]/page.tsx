'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import NotificationBell from "@/app/components/NotificationBell";

interface Idea {
  _id: string;
  title: string;
  content: string;
  userName: string;
  userId: string;
  status: 'chat' | 'proceed' | 'hold' | 'discard';
  votes: Array<{
    userId: string;
    userName: string;
    voteType: 'proceed' | 'hold' | 'discard';
  }>;
  replies: Array<{
    _id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  movedAt?: string | null;
  isEdited?: boolean;
  editedAt?: string | null;
}

interface Community {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[];
  creatorName: string;
  isAdmin: boolean;
}

export default function CommunityPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const communityId = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'proceed' | 'hold' | 'discard' | 'dashboard' | 'members'>('chat');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIdeaModal, setShowNewIdeaModal] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  // Edit/Delete states
  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  
  // Dashboard & Members states
  const [dashboard, setDashboard] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [searchMember, setSearchMember] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'votes' | 'replies'>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch community and ideas
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCommunity();
      fetchIdeas();
    }
  }, [status, communityId]);

  // Fetch dashboard when switching to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && status === 'authenticated') {
      fetchDashboard();
    }
  }, [activeTab, status]);

  // Fetch members when switching to members tab
  useEffect(() => {
    if (activeTab === 'members' && status === 'authenticated') {
      fetchMembers();
    }
  }, [activeTab, status]);

  const fetchCommunity = async () => {
    try {
      const response = await fetch(`/api/communities/${communityId}`);
      const data = await response.json();
      if (data.success) {
        setCommunity(data.data);
      }
    } catch (error) {
      console.error('Error fetching community:', error);
    }
  };

  const fetchIdeas = async () => {
    try {
      const response = await fetch(`/api/ideas?communityId=${communityId}`);
      const data = await response.json();
      if (data.success) {
        setIdeas(data.data);
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/dashboard`);
      const data = await response.json();
      if (data.success) {
        setDashboard(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/communities/${communityId}/members`);
      const data = await response.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleKickMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to kick ${memberName} from the community?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/kick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Member removed successfully');
        fetchMembers();
        fetchCommunity();
      } else {
        alert(data.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error kicking member:', error);
      alert('Something went wrong');
    }
  };

  const handleCreateIdea = async () => {
    if (!newIdeaTitle.trim() || !newIdeaContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          title: newIdeaTitle,
          content: newIdeaContent
        })
      });

      const data = await response.json();
      if (data.success) {
        setIdeas([data.data, ...ideas]);
        setShowNewIdeaModal(false);
        setNewIdeaTitle('');
        setNewIdeaContent('');
      } else {
        alert(data.error || 'Failed to create idea');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
      alert('Something went wrong');
    }
  };

  const handleVote = async (ideaId: string, voteType: 'proceed' | 'hold' | 'discard') => {
    try {
      const response = await fetch('/api/ideas/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, voteType })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh ideas to get updated votes and status
        fetchIdeas();
      } else {
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleReply = async (ideaId: string) => {
    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      const response = await fetch('/api/ideas/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, content: replyContent })
      });

      const data = await response.json();
      if (data.success) {
        fetchIdeas();
        setReplyContent('');
      } else {
        alert(data.error || 'Failed to reply');
      }
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  const getUserVote = (idea: Idea) => {
    // Find vote by comparing userName instead of userId for simplicity
    return idea.votes.find(v => v.userName === session?.user?.name)?.voteType;
  };

  const getVoteCounts = (idea: Idea) => {
    const proceed = idea.votes.filter(v => v.voteType === 'proceed').length;
    const hold = idea.votes.filter(v => v.voteType === 'hold').length;
    const discard = idea.votes.filter(v => v.voteType === 'discard').length;
    return { proceed, hold, discard };
  };

  const getDaysUntilDeletion = (idea: Idea) => {
    if (idea.status !== 'discard' || !idea.movedAt) return null;
    
    const movedDate = new Date(idea.movedAt);
    const deleteDate = new Date(movedDate);
    deleteDate.setDate(deleteDate.getDate() + 7);
    
    const now = new Date();
    const daysLeft = Math.ceil((deleteDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft > 0 ? daysLeft : 0;
  };

  // Get unique authors for filter dropdown
  const getUniqueAuthors = () => {
    const authors = new Set(ideas.map(idea => idea.userName));
    return Array.from(authors).sort();
  };

  // Apply search and filters
  const getFilteredAndSortedIdeas = () => {
    let filtered = ideas.filter(idea => idea.status === activeTab);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(query) ||
        idea.content.toLowerCase().includes(query) ||
        idea.userName.toLowerCase().includes(query)
      );
    }

    // Author filter
    if (filterAuthor) {
      filtered = filtered.filter(idea => idea.userName === filterAuthor);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'votes':
          const aVotes = a.votes.length;
          const bVotes = b.votes.length;
          return bVotes - aVotes;
        case 'replies':
          return b.replies.length - a.replies.length;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterAuthor('');
    setSortBy('recent');
  };

  const hasActiveFilters = searchQuery || filterAuthor || sortBy !== 'recent';

  const handleEditIdea = async (ideaId: string) => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/ideas/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, title: editTitle, content: editContent })
      });

      const data = await response.json();
      if (data.success) {
        fetchIdeas();
        setEditingIdea(null);
        setEditTitle('');
        setEditContent('');
      } else {
        alert(data.error || 'Failed to edit idea');
      }
    } catch (error) {
      console.error('Error editing idea:', error);
      alert('Something went wrong');
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    if (!confirm('Are you sure you want to delete this idea? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ideas/delete?ideaId=${ideaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchIdeas();
      } else {
        alert(data.error || 'Failed to delete idea');
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Something went wrong');
    }
  };

  const handleEditReply = async (ideaId: string, replyId: string) => {
    if (!editReplyContent.trim()) {
      alert('Please enter reply content');
      return;
    }

    try {
      const response = await fetch('/api/ideas/reply/edit', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, replyId, content: editReplyContent })
      });

      const data = await response.json();
      if (data.success) {
        fetchIdeas();
        setEditingReply(null);
        setEditReplyContent('');
      } else {
        alert(data.error || 'Failed to edit reply');
      }
    } catch (error) {
      console.error('Error editing reply:', error);
      alert('Something went wrong');
    }
  };

  const handleDeleteReply = async (ideaId: string, replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ideas/reply/delete?ideaId=${ideaId}&replyId=${replyId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchIdeas();
      } else {
        alert(data.error || 'Failed to delete reply');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Something went wrong');
    }
  };

  const filteredIdeas = getFilteredAndSortedIdeas();

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl pixel-font">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <img 
        src="/background_7.gif" 
        alt="background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* NAVBAR */}
      <nav className="relative w-full flex justify-between items-center px-3 py-1 bg-[#1b1b1b] text-white pixel-font border-b-4 border-black shadow-md z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/chats')}
            className="text-xl hover:text-cyan-400"
          >
            ← BACK
          </button>
          <div className="text-2xl font-bold">{community?.name || 'LOADING...'}</div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <NotificationBell />
          <button
            className="px-3 py-1 bg-[#1b1b1b] text-white border-4 border-black pixel-font hover:bg-[#333]"
            onClick={() => router.push('/home')}
          >
            HOME
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="relative z-20 p-8">
        {/* COMMUNITY INFO */}
        <div className="bg-[#111111]/90 border-4 border-white rounded-lg p-6 mb-6">
          <h1 className="text-3xl text-white pixel-font drop-shadow-neon mb-2">{community?.name}</h1>
          <p className="text-gray-400 text-sm mb-3">{community?.description}</p>
          <div className="flex gap-4 text-xs text-gray-400 pixel-font">
            <span>👥 {community?.memberCount} members</span>
            <span>👤 {session?.user?.name}</span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-cyan-600 text-white border-cyan-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            💬 CHAT
          </button>
          <button
            onClick={() => setActiveTab('proceed')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'proceed'
                ? 'bg-green-600 text-white border-green-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            ✅ PROCEED
          </button>
          <button
            onClick={() => setActiveTab('hold')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'hold'
                ? 'bg-yellow-600 text-white border-yellow-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            ⏸️ HOLD
          </button>
          <button
            onClick={() => setActiveTab('discard')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'discard'
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            ❌ DISCARD
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'bg-purple-600 text-white border-purple-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            📊 DASHBOARD
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 pixel-font border-4 rounded-lg transition-all ${
              activeTab === 'members'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-[#1b1b1b] text-gray-400 border-gray-700 hover:border-gray-500'
            }`}
          >
            👥 MEMBERS
          </button>

          {activeTab === 'chat' && (
            <button
              onClick={() => setShowNewIdeaModal(true)}
              className="ml-auto px-6 py-3 bg-[#ffd84d] text-black pixel-font border-4 border-black rounded-lg hover:bg-[#ffe78c]"
            >
              + NEW IDEA
            </button>
          )}
        </div>

        {/* CONTENT AREA */}
        {activeTab === 'dashboard' ? (
          // DASHBOARD VIEW
          <div>
            {loadingDashboard ? (
              <div className="text-white text-center pixel-font">LOADING DASHBOARD...</div>
            ) : dashboard ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#111111]/90 border-4 border-cyan-400 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">💡</div>
                    <div className="text-white text-2xl pixel-font">{dashboard.statistics.totalIdeas}</div>
                    <div className="text-gray-400 text-xs pixel-font">IDEAS</div>
                  </div>
                  <div className="bg-[#111111]/90 border-4 border-green-400 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">👍</div>
                    <div className="text-white text-2xl pixel-font">{dashboard.statistics.totalVotes}</div>
                    <div className="text-gray-400 text-xs pixel-font">VOTES</div>
                  </div>
                  <div className="bg-[#111111]/90 border-4 border-purple-400 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">💬</div>
                    <div className="text-white text-2xl pixel-font">{dashboard.statistics.totalReplies}</div>
                    <div className="text-gray-400 text-xs pixel-font">REPLIES</div>
                  </div>
                  <div className="bg-[#111111]/90 border-4 border-yellow-400 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <div className="text-white text-2xl pixel-font">{dashboard.statistics.totalMembers}</div>
                    <div className="text-gray-400 text-xs pixel-font">MEMBERS</div>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                  <h3 className="text-white text-xl pixel-font mb-4">IDEA STATUS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-cyan-400 text-3xl pixel-font">{dashboard.statistics.statusCounts.chat}</div>
                      <div className="text-gray-400 text-xs pixel-font mt-1">CHAT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 text-3xl pixel-font">{dashboard.statistics.statusCounts.proceed}</div>
                      <div className="text-gray-400 text-xs pixel-font mt-1">PROCEED</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 text-3xl pixel-font">{dashboard.statistics.statusCounts.hold}</div>
                      <div className="text-gray-400 text-xs pixel-font mt-1">HOLD</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-400 text-3xl pixel-font">{dashboard.statistics.statusCounts.discard}</div>
                      <div className="text-gray-400 text-xs pixel-font mt-1">DISCARD</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Contributors */}
                  <div className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                    <h3 className="text-white text-xl pixel-font mb-4">🏆 TOP CONTRIBUTORS</h3>
                    <div className="space-y-3">
                      {dashboard.topContributors.map((contributor: any, index: number) => (
                        <div key={contributor.name} className="flex items-center justify-between bg-[#1b1b1b] rounded p-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</span>
                            <span className="text-white pixel-font text-sm">{contributor.name}</span>
                          </div>
                          <span className="text-cyan-400 pixel-font text-sm">{contributor.ideasPosted} ideas</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Voted Ideas */}
                  <div className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                    <h3 className="text-white text-xl pixel-font mb-4">🔥 MOST VOTED</h3>
                    <div className="space-y-3">
                      {dashboard.mostVoted.slice(0, 5).map((idea: any) => (
                        <div key={idea._id} className="bg-[#1b1b1b] rounded p-3">
                          <p className="text-white text-sm mb-2 truncate">{idea.title}</p>
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span>👍 {idea.voteCount}</span>
                            <span>💬 {idea.replyCount}</span>
                            <span className="text-cyan-400">{idea.userName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activity Graph */}
                <div className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                  <h3 className="text-white text-xl pixel-font mb-4">📈 ACTIVITY (LAST 7 DAYS)</h3>
                  <div className="flex items-end justify-between h-48 gap-2">
                    {dashboard.activityByDay.map((day: any, index: number) => {
                      const maxCount = Math.max(...dashboard.activityByDay.map((d: any) => d.count), 1);
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="flex-1 flex items-end w-full">
                            <div
                              className="w-full bg-cyan-600 border-2 border-cyan-400 rounded-t"
                              style={{ height: `${height}%`, minHeight: day.count > 0 ? '10%' : '0%' }}
                            ></div>
                          </div>
                          <div className="text-white pixel-font text-xs mt-2">{day.count}</div>
                          <div className="text-gray-400 text-xs pixel-font mt-1">{day.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center pixel-font">Failed to load dashboard</div>
            )}
          </div>
        ) : activeTab === 'members' ? (
          // MEMBERS VIEW
          <div>
            {loadingMembers ? (
              <div className="text-white text-center pixel-font">LOADING MEMBERS...</div>
            ) : (
              <div>
                {/* Search Bar */}
                <div className="bg-[#111111]/90 border-4 border-gray-700 rounded-lg p-4 mb-6">
                  <input
                    type="text"
                    placeholder="🔍 Search members..."
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Members List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members
                    .filter(member => member.name.toLowerCase().includes(searchMember.toLowerCase()))
                    .map((member) => (
                      <div key={member._id} className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-white text-lg pixel-font flex items-center gap-2">
                              {member.name}
                              {member.isCreator && <span className="text-yellow-400 text-sm">👑 ADMIN</span>}
                            </h3>
                          </div>
                          {community?.isAdmin && !member.isCreator && (
                            <button
                              onClick={() => handleKickMember(member._id, member.name)}
                              className="px-3 py-1 bg-red-600 text-white pixel-font text-xs border-2 border-red-400 rounded hover:bg-red-500"
                            >
                              🚫 KICK
                            </button>
                          )}
                        </div>

                        {/* Member Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#1b1b1b] rounded p-3 text-center">
                            <div className="text-cyan-400 text-xl pixel-font">{member.stats.ideasPosted}</div>
                            <div className="text-gray-400 text-xs pixel-font mt-1">IDEAS</div>
                          </div>
                          <div className="bg-[#1b1b1b] rounded p-3 text-center">
                            <div className="text-green-400 text-xl pixel-font">{member.stats.votesCast}</div>
                            <div className="text-gray-400 text-xs pixel-font mt-1">VOTES</div>
                          </div>
                          <div className="bg-[#1b1b1b] rounded p-3 text-center">
                            <div className="text-purple-400 text-xl pixel-font">{member.stats.repliesMade}</div>
                            <div className="text-gray-400 text-xs pixel-font mt-1">REPLIES</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // IDEAS VIEW (CHAT/PROCEED/HOLD/DISCARD)
          <div>
        <div className="bg-[#111111]/90 border-4 border-gray-700 rounded-lg p-4 mb-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search ideas by title, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 pr-10 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 pixel-font text-xs border-2 rounded transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-cyan-600 border-cyan-400 text-white'
                  : 'bg-[#1b1b1b] border-gray-600 text-gray-400 hover:border-cyan-400'
              }`}
            >
              🎛️ FILTERS {hasActiveFilters && '●'}
            </button>
          </div>

          {/* Filter Options (Collapsible) */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-gray-700">
              {/* Author Filter */}
              <div>
                <label className="block text-white text-xs pixel-font mb-2">FILTER BY AUTHOR:</label>
                <select
                  value={filterAuthor}
                  onChange={(e) => setFilterAuthor(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
                >
                  <option value="">All Authors</option>
                  {getUniqueAuthors().map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-white text-xs pixel-font mb-2">SORT BY:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="votes">Most Votes</option>
                  <option value="replies">Most Replies</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full px-4 py-2 bg-red-600 text-white pixel-font text-xs border-2 border-red-400 rounded hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗑️ CLEAR FILTERS
                </button>
              </div>
            </div>
          )}

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-gray-700">
              {searchQuery && (
                <span className="px-3 py-1 bg-cyan-600 text-white text-xs pixel-font border-2 border-cyan-400 rounded flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-cyan-200">×</button>
                </span>
              )}
              {filterAuthor && (
                <span className="px-3 py-1 bg-purple-600 text-white text-xs pixel-font border-2 border-purple-400 rounded flex items-center gap-2">
                  Author: {filterAuthor}
                  <button onClick={() => setFilterAuthor('')} className="hover:text-purple-200">×</button>
                </span>
              )}
              {sortBy !== 'recent' && (
                <span className="px-3 py-1 bg-yellow-600 text-white text-xs pixel-font border-2 border-yellow-400 rounded flex items-center gap-2">
                  Sort: {sortBy === 'oldest' ? 'Oldest' : sortBy === 'votes' ? 'Most Votes' : 'Most Replies'}
                  <button onClick={() => setSortBy('recent')} className="hover:text-yellow-200">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* RESULTS COUNT */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-sm pixel-font">
            {filteredIdeas.length} {filteredIdeas.length === 1 ? 'idea' : 'ideas'} found
            {hasActiveFilters && ` (filtered from ${ideas.filter(i => i.status === activeTab).length})`}
          </p>
        </div>

        {/* IDEAS LIST */}
        <div className="space-y-4">
          {filteredIdeas.length === 0 ? (
            <div className="bg-[#111111]/90 border-4 border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400 pixel-font mb-4">
                {hasActiveFilters
                  ? '🔍 No ideas match your filters'
                  : activeTab === 'chat' ? 'No ideas yet. Create one!' : `No ideas in ${activeTab.toUpperCase()}`
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-cyan-600 text-white pixel-font text-xs border-2 border-cyan-400 rounded hover:bg-cyan-500"
                >
                  CLEAR FILTERS
                </button>
              )}
            </div>
          ) : (
            filteredIdeas.map((idea) => {
              const userVote = getUserVote(idea);
              const voteCounts = getVoteCounts(idea);
              const daysUntilDeletion = getDaysUntilDeletion(idea);

              return (
                <div key={idea._id} className="bg-[#111111]/90 border-4 border-white rounded-lg p-6">
                  {editingIdea === idea._id ? (
                    // EDIT MODE
                    <div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#2a2a2a] text-white text-lg px-4 py-2 mb-3 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
                        placeholder="Title..."
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={4}
                        className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-2 mb-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400"
                        placeholder="Content..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditIdea(idea._id)}
                          className="px-4 py-2 bg-green-600 text-white pixel-font text-xs border-2 border-green-400 rounded hover:bg-green-500"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => {
                            setEditingIdea(null);
                            setEditTitle('');
                            setEditContent('');
                          }}
                          className="px-4 py-2 bg-gray-700 text-white pixel-font text-xs border-2 border-gray-600 rounded hover:bg-gray-600"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    // NORMAL VIEW
                    <>
                      {/* IDEA HEADER */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl text-white pixel-font mb-2">
                            {idea.title}
                            {idea.isEdited && (
                              <span className="text-gray-500 text-xs ml-2">(edited)</span>
                            )}
                          </h3>
                          <p className="text-gray-400 text-xs pixel-font">
                            by {idea.userName} • {new Date(idea.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {idea.status !== 'chat' && (
                            <span className={`px-3 py-1 pixel-font text-xs border-2 rounded ${
                              idea.status === 'proceed' ? 'bg-green-600 border-green-400' :
                              idea.status === 'hold' ? 'bg-yellow-600 border-yellow-400' :
                              'bg-red-600 border-red-400'
                            } text-white`}>
                              {idea.status.toUpperCase()}
                            </span>
                          )}
                          {daysUntilDeletion !== null && (
                            <span className="px-2 py-1 bg-red-900 border-2 border-red-700 rounded text-xs pixel-font text-red-300">
                              🗑️ Deletes in {daysUntilDeletion}d
                            </span>
                          )}
                          {/* Edit/Delete buttons for author */}
                          {idea.userName === session?.user?.name && idea.status === 'chat' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingIdea(idea._id);
                                  setEditTitle(idea.title);
                                  setEditContent(idea.content);
                                }}
                                className="px-2 py-1 bg-blue-600 text-white pixel-font text-xs border-2 border-blue-400 rounded hover:bg-blue-500"
                              >
                                ✏️ EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteIdea(idea._id)}
                                className="px-2 py-1 bg-red-600 text-white pixel-font text-xs border-2 border-red-400 rounded hover:bg-red-500"
                              >
                                🗑️ DELETE
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* IDEA CONTENT */}
                      <p className="text-white text-sm mb-4">{idea.content}</p>

                      {/* VOTING BUTTONS - Only show in chat tab */}
                      {activeTab === 'chat' && (
                        <div className="flex gap-3 mb-4">
                          <button
                            onClick={() => handleVote(idea._id, 'proceed')}
                            className={`flex-1 px-4 py-2 pixel-font text-xs border-2 rounded transition-all ${
                              userVote === 'proceed'
                                ? 'bg-green-600 border-green-400 text-white'
                                : 'bg-[#1b1b1b] border-gray-600 text-gray-400 hover:border-green-400'
                            }`}
                          >
                            ✅ PROCEED ({voteCounts.proceed}/{community?.memberCount})
                          </button>
                          <button
                            onClick={() => handleVote(idea._id, 'hold')}
                            className={`flex-1 px-4 py-2 pixel-font text-xs border-2 rounded transition-all ${
                              userVote === 'hold'
                                ? 'bg-yellow-600 border-yellow-400 text-white'
                                : 'bg-[#1b1b1b] border-gray-600 text-gray-400 hover:border-yellow-400'
                            }`}
                          >
                            ⏸️ HOLD ({voteCounts.hold}/{community?.memberCount})
                          </button>
                          <button
                            onClick={() => handleVote(idea._id, 'discard')}
                            className={`flex-1 px-4 py-2 pixel-font text-xs border-2 rounded transition-all ${
                              userVote === 'discard'
                                ? 'bg-red-600 border-red-400 text-white'
                                : 'bg-[#1b1b1b] border-gray-600 text-gray-400 hover:border-red-400'
                            }`}
                          >
                            ❌ DISCARD ({voteCounts.discard}/{community?.memberCount})
                          </button>
                        </div>
                      )}

                      {/* REPLIES */}
                      {idea.replies.length > 0 && (
                        <div className="border-t-2 border-gray-700 pt-4 mt-4 space-y-3">
                          {idea.replies.map((reply) => (
                            <div key={reply._id}>
                              {editingReply === reply._id ? (
                                // EDIT REPLY MODE
                                <div className="bg-[#1b1b1b] rounded p-3">
                                  <textarea
                                    value={editReplyContent}
                                    onChange={(e) => setEditReplyContent(e.target.value)}
                                    rows={2}
                                    className="w-full bg-[#2a2a2a] text-white text-sm px-3 py-2 mb-2 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditReply(idea._id, reply._id)}
                                      className="px-3 py-1 bg-green-600 text-white pixel-font text-xs border-2 border-green-400 rounded hover:bg-green-500"
                                    >
                                      SAVE
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingReply(null);
                                        setEditReplyContent('');
                                      }}
                                      className="px-3 py-1 bg-gray-700 text-white pixel-font text-xs border-2 border-gray-600 rounded hover:bg-gray-600"
                                    >
                                      CANCEL
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                // NORMAL REPLY VIEW
                                <div className="bg-[#1b1b1b] rounded p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <p className="text-cyan-400 text-xs pixel-font">{reply.userName}</p>
                                    {reply.userName === session?.user?.name && activeTab === 'chat' && (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingReply(reply._id);
                                            setEditReplyContent(reply.content);
                                          }}
                                          className="text-blue-400 text-xs hover:text-blue-300"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          onClick={() => handleDeleteReply(idea._id, reply._id)}
                                          className="text-red-400 text-xs hover:text-red-300"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-gray-300 text-sm">{reply.content}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* REPLY INPUT - Only show in chat tab */}
                      {activeTab === 'chat' && (
                        <div className="mt-4 flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a reply..."
                            value={selectedIdea?._id === idea._id ? replyContent : ''}
                            onChange={(e) => {
                              setSelectedIdea(idea);
                              setReplyContent(e.target.value);
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleReply(idea._id);
                              }
                            }}
                            className="flex-1 bg-[#2a2a2a] text-white text-sm px-4 py-2 border-2 border-gray-600 rounded pixel-font focus:outline-none focus:border-cyan-400"
                          />
                          <button
                            onClick={() => handleReply(idea._id)}
                            className="px-4 py-2 bg-cyan-600 text-white pixel-font text-xs border-2 border-cyan-400 rounded hover:bg-cyan-500"
                          >
                            REPLY
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
          </div>
        )}
      </div>

      {/* NEW IDEA MODAL */}
      {showNewIdeaModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border-4 border-white rounded-lg p-8 max-w-2xl w-full pixel-font">
            <h2 className="text-2xl text-white mb-6 drop-shadow-neon">CREATE NEW IDEA</h2>
            
            <div className="mb-4">
              <label className="block text-white text-sm mb-2">TITLE:</label>
              <input
                type="text"
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400"
                placeholder="Enter idea title..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm mb-2">DESCRIPTION:</label>
              <textarea
                value={newIdeaContent}
                onChange={(e) => setNewIdeaContent(e.target.value)}
                rows={6}
                className="w-full bg-[#2a2a2a] text-white text-sm px-4 py-3 border-2 border-gray-600 rounded focus:outline-none focus:border-cyan-400"
                placeholder="Describe your idea..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowNewIdeaModal(false);
                  setNewIdeaTitle('');
                  setNewIdeaContent('');
                }}
                className="flex-1 px-6 py-3 bg-gray-700 text-white pixel-font border-4 border-gray-600 rounded-lg hover:bg-gray-600"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateIdea}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white pixel-font border-4 border-cyan-400 rounded-lg hover:bg-cyan-500"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
        }

        .drop-shadow-neon {
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.8), 0 0 16px rgba(0, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}