import styled from 'styled-components'

export const LoadingText = styled.p`
  font-size: 1.2rem;
  color: var(--main-fg);
`

export const ErrorText = styled.p`
  font-size: 1.2rem;
  color: red;
`

export const TrackName = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
`

export const ArtistList = styled.span`
  font-size: 0.9rem;
  font-weight: 300;
`

export const Artist = styled.span`
  font-size: 0.9rem;
  font-weight: 300;
  margin-right: 0.25rem;
`

export const Duration = styled.span`
  margin: 0;
  font-size: 0.9rem;
  font-weight: light-dark(200, 400);
  text-rendering: optimizelegibility;
`
