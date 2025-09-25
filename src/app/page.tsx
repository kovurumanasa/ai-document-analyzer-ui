'use client'

import React, { useState } from 'react'
import AgenticView from '../components/AgenticView'
import ChatInterface from '../components/ChatInterface'
import ToolPanel from '../components/ToolPanel'

export default function AIAgentOS() {
  const [steps, setSteps] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeView, setActiveView] = useState<'reasoning' | 'tools'>('reasoning')

  const handleUserInput = async (input: string, files?: File[]) => {
    if (!input.trim() && (!files || files.length === 0)) return
    
    setIsProcessing(true)
    setSteps([])
    setActiveView('reasoning') // Switch to reasoning view when processing starts
    
    const fileText = files && files.length > 0 ? ` [${files.length} file(s) attached]` : ''
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: input + fileText
    }])

    try {
      const formData = new FormData()
      formData.append('input', input)
      
      if (files) {
        files.forEach((file, index) => {
          formData.append(`file-${index}`, file)
        })
        formData.append('fileCount', files.length.toString())
      }

      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to process request')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const msg = JSON.parse(line.slice(6))
              
              if (msg.type === 'step-update') {
                setSteps(prev => {
                  const existing = prev.findIndex(s => s.id === msg.data.id)
                  if (existing >= 0) {
                    const updated = [...prev]
                    updated[existing] = msg.data
                    return updated
                  }
                  return [...prev, msg.data]
                })
              } else if (msg.type === 'complete') {
                setMessages(prev => [...prev, { 
                  type: 'assistant', 
                  content: msg.data 
                }])
                setIsProcessing(false)
                return
              } else if (msg.type === 'error') {
                setMessages(prev => [...prev, { 
                  type: 'error', 
                  content: msg.data 
                }])
                setIsProcessing(false)
                return
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${error.message}` 
      }])
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Document Analysis OS
          </h1>
          <p className="text-lg text-gray-600">
            Professional AI-powered document analysis with integrated tool suite
          </p>
        </div> */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chat Interface */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Chat & Upload Interface
            </h2>
            <ChatInterface 
              messages={messages}
              onSendMessage={handleUserInput}
              isProcessing={isProcessing}
            />
          </div>
          
          {/* Right Column - Agent View and Tools */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="mb-4">
              <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveView('reasoning')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'reasoning'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Agent Reasoning
                  {steps.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {steps.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveView('tools')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'tools'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tools Panel
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeView === 'reasoning' ? (
              <AgenticView 
                steps={steps}
                isProcessing={isProcessing}
              />
            ) : (
              <ToolPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
