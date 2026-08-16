import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpTrayIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useScan } from '../context/ScanContext'
import { uploadScansSSE } from '../api/client'
import { ProgressBar } from '../components/ProgressBar'
import { clsx } from 'clsx'

const TOOLS = [
  { key: 'zap', label: 'OWASP ZAP', tw: 'border-blue-600/40 bg-blue-900/20 text-blue-400', formats: ['auto','sarif','xml','json'], accept: '.json,.xml,.html,.pdf,.txt' },
  { key: 'nuclei', label: 'Nuclei', tw: 'border-purple-600/40 bg-purple-900/20 text-purple-400', formats: ['auto','jsonl','json','sarif','markdown'], accept: '.jsonl,.json,.md,.sarif,.pdf' },
  { key: 'openvas', label: 'OpenVAS', tw: 'border-cyan-600/40 bg-cyan-900/20 text-cyan-400', formats: ['xml'], accept: '.xml,.pdf,.txt' },
  { key: 'nmap', label: 'Nmap', tw: 'border-emerald-600/40 bg-emerald-900/20 text-emerald-400', formats: ['auto','xml','normal','grepable'], accept: '.xml,.txt,.gnmap,.pdf' },
]
const CRITS = [
  { value: 'production', label: '🔴 Production ×1.2' },
  { value: 'staging', label: '🟡 Staging ×1.0' },
  { value: 'development', label: '🟢 Dev ×0.8' },
  { value: 'unknown', label: '⚪ Unknown ×1.0' },
]

function Zone({ tool, file, format, onFile, onFormat, onClear }) {
  const ref = useRef(null)
  const [drag, setDrag] = useState(false)
  const [border, bg, tc] = tool.tw.split(' ')
  return (
    <div className={clsx('border rounded-xl p-4', border, bg, drag && 'ring-2 ring-indigo-500')}>
      <div className="flex justify-between mb-3">
        <span className={clsx('font-semibold text-sm', tc)}>{tool.label}</span>
        {file && <button onClick={onClear}><XMarkIcon className="w-4 h-4 text-slate-400 hover:text-red-400" /></button>}
      </div>
      {!file
        ? <div className="border-2 border-dashed border-slate-600 rounded-lg p-5 text-center cursor-pointer hover:border-slate-500"
            onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onFile(f)}}
            onClick={()=>ref.current?.click()}>
            <ArrowUpTrayIcon className={clsx('w-8 h-8 mx-auto mb-1',tc)}/>
            <p className="text-slate-400 text-xs">Drop file or click</p>
            <input ref={ref} type="file" accept={tool.accept} className="hidden" onChange={e=>onFile(e.target.files[0])}/>
          </div>
        : <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-2.5">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400"/>
            <div><p className="text-slate-200 text-xs truncate">{file.name}</p><p className="text-slate-400 text-xs">{(file.size/1024).toFixed(1)} KB</p></div>
          </div>
      }
      <div className="mt-2">
        <select value={format} onChange={e=>onFormat(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-slate-200 text-xs">
          {tool.formats.map(f=><option key={f} value={f}>{f}</option>)}
        </select>
      </div>
    </div>
  )
}

export default function Upload() {
  const navigate = useNavigate()
  const { setSession, setIsProcessing, setProgress, setError, isProcessing, progress } = useScan()
  const [files, setFiles] = useState({ zap:null, nuclei:null, openvas:null, nmap:null })
  const [fmts, setFmts] = useState({ zap:'auto', nuclei:'auto', openvas:'xml', nmap:'auto' })
  const [crit, setCrit] = useState('unknown')
  const hasFiles = Object.values(files).some(Boolean)

  const submit = () => {
    if (!hasFiles) return
    setIsProcessing(true); setProgress({ stage:'start', percent:0, message:'Starting...', elapsed_seconds:0 }); setError(null)
    uploadScansSSE(
      { zap_file:files.zap, zap_format:fmts.zap, nuclei_file:files.nuclei, nuclei_format:fmts.nuclei,
        openvas_file:files.openvas, openvas_format:fmts.openvas, nmap_file:files.nmap, nmap_format:fmts.nmap, asset_criticality:crit },
      p=>setProgress(p),
      data=>{ setSession(data); setIsProcessing(false); setProgress(null); navigate('/') },
      err=>{ setError(String(err)); setIsProcessing(false); setProgress(null) }
    )
  }
  return (
    <div className="max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-100">Upload Scan Results</h1>
        <p className="text-slate-400 text-sm mt-1">ZAP · Nuclei · OpenVAS · Nmap — all formats, max 1 GB per file.</p></div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p className="text-slate-300 text-sm font-medium mb-3">Asset Criticality</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CRITS.map(o=><button key={o.value} onClick={()=>setCrit(o.value)}
            className={clsx('px-3 py-2 rounded-lg text-xs font-medium border transition-all',
              crit===o.value?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-700 border-slate-600 text-slate-300')}>{o.label}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TOOLS.map(t=><Zone key={t.key} tool={t} file={files[t.key]} format={fmts[t.key]}
          onFile={f=>setFiles(p=>({...p,[t.key]:f}))} onFormat={fmt=>setFmts(p=>({...p,[t.key]:fmt}))}
          onClear={()=>setFiles(p=>({...p,[t.key]:null}))}/>)}
      </div>
      {progress && <ProgressBar progress={progress}/>}
      <button onClick={submit} disabled={!hasFiles||isProcessing}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors">
        {isProcessing?'⚙️ Processing...':'🚀 Analyze & Prioritize'}
      </button>
    </div>
  )
}
