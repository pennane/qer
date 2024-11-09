import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

const fetchTracks = async (api: SpotifyApi, query: string) => {
  const response = await api.search(query, ['track'], undefined, 5)
  return response.tracks.items
}

const useTrackSearch = (api: SpotifyApi, initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(handler)
  }, [query])

  const {
    data: tracks,
    error,
    isLoading
  } = useQuery({
    queryKey: ['searchTracks', debouncedQuery],
    queryFn: () => fetchTracks(api, debouncedQuery),
    enabled: !!debouncedQuery,
    retry: false
  })

  return { query, setQuery, tracks, error, loading: isLoading }
}

export default useTrackSearch
