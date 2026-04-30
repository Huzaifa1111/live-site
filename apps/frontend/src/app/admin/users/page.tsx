// apps/frontend/src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  MoreVertical,
  CheckCircle,
  Filter,
  Loader2,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { userService, User } from '@/services/user.service';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load user records. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const nameMatch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = roleFilter === 'all' || (user.role && user.role.toLowerCase() === roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const newThisMonth = users.filter(u => {
    const joinedDate = new Date(u.createdAt);
    const now = new Date();
    return joinedDate.getMonth() === now.getMonth() && joinedDate.getFullYear() === now.getFullYear();
  }).length;
  const activeUsers = users.length;

  const getRoleBadge = (role: string) => {
    const r = (role || 'customer').toLowerCase();
    switch (r) {
      case 'admin':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-emerald-600 text-white shadow-lg shadow-emerald-100"><Shield size={10} className="mr-1.5" /> Admin</span>;
      case 'moderator':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-black text-emerald-500 border border-emerald-500/20 shadow-xl"><Shield size={10} className="mr-1.5" /> Moderator</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 group-hover:bg-white group-hover:text-black transition-colors">Customer</span>;
    }
  };

  const getStatusIndicator = () => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Active</span>
      </div>
    );
  };

  const getUserAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=000&color=10b981&bold=true`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Client Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-black p-10 md:p-14 text-white shadow-2xl group">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-[1.5px] bg-emerald-500" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">User Management</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-3">User Directory</h1>
            <p className="text-gray-400 font-medium tracking-wide max-w-lg text-sm md:text-base">Manage customer accounts, roles, and overall platform permissions.</p>
          </div>
          <div className="relative z-10">
            <button className="flex items-center space-x-3 px-8 py-4 rounded-xl bg-white text-black hover:bg-emerald-600 hover:text-white font-black uppercase tracking-widest text-[9px] shadow-2xl transition-all duration-500 active:scale-95">
              <UserPlus className="w-4 h-4" />
              <span>Invite New User</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Ledger */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Total Users', value: totalUsers, icon: Users, desc: 'Registered accounts' },
          { title: 'Active Accounts', value: activeUsers, icon: CheckCircle, desc: 'Currently active' },
          { title: 'Recent Signups', value: newThisMonth, icon: UserPlus, desc: 'Past 30 days' },
        ].map((stat, index) => (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5 }}>
            <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-start mb-5">
                <div className="p-3.5 rounded-xl bg-black text-emerald-500 shadow-xl transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white">
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{stat.title}</p>
              <h3 className="text-3xl font-black text-black tracking-tighter mb-1.5">{stat.value}</h3>
              <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">{stat.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Operations Panel */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Search & Filters */}
        <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-emerald-500/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 h-14 bg-gray-50/50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none transition-all font-medium text-sm tracking-wide placeholder:text-gray-300"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-14 px-6 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-emerald-100 focus:outline-none font-black text-[9px] uppercase tracking-widest text-black cursor-pointer w-full sm:w-[180px]"
            >
              <option value="all">Role: All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="customer">Customer</option>
            </select>
            <button
              onClick={fetchUsers}
              className="h-14 px-6 bg-gray-50 border border-gray-100 rounded-xl text-emerald-500 hover:bg-black hover:text-white transition-all duration-300"
            >
              <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
          {error ? (
            <div className="text-center py-20 bg-red-50/20 rounded-[2rem]">
              <Shield className="w-10 h-10 text-red-300 mx-auto mb-4" />
              <h3 className="text-sm font-black text-black tracking-tight mb-2">{error}</h3>
              <button
                onClick={fetchUsers}
                className="px-6 py-3 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
              >
                Reload List
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-50">
                <thead>
                  <tr className="bg-gray-50/20">
                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">User Profile</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Role</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Joined Date</th>
                    <th className="px-6 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic text-center">No users found matching your search.</p>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          className="hover:bg-gray-50/30 transition-all duration-300 group"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 group-hover:scale-105 transition-all duration-500 shadow-sm relative grayscale group-hover:grayscale-0">
                                <img
                                  className="h-full w-full object-cover"
                                  src={getUserAvatar(user.name || user.email)}
                                  alt={user.name}
                                />
                              </div>
                              <div className="ml-4 min-w-0">
                                <div className="text-[13px] font-bold text-black tracking-tight truncate max-w-[200px] group-hover:text-emerald-600 transition-colors uppercase">{user.name || 'Anonymous user'}</div>
                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[200px]">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusIndicator()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 rounded-lg bg-white text-gray-400 hover:bg-black hover:text-white border border-gray-50 shadow-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
