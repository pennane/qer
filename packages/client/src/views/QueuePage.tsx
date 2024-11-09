import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import {
  LoadingText,
  ErrorText,
  TrackItem,
  TrackName,
  ArtistList,
  Artist,
  Duration
} from '../components/Misc'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'
import { Track } from '@spotify/web-api-ts-sdk'
import { TrackList } from '../components/TrackList'
import useTrackSearch from '../hooks/useTrackSearch'
import { TrackSearch } from '../components/TrackSearchBar'
import { UserProfile } from '../components/UserProfile'
import { fetchQueue, fetchSetTracks } from '../api'

const Wrapper = styled.div`
  padding: 2rem;
  color: var(--main-fg);
  background-color: var(--main-bg);
`

export const QueuePage: FC = () => {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const { api, profile } = useSpotifyAuth()

  const {
    data: queue,
    isLoading,
    error
  } = useQuery({
    queryKey: ['queue', id],
    queryFn: () => fetchQueue(id!),
    refetchInterval: 7000,
    enabled: !!id
  })

  const tracks = queue?.tracks

  const { query, setQuery, tracks: searchTracks } = useTrackSearch(api, '')
  const [ownQueue, setOwnQueue] = useState(queue?.tracks || [])

  useEffect(() => {
    if (!profile?.id) return
    setOwnQueue((tracks || []).filter((x) => x.userId === profile.id))
  }, [profile, tracks])

  const addToOwnQueue = (track: Track) => {
    setQuery('')
    setQueueTracksMutation({
      queueId: id!,
      ids: ownQueue.map((x) => x.spotifyId).concat(track.id)
    })
  }

  const removeFromQueue = (i: number) => {
    if (!tracks || !profile) return
    const toRemove = tracks[i]
    if (toRemove.userId !== profile.id) return
    const ownTracksAfter = tracks
      .slice(0, i)
      .concat(tracks.slice(i + 1))
      .filter((x) => x.userId === profile.id)

    setQueueTracksMutation({
      queueId: id!,
      ids: ownTracksAfter.map((x) => x.spotifyId)
    })
  }

  const { mutateAsync: setQueueTracksMutation } = useMutation({
    mutationFn: fetchSetTracks,
    onSuccess: (data) => {
      queryClient.setQueryData(['queue', id], data)
    },
    onError: console.log
  })

  if (isLoading) return <LoadingText>Loading queue...</LoadingText>
  if (error) return <ErrorText>Failed to load queue</ErrorText>

  return (
    <Wrapper>
      <h2>Queue</h2>
      <TrackSearch query={query} setQuery={setQuery} />
      <h2>search results</h2>
      <TrackList tracks={searchTracks || []} onTrackClick={addToOwnQueue} />
      <h2>queue</h2>
      {tracks?.map((track, i) => (
        <TrackItem key={i}>
          {i + 1}.<TrackName>{track.name}</TrackName>
          <ArtistList>
            {track.artists.map((artist) => (
              <Artist key={artist.id}>{artist.name}</Artist>
            ))}
          </ArtistList>
          <Duration>{(track.duration_ms / 60000).toFixed(2)} min</Duration>
          <UserProfile api={api} userId={track.userId} />
          {profile && track.userId === profile.id && (
            <button onClick={() => removeFromQueue(i)}>
              remove from queue
            </button>
          )}
        </TrackItem>
      ))}
    </Wrapper>
  )
}
