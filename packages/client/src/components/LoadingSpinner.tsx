import styled, { keyframes } from 'styled-components'

const loaderAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Loader = styled.div`
  position: relative;
  display: block;
  width: 3.5rem;
  height: 3.5rem;

  &::before {
    content: '';
    border: 0.25rem solid var(--main-fg);
    border-radius: 50%;
    width: 4.2rem;
    height: 4.2rem;
    position: absolute;
    top: -0.6rem;
    left: -0.6rem;
    animation: ${loaderAnimation} 1s ease-out infinite;
    animation-delay: 0.5s;
    opacity: 0;
  }

  &::after {
    content: '';
    border: 0.25rem solid var(--main-fg);
    border-radius: 50%;
    width: 3.5rem;
    height: 3.5rem;
    position: absolute;
    top: -0.25rem;
    left: -0.25rem;
    animation: ${loaderAnimation} 1s ease-out infinite;
  }
`

export const LoadingSpinner = () => {
  return (
    <Wrapper>
      <Loader />
    </Wrapper>
  )
}
