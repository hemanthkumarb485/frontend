import axios from 'axios' 

const API_BASE = '/api/v1'
export const api = axios.create({ baseURL: API_BASE, timeout: 120000 })

export function uploadScansSSE(files, onProgress, onComplete, onError) {
  const form = new FormData()
  if (files.zap_file)     { form.append('zap_file', files.zap_file);        form.append('zap_format', files.zap_format || 'auto') }
  if (files.nuclei_file)  { form.append('nuclei_file', files.nuclei_file);   form.append('nuclei_format', files.nuclei_format || 'auto') }
  if (files.openvas_file) { form.append('openvas_file', files.openvas_file); form.append('openvas_format', files.openvas_format || 'xml') }
  if (files.nmap_file)    { form.append('nmap_file', files.nmap_file);       form.append('nmap_format', files.nmap_format || 'auto') }
  form.append('asset_criticality', files.asset_criticality || 'unknown')

  let lastEventTime = Date.now()
  const watchdog = setInterval(() => {
    if (Date.now() - lastEventTime > 120000) {
      clearInterval(watchdog)
      onError('No response for 2 minutes. Check backend terminal.')
    }
  }, 5000)

  fetch(`${API_BASE}/scan/upload`, { method: 'POST', body: form })
    .then(res => {
      if (!res.ok) {
        clearInterval(watchdog)
        return res.text().then(t => onError(`Server error ${res.status}: ${t}`))
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completed = false

      const processBuffer = () => {
        buffer = buffer.replace(/\r\n/g, '\n')
        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const eventText = buffer.slice(0, boundary).trim()
          buffer = buffer.slice(boundary + 2)
          boundary = buffer.indexOf('\n\n')
          if (!eventText.startsWith('data: ')) continue
          const dataStr = eventText.slice(6).trim()
          if (!dataStr) continue
          try {
            const evt = JSON.parse(dataStr)
            lastEventTime = Date.now()
            if (evt.stage === 'complete' && !completed) {
              completed = true; clearInterval(watchdog); onComplete(evt.data)
            } else if (evt.stage === 'error') {
              clearInterval(watchdog); onError(evt.message || 'Pipeline error')
            } else if (!completed) {
              onProgress(evt)
            }
          } catch (_) {
            buffer = eventText + '\n\n' + buffer
            break
          }
        }
      }


      const read = () => {
        reader.read()
          .then(({ done, value }) => {
            lastEventTime = Date.now()
            if (done) {
              clearInterval(watchdog)
              if (buffer.trim()) processBuffer()
              if (!completed) onError('Stream closed before completing. Check backend logs.')
              return
            }
            buffer += decoder.decode(value, { stream: true })
            processBuffer()
            read()
          })
          .catch(err => { clearInterval(watchdog); onError('Stream error: ' + err.message) })
      }
      read()
    })
    .catch(err => {
      clearInterval(watchdog)
      onError(err.message.includes('Failed to fetch')
        ? 'Cannot reach backend. Is uvicorn running on port 8000?'
        : 'Upload failed: ' + err.message)
    })
}

export async function uploadScansSync(files) {
  const form = new FormData()
  if (files.zap_file)     { form.append('zap_file', files.zap_file);        form.append('zap_format', files.zap_format || 'auto') }
  if (files.nuclei_file)  { form.append('nuclei_file', files.nuclei_file);   form.append('nuclei_format', files.nuclei_format || 'auto') }
  if (files.openvas_file) { form.append('openvas_file', files.openvas_file); form.append('openvas_format', files.openvas_format || 'xml') }
  if (files.nmap_file)    { form.append('nmap_file', files.nmap_file);       form.append('nmap_format', files.nmap_format || 'auto') }
  form.append('asset_criticality', files.asset_criticality || 'unknown')
  const res = await api.post('/scan/process', form, {
    headers: { 'Content-Type': 'multipart/form-data' }, timeout: 300000,
  })
  return res.data
}

export async function getGithubOAuthUrl() {
  const res = await api.get('/github/login'); return res.data
}
export async function connectGithubPAT(pat) {
  const res = await api.post('/github/connect-pat', { pat }); return res.data
}
export async function getGithubRepos(encryptedToken) {
  const res = await api.get('/github/repositories', { params: { encrypted_token: encryptedToken } }); return res.data
}
export async function createGithubIssue(payload, encryptedToken) {
  const res = await api.post('/github/issues/create', payload, { params: { encrypted_token: encryptedToken } }); return res.data
}
export async function exportJSON(session) {
  const res = await api.post('/report/export/json', session, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a'); a.href = url; a.download = 'vulnrisk_report.json'; a.click()
  window.URL.revokeObjectURL(url)
}
export async function exportPDF(session) {
  const res = await api.post('/report/export/pdf', session, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
  const a = document.createElement('a'); a.href = url; a.download = 'vulnrisk_report.pdf'; a.click()
  window.URL.revokeObjectURL(url)
}
export async function healthCheck() {
  const res = await api.get('../../health'); return res.data
}
