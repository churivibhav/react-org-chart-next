require('@testing-library/jest-dom')

// Mock D3 since it's not available in jsdom
jest.mock('d3', () => ({
  layout: {
    tree: jest.fn(() => ({
      nodeSize: jest.fn().mockReturnThis()
    }))
  },
  select: jest.fn(() => ({
    append: jest.fn(() => ({
      attr: jest.fn().mockReturnThis(),
      append: jest.fn(() => ({
        attr: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis()
      })),
      style: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis()
    }))
  })),
  behavior: {
    zoom: jest.fn(() => ({
      scaleExtent: jest.fn().mockReturnThis(),
      duration: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      translate: jest.fn().mockReturnThis(),
      scale: jest.fn().mockReturnThis(),
      call: jest.fn().mockReturnThis()
    }))
  },
  transition: jest.fn(() => ({
    duration: jest.fn().mockReturnThis(),
    tween: jest.fn().mockReturnThis()
  })),
  event: {
    preventDefault: jest.fn()
  }
}))

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
}

// Mock DOM methods that might not be available
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => ''
  })
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}))
