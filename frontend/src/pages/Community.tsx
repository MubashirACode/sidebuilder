import { useEffect, useState } from "react"
import type { Project } from "../types"
import { Loader2Icon } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import Footer from "../components/Footer"
import api from "@/configs/axios"
import { toast } from "sonner"

const Community = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(false)

      const { data } = await api.get('/api/project/published')
      
      // ✅ Safety check
      if (data && Array.isArray(data.projects)) {
        setProjects(data.projects)
      } else if (Array.isArray(data)) {
        // ✅ Agar backend seedha array bhej raha hai
        setProjects(data)
      } else {
        setProjects([])
      }

      setLoading(false)

    } catch (error: any) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message)
      setProjects([]) // ✅ Error pe empty array
      setError(true)
      setLoading(false) // ✅ IMPORTANT: Loading false karo
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="px-4 md:px-16 lg:px-24 xl:px-32">
      {loading ? (
        // Loading State
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2Icon className="size-7 animate-spin text-indigo-200" />
        </div>
      ) : error ? (
        // ✅ Error State
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl font-semibold text-gray-300">Failed to load projects</h1>
          <p className="text-gray-500 mt-2">Please try again later</p>
          <button 
            onClick={fetchProjects} 
            className="text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
          >
            Retry
          </button>
        </div>
      ) : projects.length > 0 ? (
        // Projects List
        <div className="py-10 min-h-[80vh]">
          <div className="flex items-center justify-between mb-12">
            <h1 className="text-2xl font-medium text-white">Published Projects</h1>
          </div>

          <div className="flex flex-wrap gap-3.5">
            {projects.map((project) => (
              <Link 
                to={`/view/${project.id}`} 
                target="_blank" // ✅ Fixed typo: "_blak" → "_blank"
                className="w-72 max-sm:mx-auto cursor-pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden group hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300" 
                key={project.id}
              >
                {/* Desktop-like Mini Preview */}
                <div className="relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800">
                  {project.current_code ? (
                    <iframe 
                      srcDoc={project.current_code} 
                      className="absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none" 
                      sandbox="allow-scripts allow-same-origin" 
                      style={{ transform: 'scale(0.25)' }} 
                      title={`Preview of ${project.name}`} // ✅ Accessibility
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No Preview</p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition-colors">
                  <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium line-clamp-2">{project.name}</h2>
                    <span className="px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full whitespace-nowrap">
                      Website
                    </span>
                  </div>

                  <p className="text-gray-400 mt-1 text-sm line-clamp-2">
                    {project.initial_prompt}
                  </p>

                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex gap-3 text-white text-sm">
                      <div className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md transition-colors flex items-center gap-2">
                        <span className="bg-gray-200 size-4.5 rounded-full text-black font-semibold flex items-center justify-center text-xs">
                          {project.user?.name?.slice(0, 1)?.toUpperCase() || '?'}
                        </span>
                        <span className="max-w-20 truncate">
                          {project.user?.name || 'Anonymous'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h1 className="text-3xl font-semibold text-gray-300">
            No published projects yet
          </h1>
          <p className="text-gray-500 mt-2">Be the first to publish a project!</p>
          <button 
            onClick={() => navigate('/')} 
            className="text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all"
          >
            Create New Project
          </button>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Community