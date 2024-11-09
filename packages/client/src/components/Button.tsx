import styled from 'styled-components'

export const Button = styled.button<{
  color?: 'info' | 'danger' | 'warning' | 'success' | 'plain'
}>`
  border-radius: 0.5rem;
  color: ${({ color }) => {
    switch (color) {
      case 'info':
        return 'var(--info)'
      case 'danger':
        return 'var(--danger)'
      case 'warning':
        return 'var(--warning)'
      case 'success':
        return 'var(--success)'
      case 'plain':
      default:
        return 'var(--accent)'
    }
  }};
  background: transparent;
  border: 1px solid
    ${({ color }) => {
      switch (color) {
        case 'info':
          return 'var(--info)'
        case 'danger':
          return 'var(--danger)'
        case 'warning':
          return 'var(--warning)'
        case 'success':
          return 'var(--success)'
        case 'plain':
        default:
          return 'var(--accent)'
      }
    }};
  padding: 0.25rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.1s;
  &:disabled {
    cursor: default;
  }
  &:hover {
    box-shadow: ${({ color }) => {
      switch (color) {
        case 'info':
          return 'var(--info) 0px 0px 3px 0px inset'
        case 'danger':
          return 'var(--danger) 0px 0px 3px 0px inset'
        case 'warning':
          return 'var(--warning) 0px 0px 3px 0px inset'
        case 'success':
          return 'var(--success) 0px 0px 3px 0px inset'
        case 'plain':
        default:
          return 'var(--accent) 0px 0px 3px 0px inset'
      }
    }};
  }
`
