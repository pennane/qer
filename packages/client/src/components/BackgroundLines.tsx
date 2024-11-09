import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  height: 100%;
  pointer-events: none;
  position: fixed;
  width: 100%;
  z-index: -1;
  top: 0;
  left: 0;
`

const Item = styled.div`
  height: 100%;
  width: 20%;
  border-left: 1px solid #ffffff0a;

  &:first-child {
    border-left: none;
  }

  @media only screen and (max-width: 670px) {
    &:last-child {
      display: none;
    }

    width: 33%;
  }

  @media only screen and (max-width: 940px) {
    width: 25%;
  }
`

export const BackgroundLines = () => {
  return (
    <Container>
      <Item />
      <Item />
      <Item />
      <Item />
      <Item />
    </Container>
  )
}
