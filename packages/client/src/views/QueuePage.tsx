import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import { SpotifyApi, Track } from '@spotify/web-api-ts-sdk'
import { Button } from '../components/Button'
import { TrackList } from '../components/TrackList'
import useTrackSearch from '../hooks/useTrackSearch'
import { TrackSearch } from '../components/TrackSearchBar'
import { UserProfile } from '../components/UserProfile'

type QueueTrack = {
  spotifyId: string
  uri: string
  duration_ms: number
  name: string
  artists: { name: string; id: string }[]
  userId: string
}

const fetchQueue = async (id: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/${id}`
  )
  if (!response.ok) throw new Error('failed to fetch queue')
  return response.json() as Promise<QueueTrack[]>
}

const fetchCreateQueue = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/create`,
    { method: 'POST', credentials: 'include' }
  )
  if (!response.ok) throw new Error('failed to create queue')
  return response.json() as Promise<QueueTrack[]>
}

const fetchSetTracks = async ({
  queueId,
  ids
}: {
  queueId: string
  ids: string[]
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/queue/${queueId}/set-user-queue`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ trackIds: ids }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
  if (!response.ok) throw new Error('failed to set queue tracks')
  return response.json() as Promise<QueueTrack[]>
}

const fetchProfile = async (api: SpotifyApi) => {
  return api.currentUser.profile()
}

const Wrapper = styled.div`
  padding: 2rem;
  color: var(--main-fg);
  background-color: var(--main-bg);
`

export const QueuePage: FC = () => {
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const { api, userType } = useSpotifyAuth()
  const navigate = useNavigate()

  const { data: profile } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => fetchProfile(api)
  })

  const {
    mutateAsync: createQueueMutation,
    status: createQueueMutationStatus
  } = useMutation({
    mutationFn: fetchCreateQueue,
    onSuccess: (data) => {
      console.log(123)
      queryClient.setQueryData(['queue', profile!.id], data)
      navigate(`/${profile!.id}`, { replace: true })
    },
    onError: console.log
  })

  const {
    data: tracks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['queue', id],
    queryFn: () => fetchQueue(id!),
    refetchInterval: 7000,
    enabled: !!id
  })

  const { query, setQuery, tracks: searchTracks } = useTrackSearch(api, '')
  const [ownQueue, setOwnQueue] = useState(tracks || [])

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

  const createQueue = () => {
    if (userType !== 'admin') return
    if (id) return
    createQueueMutation([])
  }

  const { mutateAsync: setQueueTracksMutation } = useMutation({
    mutationFn: fetchSetTracks,
    onSuccess: (data) => {
      queryClient.setQueryData(['queue', id], data)
    },
    onError: console.log
  })

  if (!id && userType === 'admin') {
    return (
      <Button
        disabled={createQueueMutationStatus !== 'idle'}
        onClick={createQueue}
      >
        Create your own special queue
      </Button>
    )
  }

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
