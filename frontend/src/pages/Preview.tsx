import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

import { Loader2Icon } from 'lucide-react';
import type { Project, Version } from '../types';
import ProjectPreview from '../components/ProjectPreview';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const Preview = () => {
  const { data: session, isPending } = authClient.useSession()
  const { projectId, versionId } = useParams();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true)


  const fetchCode = async () => {



    try {

      const { data } = await api.get(`/api/project/preview/${projectId}`)
      setCode(data.current_code)
      console.log(data)
      if (versionId) {
        data.project.versions.forEach((version: Version) => {
          if (version.id === versionId) {
            setCode(version.code)
          }
        })
      }

      setLoading(false)
     
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error , "please solve it")


    }




  }


  useEffect(() => {


    if (!isPending && session?.user) {
      fetchCode()

    }


  }, [session?.user])




  if (loading) {
    return (

      <div className="flex items-center justify-center h-screen">
        <Loader2Icon className='size-7 animate-spin text-indigo-200 ' />
      </div>


    )
  }

  return (






    <div className='h-screen'>
      {code && <ProjectPreview project={{ current_code: code } as Project} isGenerating={false} showEditorPanel={false} />}
    </div>
  )
}

export default Preview