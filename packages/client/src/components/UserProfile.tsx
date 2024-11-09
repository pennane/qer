import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import styled from 'styled-components'
import { useSpotifyAuth } from '../context/SpotifyAuthContext'

const fetchUserProfile = async (userId: string, api: SpotifyApi) => {
  return api.users.profile(userId)
}

export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const { api } = useSpotifyAuth()
  const { data } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId, api)
  })

  return (
    <ProfileContainer>
      <DisplayName>{data?.display_name}</DisplayName>
      {data?.images[0]?.url && (
        <Thumbnail src={data.images[0].url} alt={data.display_name} />
      )}
    </ProfileContainer>
  )
}

const ProfileContainer = styled.div`
  display: flex;
  gap: 0.5em;

  justify-content: flex-end;
`

const Thumbnail = styled.img`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
`

const DisplayName = styled.span`
  white-space: nowrap;
  font-weight: bold;
  font-size: 0.9em;
`
