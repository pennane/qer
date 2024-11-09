import { FC } from 'react'

import styled from 'styled-components'

export const TrackSearch: FC<{
  query: string
  setQuery: (s: string) => void
}> = ({ query, setQuery }) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <SearchInput
      type="text"
      placeholder="Search for music from Spotify"
      value={query}
      onChange={handleSearch}
    />
  )
}

const SearchInput = styled.input`
  padding: 0.8rem;
  margin: 0;
  font-size: 1rem;

  border: 1px solid var(--accent);
  border-radius: 4px;

  background-color: var(--main-bg);
  color: var(--main-fg);
  &::placeholder {
    color: var(--faded-accent);
  }
`
