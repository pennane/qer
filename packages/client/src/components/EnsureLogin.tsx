import { FC, ReactNode } from 'react'
import { TARGET_QUEUE_KEY, useSpotifyAuth } from '../context/SpotifyAuthContext'
import { Button } from './Button'
import { ErrorText } from './Misc'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchQueue } from '../api'
import styled from 'styled-components'
import { LoadingSpinner } from './LoadingSpinner'

const Wrapper = styled.div`
  width: 100vw;
  height: 80vh;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: fixed;
  inset: 0;
  overflow: hidden;
  ${Button} {
    font-size: 2.5rem;
  }
`

const RenderEnsureLogin: FC<{
  authError?: Error
  loading?: boolean
  hasId: boolean
  hasApi: boolean
  hasData: boolean
  adminJoin: () => void
  userJoin: () => void
}> = ({ authError, loading, adminJoin, userJoin, hasId, hasApi, hasData }) => {
  if (authError) {
    return <ErrorText>Auth failed: {authError.message}</ErrorText>
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (hasId && hasData && !hasApi) {
    return (
      <Button disabled={loading} onClick={userJoin}>
        Join existing queue
      </Button>
    )
  }

  return (
    <Wrapper>
      <Button disabled={loading} onClick={adminJoin}>
        Join to create a queue
      </Button>
    </Wrapper>
  )
}

const storedTargetQueueId = sessionStorage.getItem(TARGET_QUEUE_KEY)

export const EnsureLogin: FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || storedTargetQueueId

  console.log(id, storedTargetQueueId)

  const { data, isLoading } = useQuery({
    queryKey: ['queue', id],
    queryFn: () => fetchQueue(id!),
    retry: false,
    enabled: !!id,
    throwOnError: false
  })

  const {
    api,
    loading,
    joinAsQueueAdmin,
    joinAsQueueUser,
    error: authError
  } = useSpotifyAuth()

  if (api && data) {
    return <>{children}</>
  }

  return (
    <Wrapper>
      <RenderEnsureLogin
        loading={loading || isLoading}
        adminJoin={joinAsQueueAdmin}
        userJoin={joinAsQueueUser}
        hasApi={!!api}
        hasData={!!data}
        hasId={!!id}
        authError={authError}
      />
    </Wrapper>
  )
}
