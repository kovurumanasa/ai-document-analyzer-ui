'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Clock, AlertCircle, Loader2, Search, Database, FileText, Globe, Brain, ChevronDown, ChevronUp, X } from 'lucide-react'
import { AgentStep } from '../types/orchestrator'

interface AgenticViewProps {
  steps: AgentStep[]
  isProcessing: boolean
}

interface EmbeddedTool {
  stepId: string
  toolType: string
  isExpanded: boolean
  data?: any
}

export default function AgenticView({ steps, isProcessing }: AgenticViewProps) {
  const [embeddedTools, setEmbeddedTools] = useState<EmbeddedTool[]>([])
  const [activeStep, setActiveStep] = useState<string | null>(null)

  const toolConfigs = {
    'pdf-parser': { 
      name: 'PDF Parser', 
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800'
    },
    'document-analyzer': { 
      name: 'Document Analyzer', 
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800'
    },
    'compliance-checker': { 
      name: 'Compliance Checker', 
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800'
    },
    'web-scraper': { 
      name: 'Web Scraper', 
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-800'
    }
  }


  const getStepIcon = (step: AgentStep) => {
    switch (step.type) {
      case 'analysis':
        return <Brain className="h-4 w-4" />
      case 'tool':
        return <FileText className="h-4 w-4" />
      case 'search':
        return <Search className="h-4 w-4" />
      case 'processing':
        return <Database className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }


  const getStatusIcon = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }


  const detectToolFromStep = (stepName: string): string | null => {
    const stepLower = stepName.toLowerCase()
    if (stepLower.includes('pdf') || stepLower.includes('parse')) return 'pdf-parser'
    if (stepLower.includes('analyze') || stepLower.includes('document')) return 'document-analyzer'
    if (stepLower.includes('compliance') || stepLower.includes('check')) return 'compliance-checker'
    if (stepLower.includes('web') || stepLower.includes('search')) return 'web-scraper'
    return null
  }


  const toggleToolExpansion = (stepId: string) => {
    setEmbeddedTools(prev => 
      prev.map(tool => 
        tool.stepId === stepId 
          ? { ...tool, isExpanded: !tool.isExpanded }
          : tool
      )
    )
  }


  const removeEmbeddedTool = (stepId: string) => {
    setEmbeddedTools(prev => prev.filter(tool => tool.stepId !== stepId))
  }


  useEffect(() => {
    steps.forEach(step => {
      if (step.status === 'running' && step.type === 'tool') {
        const toolType = detectToolFromStep(step.name)
        setEmbeddedTools(prev => {
          if (!prev.find(t => t.stepId === step.id)) {
            return [...prev, { stepId: step.id, toolType: toolType!, isExpanded: true, data: null }]
          }
          return prev
        })
        setActiveStep(step.id)
      }


      if (step.status === 'completed' && step.type === 'tool' && step.output) {
        setEmbeddedTools(prev => prev.map(t => 
          t.stepId === step.id ? { ...t, data: step.output } : t
        ))
      }
    })
  }, [steps]) // Removed embeddedTools dependency to avoid infinite loop



  const renderToolInterface = (tool: EmbeddedTool) => {
    const config = toolConfigs[tool.toolType as keyof typeof toolConfigs]
    if (!config) return null

    // Get step to get status for loader/complete display
    const step = steps.find(s => s.id === tool.stepId)
    const isRunning = step?.status === 'running'
    const isCompleted = step?.status === 'completed'

    return (
      <div className={`mt-3 border rounded-lg ${config.borderColor} ${config.bgColor} overflow-hidden`}>
        {/* Tool Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded bg-${config.color}-500 flex items-center justify-center`}>
              <FileText className="h-3 w-3 text-white" />
            </div>
            <h4 className="font-medium text-gray-900">{config.name}</h4>
            <div className={`px-2 py-1 rounded text-xs ${config.bgColor} ${config.textColor}`}>
              Active
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleToolExpansion(tool.stepId)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {tool.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={() => removeEmbeddedTool(tool.stepId)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tool Content */}
        {tool.isExpanded && (
          <div className="p-4">
            {isRunning && (
              <div className="flex items-center space-x-2">
                <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-${config.color}-500`}></div>
                <span className="text-sm text-gray-700">Processing...</span>
              </div>
            )}
            {isCompleted && tool.data && renderToolContent(tool)}
          </div>
        )}
      </div>
    )
  }


  const renderToolContent = (tool: EmbeddedTool) => {
    const config = toolConfigs[tool.toolType as keyof typeof toolConfigs]
    console.log(tool.data,'lllllllllllllllllllllllllll')
    switch (tool.toolType) {
      case 'pdf-parser':
        return (
          <div className="space-y-3">
            {tool.data.extractedText && (
              <div>
                <span className="text-gray-600">Text Preview:</span>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
                  {tool.data.extractedText.substring(0, 200)}...
                </div>
              </div>
            )}
            {tool.data.wordCount && (
              <div><span className="text-gray-600">Word Count:</span> <span className="font-medium">{tool.data.wordCount}</span></div>
            )}
          </div>
        )


      case 'document-analyzer':
        return (
          <div className="space-y-3">
            <div className="grid  text-sm">
              <div><span className="font-medium">Summary:</span> <span className="text-gray-600">{tool.data.analysisResults.summary}</span></div>
              <div><span className="font-medium">Recommendations:</span> <span className="text-gray-600">{tool.data.analysisResults.recommendations}</span></div>
            </div>
          </div>
        )


      case 'compliance-checker':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-600">Standards Checked:</span> <span className="font-medium">{tool.data.complianceResults.summary.compliant}</span></div>
              <div><span className="text-gray-600">Overall Status:</span> <span className="font-medium text-green-600">{tool.data.complianceResults.summary.overallStatus}</span></div>
              <div><span className="text-gray-600">Actions:</span> <span className="font-medium">{tool.data.complianceResults.recommendations[0].action}</span></div>
            </div>
          </div>
        )


      case 'web-scraper':
        return (
          <div className="space-y-3">
            <div><span className="text-gray-600">Results Found:</span> <span className="font-medium">{tool.data.resultsFound || 0}</span></div>
          </div>
        )


      default:
        return <div className="text-sm text-gray-500">Tool interface loading...</div>
    }
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Brain className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Agent Reasoning</h2>
        {isProcessing && (
          <div className="ml-auto flex items-center text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Processing...</span>
          </div>
        )}
      </div>


      <div className="space-y-4">
        {steps.map((step, index) => {
          const embeddedTool = embeddedTools.find(t => t.stepId === step.id)
          
          return (
            <div 
              key={step.id} 
              className={`relative transition-all duration-200 ${
                activeStep === step.id ? 'ring-2 ring-blue-500 rounded-lg p-2' : ''
              }`}
            >
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 h-8 w-0.5 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2
                    ${step.status === 'completed' ? 'bg-green-50 border-green-200' : ''}
                    ${step.status === 'running' ? 'bg-blue-50 border-blue-200' : ''}
                    ${step.status === 'failed' ? 'bg-red-50 border-red-200' : ''}
                    ${step.status === 'pending' ? 'bg-gray-50 border-gray-200' : ''}
                  `}>
                    {getStepIcon(step)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">{step.name}</h3>
                      {getStatusIcon(step.status)}
                      {step.duration && (
                        <span className="text-xs text-gray-500">
                          ({(step.duration / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </p>
                  
                  {/* Embedded Tool Interface */}
                  {embeddedTool && renderToolInterface(embeddedTool)}
                  
                  {step.output && !embeddedTool && (
                    <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
                      <details>
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                          {typeof step.output === 'string' 
                            ? step.output 
                            : JSON.stringify(step.output, null, 2)
                          }
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {steps.length === 0 && !isProcessing && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Agent reasoning will appear here when processing starts</p>
          </div>
        )}
      </div>
    </div>
  )
}
