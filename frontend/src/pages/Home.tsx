import api from '@/configs/axios';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Home = () => {

    const { data: session } = authClient.useSession()
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const onSubmitHandler = async (e: React.FormEvent) => {
        e.preventDefault();



        try {

            if (!session?.user) {
                return toast.error('Please sign in to create a project ')
            } else if (!input.trim()) {
                return toast.error('please enter a message')
            }
            setLoading(true)
            const { data } = await api.post('/api/user/project', { initial_prompt: input });
            setLoading(false);
            navigate(`/project/${data.projectId} `)
        } catch (error: any) {
            setLoading(false)
            toast.error(error?.response?.data?.message || error.message);
            console.log(error);
        }






    }

    return (
        <>











            <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">
                {/* BACKGROUND IMAGE */}
                <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/refs/heads/main/assets/hero/bg-gradient-2.png" className="absolute inset-0 -z-10 size-full opacity" alt="" />

                <a href="https://prebuiltui.com" className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-3 text-sm mt-20">
                    <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">NEW</span>
                    <p className="flex items-center gap-2">
                        <span>Try 30 days free trial option</span>

                    </p>
                </a>

                <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
                    Turn thoughts into  Website instantly, with AI.
                </h1>

                <p className="text-center text-base max-w-md mt-2">
                    Create, customize and publish Website faster than ever with our AI Site Builder.
                </p>

                <form onSubmit={onSubmitHandler} className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all">
                    <textarea onChange={e => setInput(e.target.value)} className="bg-transparent outline-none text-gray-300 resize-none w-full" rows={4} placeholder="Describe your presentation in details" required />
                    <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2">


                        {!loading ? 'Create wih AI' : (
                            <>
                                Creating <Loader2 className='animate-spin size-4 text-white' />
                            </>
                        )}


                    </button>
                </form>

                <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20 mx-auto mt-16">
                    <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/framer.svg" alt="" />
                    <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg" alt="" />
                    <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg" alt="" />
                    <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg" alt="" />
                    <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg" alt="" />
                </div>
            </section>

        </>
    )
}

export default Home