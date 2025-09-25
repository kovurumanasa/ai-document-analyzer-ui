'use client'

import { useState } from 'react'
import { FileText, BarChart3, Shield, Globe, ExternalLink, Settings } from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  url: string
  status: 'online' | 'offline' | 'busy'
  icon: React.ReactNode
  color: string
}

export default function ToolPanel() {
  const [tools] = useState<Tool[]>([
    {
      id: 'pdf-parser',
      name: 'PDF Parser',
      description: 'Extract text and metadata from PDF documents',
      url: 'http://localhost:3002/ui',
      status: 'online',
      icon: <FileText className="h-5 w-5" />,
      color: 'red'
    },
    {
      id: 'document-analyzer',
      name: 'Document Analyzer',
      description: 'AI-powered comprehensive document analysis',
      url: 'http://localhost:3007/ui',
      status: 'online',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'blue'
    },
    {
      id: 'compliance-checker',
      name: 'Compliance Checker',
      description: 'Check documents against regulatory standards',
      url: 'http://localhost:3008/ui',
      status: 'online',
      icon: <Shield className="h-5 w-5" />,
      color: 'green'
    },
    {
      id: 'web-scraper',
      name: 'Web Scraper',
      description: 'Extract data from web pages and APIs',
      url: 'http://localhost:3003/ui',
      status: 'offline',
      icon: <Globe className="h-5 w-5" />,
      color: 'purple'
    }
  ])

  const openTool = (url: string) => {
    window.open(url, '_blank', 'width=1000,height=700')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Tools</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg bg-${tool.color}-100 text-${tool.color}-600`}>
                {tool.icon}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(tool.status)}`}></div>
                <span className="text-xs text-gray-500 capitalize">{tool.status}</span>
              </div>
            </div>

            <h3 className="font-medium text-gray-900 mb-1">{tool.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => openTool(tool.url)}
                disabled={tool.status === 'offline'}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Open</span>
              </button>
              <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">System Status</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-600">Active Tools:</span>
            <span className="font-medium ml-2">
              {tools.filter(t => t.status === 'online').length}
            </span>
          </div>
          <div>
            <span className="text-blue-600">Processing:</span>
            <span className="font-medium ml-2">
              {tools.filter(t => t.status === 'busy').length}
            </span>
          </div>
          <div>
            <span className="text-blue-600">Offline:</span>
            <span className="font-medium ml-2">
              {tools.filter(t => t.status === 'offline').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
