import { FC, ReactNode } from 'react'
import styled from 'styled-components'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'
import { Button } from './Button'
import { ErrorText, LoadingText } from './Misc'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background-color: var(--main-bg);
  color: var(--main-fg);
`

export const EnsureLogin: FC<{ children: ReactNode }> = ({ children }) => {
  const { api, loading, joinAsQueueAdmin, joinAsQueueUser, error } =
    useSpotifyAuth()

  if (!api) {
    return (
      <Wrapper>
        {error && <ErrorText>{error}</ErrorText>}
        <Button disabled={loading} onClick={joinAsQueueUser}>
          Join existing queue
        </Button>
        <Button disabled={loading} onClick={joinAsQueueAdmin}>
          Join to create a queue
        </Button>
        {loading && <LoadingText>... loading :D</LoadingText>}
      </Wrapper>
    )
  }

  return <>{children}</>
}
