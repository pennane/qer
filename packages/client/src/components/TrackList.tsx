import { Track } from '@spotify/web-api-ts-sdk'
import { FC } from 'react'
import styled from 'styled-components'
import { LoadingSpinner } from './LoadingSpinner'
import { Duration } from './Misc'
import { formatDuration } from '../lib'

interface TrackListProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
  loading?: boolean
}
interface TrackListProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
}

export const TrackList: FC<TrackListProps> = ({
  tracks,
  onTrackClick,
  loading
}) => (
  <Wrapper>
    {loading && <LoadingSpinner />}
    {!loading &&
      tracks.map((track) => {
        const image = track.album.images.length
          ? track.album.images.reduce((closest, current) => {
              return Math.abs(current.width - 300) <
                Math.abs(closest.width - 300)
                ? current
                : closest
            })
          : null

        return (
          <TrackItem key={track.id} onClick={() => onTrackClick(track)}>
            {image && <TrackImage src={image.url} alt={track.name} />}
            <TrackName>{track.name}</TrackName>
            <ArtistList>
              {track.artists.map((artist) => (
                <Artist key={artist.name}>{artist.name}</Artist>
              ))}
            </ArtistList>
            <Duration>{formatDuration(track.duration_ms)}</Duration>
          </TrackItem>
        )
      })}
  </Wrapper>
)

const TrackImage = styled.img`
  object-fit: contain;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 4px;
  margin-right: 0.25rem;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const TrackItem = styled.div`
  padding: 0.25rem;
  border: 1px solid transparent;
  border-radius: 4px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  cursor: pointer;
  &:hover {
    border: 1px solid var(--accent);
  }
`

const TrackName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
`

const ArtistList = styled.div``

const Artist = styled.span`
  font-size: 0.9rem;
  font-weight: 300;
`
