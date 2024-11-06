import { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import styled from 'styled-components'

const fetchUserProfile = async (userId: string, api: SpotifyApi) => {
  return api.users.profile(userId)
}

export const UserProfile: React.FC<{ userId: string; api: SpotifyApi }> = ({
  userId,
  api
}) => {
  const { data } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId, api)
  })

  return (
    <ProfileContainer>
      {data?.images[0]?.url && (
        <Thumbnail src={data.images[0].url} alt={data.display_name} />
      )}
      <UserInfo>
        <DisplayName>{data?.display_name}</DisplayName>
      </UserInfo>
    </ProfileContainer>
  )
}

const ProfileContainer = styled.div`
  display: flex;

  gap: 0.5em;
  align-items: baseline;
  justify-content: flex-end;
`

const Thumbnail = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const DisplayName = styled.span`
  font-weight: bold;
  font-size: 0.9em;
`
