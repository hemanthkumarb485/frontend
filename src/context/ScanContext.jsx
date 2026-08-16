import { createContext, useContext, useState, useCallback } from 'react'

const ScanContext = createContext(null)

export function ScanProvider({ children }) {
  const [session, setSession]           = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress]         = useState(null)
  const [error, setError]               = useState(null)

  // GitHub state — persisted in sessionStorage so page refresh keeps it
  const [githubToken, setGithubToken]       = useState(() => sessionStorage.getItem('gh_token') || null)
  const [githubUsername, setGithubUsername] = useState(() => sessionStorage.getItem('gh_user')  || null)
  const [selectedRepo, setSelectedRepo]     = useState(() => sessionStorage.getItem('gh_repo')  || null)

  // Track raised tickets: { [finding_id]: { issue_number, issue_url, status } }
  const [raisedTickets, setRaisedTickets] = useState({})

  const saveGithubConnection = useCallback((token, username) => {
    setGithubToken(token)
    setGithubUsername(username)
    sessionStorage.setItem('gh_token', token)
    sessionStorage.setItem('gh_user', username)
  }, [])

  const saveSelectedRepo = useCallback((repo) => {
    setSelectedRepo(repo)
    sessionStorage.setItem('gh_repo', repo)
  }, [])

  const disconnectGithub = useCallback(() => {
    setGithubToken(null)
    setGithubUsername(null)
    setSelectedRepo(null)
    sessionStorage.removeItem('gh_token')
    sessionStorage.removeItem('gh_user')
    sessionStorage.removeItem('gh_repo')
  }, [])

  const markTicketRaised = useCallback((findingId, ticketData) => {
    setRaisedTickets(prev => {
      const next = { ...prev }
      if (ticketData == null) {
        next[findingId] = null
      } else {
        next[findingId] = { ...ticketData }
      }
      return next
    })
  }, [])

  const clearSession = useCallback(() => {
    setSession(null); setProgress(null); setError(null)
  }, [])

  return (
    <ScanContext.Provider value={{
      session, setSession,
      isProcessing, setIsProcessing,
      progress, setProgress,
      error, setError,
      githubToken, githubUsername, selectedRepo,
      saveGithubConnection, saveSelectedRepo, disconnectGithub,
      raisedTickets, markTicketRaised,
      clearSession,
    }}>
      {children}
    </ScanContext.Provider>
  )
}

export function useScan() {
  const ctx = useContext(ScanContext)
  if (!ctx) throw new Error('useScan must be used inside ScanProvider')
  return ctx
}
