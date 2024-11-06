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
      placeholder="Search for a track"
      value={query}
      onChange={handleSearch}
    />
  )
}

const SearchInput = styled.input`
  padding: 0.8rem;
  font-size: 1rem;
  width: 100%;
  border: 1px solid var(--main-fg);
  border-radius: 4px;
  margin-bottom: 1rem;
  background-color: var(--main-bg);
  color: var(--main-fg);
`
