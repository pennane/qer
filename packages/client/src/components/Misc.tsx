import styled from 'styled-components'

export const LoadingText = styled.p`
  font-size: 1.2rem;
  color: var(--main-fg);
`

export const ErrorText = styled.p`
  font-size: 1.2rem;
  color: red;
`

export const TrackItem = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid var(--main-fg);
  border-radius: 4px;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
`

export const TrackName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

export const ArtistList = styled.div`
  font-size: 0.9rem;
  color: #cbd3db;
`

export const Artist = styled.span`
  margin-right: 0.5rem;
`

export const Duration = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #cbd3db;
`
