import { FC, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { LoadingText, ErrorText } from '../components/Misc'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'
import { Track } from '@spotify/web-api-ts-sdk'
import { TrackList } from '../components/TrackList'
import useTrackSearch from '../hooks/useTrackSearch'
import { TrackSearch } from '../components/TrackSearchBar'
import { fetchDeleteQueue, fetchQueue, fetchSetTracks } from '../api'
import { Button } from '../components/Button'
import { TrackItem } from '../components/TrackItem'

const Page = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Content = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 1rem;
  padding: 1rem;
  background-color: var(--main-bg);
`

const StyledHeading = styled.h1`
  letter-spacing: -0.07rem;
  line-height: 1;
  margin: 0;
`

const H2 = styled.h2`
  letter-spacing: -0.07rem;
  line-height: 1;
  margin: 0;
`

const StyledHeadingRest = styled.span`
  font-weight: 300;
  font-size: 1rem;
`

const Heading = () => {
  return (
    <StyledHeading>
      QER <StyledHeadingRest>- smarter way to queue music</StyledHeadingRest>
    </StyledHeading>
  )
}

const Wrapper = styled.div`
  color: var(--main-fg);
  background-color: var(--main-bg);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Footer = styled.footer`
  color: var(--faded);
  background-color: var(--main-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
  font-size: 0.9rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
`

export const QueuePage: FC = () => {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
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

  const {
    query,
    setQuery,
    tracks: searchTracks,
    loading: resultsLoading
  } = useTrackSearch(api, '')
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
    onError: console.error
  })

  const { mutateAsync: deleteOwnQueue } = useMutation({
    mutationFn: fetchDeleteQueue,
    onSuccess: (data) => {
      if (data.deleted) {
        queryClient.setQueryData(['queue', id], null)
      }
    },
    onError: console.error
  })

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this queue?')) {
      await deleteOwnQueue([])
    }
  }

  if (isLoading) return <LoadingText>Loading queue...</LoadingText>
  if (error) return <ErrorText>Failed to load queue</ErrorText>

  return (
    <Page>
      <Content>
        <Wrapper>
          <Heading />
          <Wrapper>
            <TrackSearch query={query} setQuery={setQuery} />
            {query && <H2>search results</H2>}
            <TrackList
              tracks={searchTracks || []}
              onTrackClick={addToOwnQueue}
              loading={resultsLoading}
            />
          </Wrapper>

          <H2>queue</H2>
          <Wrapper>
            {tracks?.map((track, i) => (
              <TrackItem
                index={i}
                isCurrentUser={profile && track.userId === profile.id}
                remove={removeFromQueue}
                track={track}
              />
            ))}
          </Wrapper>

          {profile && id === profile.id && (
            <Button color="warning" onClick={handleDelete}>
              Delete queue from use
            </Button>
          )}

          {profile && id === profile.id && (
            <Footer>
              <p>
                ( queue is automatically deleted after one hour of inactivity )
              </p>
            </Footer>
          )}
        </Wrapper>
      </Content>
    </Page>
  )
}
