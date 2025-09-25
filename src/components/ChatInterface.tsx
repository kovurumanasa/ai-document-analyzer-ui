'use client'

import { useState, KeyboardEvent } from 'react'
import { Send, Paperclip, X } from 'lucide-react'

interface Message {
  type: 'user' | 'assistant' | 'error'
  content: string
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (text: string, files?: File[]) => void
  isProcessing: boolean
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isProcessing,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const send = () => {
    if (!input.trim() && files.length === 0) return
    onSendMessage(input, files)
    setInput('')
    setFiles([])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.type === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.type === 'assistant'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="text-left">
            <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">AI is analyzing...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File preview */}
      {files.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Attached Files ({files.length}):
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to analyze or ask about your documents..."
          className="w-full border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          disabled={isProcessing}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || [])
                  setFiles(prev => [...prev, ...newFiles])
                  e.target.value = '' // Reset input
                }}
                className="hidden"
              />
              <div className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                <Paperclip className="h-4 w-4" />
                <span>Attach Files</span>
              </div>
            </label>
          </div>

          <button
            onClick={send}
            disabled={isProcessing || (!input.trim() && files.length === 0)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Analyze</span>
          </button>
        </div>
      </div>
    </div>
  )
}
