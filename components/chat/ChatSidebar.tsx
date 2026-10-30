'use client'

/**
 * @fileoverview ChatSidebar – LibreChat-style dual-panel sidebar
 *
 * Layout: [narrow icon rail ~48px] + [conversation list panel ~240px]
 * The icon rail has nav icons (chat, tools, agents, bookmarks, etc.)
 * The conversation panel has search, model filter tabs, and grouped chat history.
 */

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Clock3,
  Edit3,
  Folder,
  FolderOpen,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  PenLine,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings2,
  Trash2,
  User,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import { LoomIcon } from '@/components/ui/LoomIcon'
import { useSidebar } from '@/components/layout/useSidebar'
import { Conversation } from './types'

interface ChatSidebarProps {
  open: boolean
  onClose: () => void
  conversations: Conversation[]
  activeConvId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  onPinConversation: (id: string) => void
  onRenameConversation: (id: string, title: string) => void
}

// ----- Icon Rail Nav -----
interface RailItem {
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
}

function RailButton({ item }: { item: RailItem }) {
  const content = (
    <div
      title={item.label}
      className={`group relative flex size-9 items-center justify-center rounded-xl transition-all duration-150 ${
        item.active
          ? 'bg-white/[0.1] text-foreground'
          : 'text-muted-foreground hover:bg-white/[0.07] hover:text-foreground'
      }`}
    >
      <item.icon className="size-[18px]" strokeWidth={1.7} />
    </div>
  )

  if (item.href) {
    return <Link href={item.href} onClick={item.onClick}>{content}</Link>
  }
  return <button onClick={item.onClick}>{content}</button>
}

