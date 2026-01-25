import React, { useEffect, useRef, useState } from 'react'
import type { Message, Project, Version } from '../types';
import { BotIcon, CheckIcon, CopyIcon, EyeIcon, Loader2Icon, SendIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/configs/axios';
import { toast } from 'sonner';
import Prism from 'prismjs';
// ✅ Import custom CSS instead

import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

interface SidebarProps {
    isMenuOpen: boolean;
    project: Project,
    setProject: (project: Project) => void;
    isGenerating: boolean;
    setIsGenerating: (isGenerating: boolean) => void;
}

const Sidebar = ({ isMenuOpen, project, setProject, isGenerating, setIsGenerating }: SidebarProps) => {
    const messageRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const fetchProject = async () => {
        try {
            const { data } = await api.get(`/api/user/project/${project.id}`)
            setProject(data.project)
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
            console.log(error)
        }
    }

    const handleRollback = async (versionId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to rollback to this version?')
            if (!confirm) return;
            setIsGenerating(true)
            const { data } = await api.get(`/api/project/rollback/${project.id}/${versionId}`)
            const { data: data2 } = await api.get(`/api/user/project/${project.id}`)
            toast.success(data.message)
            setProject(data2.project)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false)
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
        }
    }

    const handleRevisions = async (e: React.FormEvent) => {
        e.preventDefault()
        let interval: number | undefined;

        try {
            setIsGenerating(true)
            interval = setInterval(() => {
                fetchProject();
            }, 10000)

            const { data } = await api.post(`/api/project/revision/${project.id}`, { message: input })
            fetchProject();
            toast.success(data.message)
            setInput('')
            clearInterval(interval)
            setIsGenerating(false)
        } catch (error: any) {
            setIsGenerating(false)
            toast.error(error?.response?.data?.message || error.message);
            console.log(error)
            clearInterval(interval)
        }
    }

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)
            toast.success('Copied to clipboard!')
            setTimeout(() => setCopiedId(null), 2000)
        } catch (error) {
            toast.error('Failed to copy')
        }
    }

    const isCodeMessage = (content: string) => {
        const codePatterns = [
            /<html/i, /<!DOCTYPE/i, /<script/i, /<style/i,
            /function\s+\w+/, /const\s+\w+/, /let\s+\w+/,
            /class\s+\w+/, /import\s+/, /export\s+/
        ]
        return codePatterns.some(pattern => pattern.test(content))
    }

    const detectLanguage = (content: string) => {
        if (/<html/i.test(content) || /<!DOCTYPE/i.test(content)) return 'markup';
        if (/@import|@media|@keyframes|\{[\s\S]*:[^:]+;/i.test(content)) return 'css';
        if (/import.*from|export|const\s+\w+\s*=|interface|type/i.test(content)) return 'javascript';
        return 'markup';
    }

    useEffect(() => {
        Prism.highlightAll();
    }, [project.conversation?.length, isGenerating])

    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [project.conversation?.length, isGenerating])

    return (
        <div className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border border-gray-800 transition-all ${isMenuOpen ? 'max-sm:w-0 overflow-hidden' : 'w-full'}`}>
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold text-white">Chat History</h2>
                    <p className="text-xs text-gray-400 mt-1">Conversations & Versions</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 flex flex-col gap-4">
                    {[...project.conversation, ...project.versions]
                        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                        .map((message) => {
                            const isMessage = 'content' in message;

                            if (isMessage) {
                                const msg = message as Message;
                                const isUser = msg.role === 'user';
                                const hasCode = isCodeMessage(msg.content);
                                const language = detectLanguage(msg.content);

                                return (
                                    <div 
                                        className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"}`} 
                                        key={msg.id}
                                    >
                                        {!isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                <BotIcon className='size-4 text-white' />
                                            </div>
                                        )}

                                        <div className={`max-w-[85%] rounded-2xl shadow-lg overflow-hidden ${
                                            isUser 
                                                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none" 
                                                : "rounded-tl-none bg-gray-800/80 backdrop-blur-sm border border-gray-700/50"
                                        }`}>
                                            {hasCode && !isUser ? (
                                                <div className="relative">
                                                    {/* Code header */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e1e] border-b border-gray-700/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-1.5">
                                                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                                                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                                            </div>
                                                            <span className="text-xs text-gray-400 font-mono ml-2">
                                                                {language === 'markup' ? 'HTML' : language.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(msg.content, msg.id)}
                                                            className="p-1.5 hover:bg-gray-700 rounded transition-colors flex items-center gap-1.5"
                                                        >
                                                            {copiedId === msg.id ? (
                                                                <>
                                                                    <CheckIcon className="size-3.5 text-green-400" />
                                                                    <span className="text-xs text-green-400">Copied!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CopyIcon className="size-3.5 text-gray-400" />
                                                                    <span className="text-xs text-gray-400">Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    {/* Code content */}
                                                    <pre className="language-{language}">
                                                        <code className={`language-${language}`}>{msg.content}</code>
                                                    </pre>
                                                </div>
                                            ) : (
                                                <div className="p-3 px-4 text-sm leading-relaxed whitespace-pre-wrap text-gray-100">
                                                    {msg.content}
                                                </div>
                                            )}
                                        </div>

                                        {isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <UserIcon className='size-4 text-gray-200' />
                                            </div>
                                        )}
                                    </div>
                                )
                            } else {
                                const ver = message as Version;
                                return (
                                    <div 
                                        key={ver.id} 
                                        className="w-11/12 mx-auto my-2 p-3 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 text-gray-100 shadow-lg"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                <span className="text-xs text-indigo-400">V</span>
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                Version Update • {new Date(ver.timestamp).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-3">
                                            {project.current_version_index === ver.id ? (
                                                <button className='px-3 py-1.5 rounded-md text-xs bg-green-600/20 text-green-400 border border-green-600/30 font-medium'>
                                                    ✓ Current Version
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleRollback(ver.id)} 
                                                    className='px-3 py-1.5 rounded-md text-xs bg-indigo-500 hover:bg-indigo-600 text-white transition-colors font-medium'
                                                >
                                                    Rollback
                                                </button>
                                            )}

                                            <Link to={`/preview/${project.id}/${ver.id}`} target='_blank'>
                                                <button className="p-1.5 bg-gray-700 hover:bg-indigo-500 transition-colors rounded group">
                                                    <EyeIcon className='size-4 text-gray-300 group-hover:text-white' />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }

                    {isGenerating && (
                        <div className="flex items-start gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                                <BotIcon className='size-4 text-white' />
                            </div>
                            <div className="flex gap-1.5 items-center bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-none">
                                <span className='w-2 h-2 rounded-full animate-bounce bg-indigo-400' style={{ animationDelay: '0s' }} />
                                <span className='w-2 h-2 rounded-full animate-bounce bg-indigo-400' style={{ animationDelay: '0.2s' }} />
                                <span className='w-2 h-2 rounded-full animate-bounce bg-indigo-400' style={{ animationDelay: '0.4s' }} />
                            </div>
                        </div>
                    )}

                    <div ref={messageRef} />
                </div>

                <form onSubmit={handleRevisions} className="p-3 border-t border-gray-800">
                    <div className="relative">
                        <textarea 
                            onChange={(e) => setInput(e.target.value)} 
                            value={input} 
                            rows={3} 
                            placeholder='Describe changes or request modifications...' 
                            className='w-full p-3 pr-12 rounded-xl resize-none text-sm outline-none ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-100 placeholder-gray-500 transition-all' 
                            disabled={isGenerating}
                        />
                        <button 
                            type="submit"
                            disabled={isGenerating || !input.trim()} 
                            className='absolute bottom-2 right-2 p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isGenerating ? (
                                <Loader2Icon className='size-5 animate-spin' />
                            ) : (
                                <SendIcon className='size-5' />
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Sidebar