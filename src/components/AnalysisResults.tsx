'use client'

import { CheckCircle, AlertTriangle, FileText, Calendar } from 'lucide-react'

interface AnalysisResultsProps {
  result: {
    fileName: string
    analysisType: string
    analysis: string
    success: boolean
  } | null
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  if (!result) return null

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-500" />
    }
  }

  const formatAnalysisText = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-2">
        {line}
      </p>
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        {getAnalysisIcon(result.analysisType)}
        <h2 className="text-lg font-medium text-gray-900 ml-2">
          Analysis Results
        </h2>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-1" />
          <span className="font-medium">{result.fileName}</span>
          <span className="ml-4 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {result.analysisType.charAt(0).toUpperCase() + result.analysisType.slice(1)} Analysis
          </span>
        </div>
      </div>

      <div className="prose max-w-none">
        <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap">
          {formatAnalysisText(result.analysis)}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            const blob = new Blob([result.analysis], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analysis-${result.fileName}-${Date.now()}.txt`
            a.click()
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Download Report
        </button>
      </div>
    </div>
  )
}