// ----- Conversation grouping -----
function groupConversations(convs: Conversation[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const lastWeek = new Date(today.getTime() - 7 * 86400000)
  const lastMonth = new Date(today.getTime() - 30 * 86400000)

  const pinned = convs.filter(c => c.pinned)
  const unpinned = convs.filter(c => !c.pinned)

  const todayItems = unpinned.filter(c => new Date(c.updatedAt) >= today)
  const yesterdayItems = unpinned.filter(c => new Date(c.updatedAt) >= yesterday && new Date(c.updatedAt) < today)
  const lastWeekItems = unpinned.filter(c => new Date(c.updatedAt) >= lastWeek && new Date(c.updatedAt) < yesterday)
  const lastMonthItems = unpinned.filter(c => new Date(c.updatedAt) >= lastMonth && new Date(c.updatedAt) < lastWeek)
  const olderItems = unpinned.filter(c => new Date(c.updatedAt) < lastMonth)

  const groups: { label: string; items: Conversation[] }[] = []
  if (pinned.length > 0) groups.push({ label: 'Pinned', items: pinned })
  if (todayItems.length > 0) groups.push({ label: 'Today', items: todayItems })
  if (yesterdayItems.length > 0) groups.push({ label: 'Yesterday', items: yesterdayItems })
  if (lastWeekItems.length > 0) groups.push({ label: 'Previous 7 days', items: lastWeekItems })
  if (lastMonthItems.length > 0) groups.push({ label: 'Previous 30 days', items: lastMonthItems })
  if (olderItems.length > 0) groups.push({ label: 'Older', items: olderItems })

  return groups
}

// ----- Conversation Item -----
interface ConvItemProps {
  conv: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onPin: () => void
  onRename: (title: string) => void
}

function ConvItem({ conv, isActive, onSelect, onDelete, onPin, onRename }: ConvItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conv.title)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function submitRename() {
    const t = editTitle.trim()
    if (t && t !== conv.title) onRename(t)
    setEditing(false)
  }

  // Model icon — simple letter badge based on model name
  const modelLetter = conv.model
    ? conv.model[0].toUpperCase()
    : 'L'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      className={`group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition-all duration-100 ${
        isActive
          ? 'bg-white/[0.08] text-foreground'
          : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
      }`}
    >
      {/* Model avatar badge */}
      <div className={`flex size-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold leading-none ${
        isActive ? 'bg-primary/20 text-primary' : 'bg-white/[0.06] text-muted-foreground'
      }`}>
        {modelLetter}
      </div>

      {editing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={submitRename}
          onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditing(false) }}
          className="flex-1 bg-transparent text-[12px] font-medium outline-none text-foreground"
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-[12px] font-medium leading-5 select-none">
          {conv.title}
        </span>
      )}

      {/* Pin indicator */}
      {conv.pinned && (
        <Pin className="size-2.5 shrink-0 text-primary/50" />
      )}

      {/* Context menu */}
      <div className="relative shrink-0" ref={menuRef} onClick={e => e.stopPropagation()}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(p => !p) }}
          className={`flex size-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100 ${menuOpen || isActive ? 'opacity-100' : ''}`}
        >
          <MoreHorizontal className="size-3" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-[60] mt-1 w-40 rounded-xl border border-white/[0.1] bg-[#111114] p-1.5 shadow-2xl">
            <button
              onClick={() => { setEditing(true); setMenuOpen(false) }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground hover:bg-white/[0.07]"
            >
              <Edit3 className="size-3 text-muted-foreground" /> Rename
            </button>
            <button
              onClick={() => { onPin(); setMenuOpen(false) }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground hover:bg-white/[0.07]"
            >
              {conv.pinned ? <PinOff className="size-3 text-muted-foreground" /> : <Pin className="size-3 text-muted-foreground" />}
              {conv.pinned ? 'Unpin' : 'Pin'}
            </button>
            <div className="my-1 h-px bg-white/[0.06]" />
            <button
              onClick={() => { onDelete(); setMenuOpen(false) }}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="size-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ----- Main ChatSidebar -----
export function ChatSidebar({
  open,
  onClose,
  conversations,
  activeConvId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onPinConversation,
  onRenameConversation,
}: ChatSidebarProps) {
  const { showUserMenu, setShowUserMenu, logout, isLoading, initials, displayName, userSubtext, user } = useSidebar()
  const [search, setSearch] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)
  const pathname = usePathname()

  const filtered = search.trim()
    ? conversations.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : conversations

  const groups = groupConversations(filtered)

  const railItems: RailItem[] = [
    { icon: MessageSquare, label: 'Chat', onClick: () => { setPanelOpen(p => !p) }, active: pathname === '/home' || pathname === '/' },
    { icon: Wrench, label: 'Tools', href: '/tools' },
    { icon: Bot, label: 'Agents', href: '/agents' },
    { icon: Bookmark, label: 'History', href: '/history' },
    { icon: Zap, label: 'Models', href: '/models' },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Outer wrapper: rail + panel */}
      <div className={`
        fixed inset-y-0 left-0 z-40 flex
        transition-transform duration-200
        md:static md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* ── Icon Rail ── */}
        <div className="flex w-[52px] shrink-0 flex-col items-center border-r border-white/[0.05] bg-[#0c0c0e] py-3">
          {/* Logo */}
          <Link href="/home" className="mb-5 flex size-9 items-center justify-center rounded-xl hover:bg-white/[0.06] transition-colors">
            <LoomIcon className="size-5 text-primary" />
          </Link>

          {/* Nav icons */}
          <div className="flex flex-1 flex-col items-center gap-1">
            {railItems.map(item => (
              <RailButton key={item.label} item={item} />
            ))}
          </div>

          {/* New chat at bottom of rail */}
          <button
            onClick={onNewConversation}
            title="New conversation"
            className="mb-2 flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-white/[0.07] hover:text-foreground"
          >
            <Plus className="size-[18px]" strokeWidth={1.7} />
          </button>

          {/* User avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(p => !p)}
              title={displayName}
              className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary ring-1 ring-primary/20 transition-all hover:ring-primary/50"
            >
              {isLoading ? '…' : initials}
            </button>
            {showUserMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-44 rounded-xl border border-white/[0.1] bg-[#111114] p-1.5 shadow-2xl">
                <div className="mb-1 px-2.5 py-1.5">
                  <p className="truncate text-[11px] font-medium text-foreground">{displayName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{userSubtext}</p>
                </div>
                <div className="my-1 h-px bg-white/[0.06]" />
                {user ? (
                  <button
                    onClick={() => { setShowUserMenu(false); logout() }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="size-3" /> Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-foreground hover:bg-white/[0.07]"
                  >
                    <User className="size-3 text-muted-foreground" /> Sign in
                  </Link>
                )}
                <Link
                  href="/models"
                  onClick={() => setShowUserMenu(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-muted-foreground hover:bg-white/[0.07] hover:text-foreground"
                >
                  <Settings2 className="size-3" /> Settings
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Conversation Panel ── */}
        <div className={`
          flex w-[240px] shrink-0 flex-col bg-[#0e0e10] border-r border-white/[0.05]
          transition-all duration-200 overflow-hidden
          ${panelOpen ? 'w-[240px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}
        `}>
          {/* Panel header */}
          <div className="flex items-center justify-between px-3 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-3.5 text-muted-foreground" strokeWidth={1.7} />
              <span className="text-[12px] font-semibold text-foreground tracking-[-0.01em]">Chats</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </div>
            <button
              onClick={onNewConversation}
              title="New conversation"
              className="flex size-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground"
            >
              <PenLine className="size-3.5" strokeWidth={1.7} />
            </button>
          </div>

          {/* Search */}
          <div className="px-2.5 pb-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.05] px-2.5 py-1.5">
              <Search className="size-3 shrink-0 text-muted-foreground/60" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/40"
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X className="size-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <MessageSquare className="size-7 text-muted-foreground/20" />
                <p className="text-[11px] text-muted-foreground/40">
                  {search ? 'No results' : 'No chats yet'}
                </p>
              </div>
            ) : (
              groups.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="mb-1 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/40">
                    {group.label}
                  </p>
                  {group.items.map(conv => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      onSelect={() => { onSelectConversation(conv.id); onClose() }}
                      onDelete={() => onDeleteConversation(conv.id)}
                      onPin={() => onPinConversation(conv.id)}
                      onRename={title => onRenameConversation(conv.id, title)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
