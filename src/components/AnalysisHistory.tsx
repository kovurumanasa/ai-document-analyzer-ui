'use client'

import { useState, useEffect } from 'react'
import { Clock, File, Eye } from 'lucide-react'
import axios from 'axios'

interface HistoryItem {
  _id: string
  fileName: string
  analysisType: string
  timestamp: string
  analysis: string
}

export default function AnalysisHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3001/history')
      setHistory(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2" />
        Analysis History
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No analysis history yet. Upload and analyze a document to get started.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item._id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedItem(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <File className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.fileName}
                  </span>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize">{item.analysisType}</span>
                <span>{new Date(item.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing analysis */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium">{selectedItem.fileName}</h3>
              <p className="text-sm text-gray-500">
                {selectedItem.analysisType} • {new Date(selectedItem.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="whitespace-pre-wrap text-sm">
                {selectedItem.analysis}
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
