import { Track } from '@spotify/web-api-ts-sdk'
import { FC } from 'react'
import styled from 'styled-components'

interface TrackListProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
}
interface TrackListProps {
  tracks: Track[]
  onTrackClick: (track: Track) => void
}

export const TrackList: FC<TrackListProps> = ({ tracks, onTrackClick }) => (
  <Wrapper>
    {tracks.map((track) => {
      const image = track.album.images.length
        ? track.album.images.reduce((closest, current) => {
            return Math.abs(current.width - 300) < Math.abs(closest.width - 300)
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
        </TrackItem>
      )
    })}
  </Wrapper>
)

const TrackImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const TrackItem = styled.div`
  padding: 1rem;
  border: 1px solid var(--main-fg);
  border-radius: 4px;
  cursor: pointer;
`

const TrackName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const ArtistList = styled.div`
  font-size: 0.9rem;
  color: #cbd3db;
`

const Artist = styled.span`
  margin-right: 0.5rem;
`
