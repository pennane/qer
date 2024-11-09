import styled from 'styled-components'
import { Button } from './Button'
import { TrackName, ArtistList, Artist, Duration } from './Misc'
import { UserProfile } from './UserProfile'
import { FC } from 'react'

import { QueueTrack } from '../models'
import { formatDuration } from '../lib'

const StyledTrackItem = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  & > * {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    &:last-of-type {
      flex: 1;
      flex-wrap: nowrap;
    }
  }
`

const Line = styled.div`
  width: 100%;
  height: 0.5px;
  background-color: rgb(255 255 255 / 60%);
  margin: 0;
`

const Wrapper = styled.div`
  gap: 0.5rem;
  display: flex;
  flex-direction: column;
`

const RemoveButton = styled(Button).attrs({ color: 'warning' })`
  margin-left: auto;
`

export const TrackItem: FC<{
  index: number
  track: QueueTrack
  remove: (i: number) => void
  isCurrentUser: boolean
}> = ({ index: i, track, isCurrentUser, remove }) => {
  return (
    <Wrapper>
      <StyledTrackItem key={i}>
        <div>
          {i + 1}.<TrackName>{track.name}</TrackName>-
          <ArtistList>
            {track.artists.map((artist) => (
              <Artist key={artist.id}>{artist.name}</Artist>
            ))}
          </ArtistList>
          <Duration>{formatDuration(track.duration_ms)}</Duration>
        </div>

        <div>
          <UserProfile userId={track.userId} />
          {isCurrentUser && (
            <RemoveButton color="warning" onClick={() => remove(i)}>
              remove
            </RemoveButton>
          )}
        </div>
      </StyledTrackItem>
      <Line />
    </Wrapper>
  )
}
