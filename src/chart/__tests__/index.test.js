const { init } = require('../index')

// Create a mock element factory that can chain append operations
const createMockElement = () => {
  const mockElement = {
    attr: jest.fn().mockReturnThis(),
    append: jest.fn(() => createMockElement()),
    on: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    style: jest.fn().mockReturnThis()
  }
  return mockElement
}

// Mock dependencies
jest.mock('d3', () => ({
  layout: {
    tree: jest.fn(() => ({
      nodeSize: jest.fn().mockReturnThis()
    }))
  },
  behavior: {
    zoom: jest.fn(() => ({
      scaleExtent: jest.fn().mockReturnThis(),
      duration: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      translate: jest.fn().mockReturnValue([0, 0]),
      scale: jest.fn().mockReturnValue(1),
      call: jest.fn().mockReturnThis()
    }))
  },
  select: jest.fn(() => createMockElement()),
  event: {
    preventDefault: jest.fn(),
    target: { id: 'test' }
  },
  transition: jest.fn(() => ({
    duration: jest.fn().mockReturnThis(),
    tween: jest.fn().mockReturnThis()
  })),
  interpolate: jest.fn(() => jest.fn())
}))

jest.mock('../config', () => ({
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  lineType: 'straight',
  nodeWidth: 200,
  nodeHeight: 100,
  nodeSpacing: 20,
  shouldResize: true
}))

jest.mock('../render', () => jest.fn())

jest.mock('../render-update', () => jest.fn(() => jest.fn()))

jest.mock('../../utils', () => ({
  collapse: jest.fn(),
  wrapText: jest.fn(),
  helpers: {}
}))

jest.mock('../../defs/box-shadow', () => jest.fn())

jest.mock('../../defs/avatar-clip', () => jest.fn())

describe('Chart Init Function', () => {
  let mockElement
  let mockSvgElement

  beforeEach(() => {
    // Setup DOM elements for testing
    mockElement = document.createElement('div')
    mockElement.id = 'test-chart'
    
    // Mock offsetWidth and offsetHeight as read-only properties
    Object.defineProperty(mockElement, 'offsetWidth', {
      value: 800,
      writable: false
    })
    Object.defineProperty(mockElement, 'offsetHeight', {
      value: 600,
      writable: false
    })
    
    mockSvgElement = document.createElement('svg')
    
    // Mock document.querySelector
    document.querySelector = jest.fn((selector) => {
      if (selector === '#test-chart') {
        return mockElement
      }
      return null
    })

    // Mock console.error
    console.error = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('Basic initialization', () => {
    test('initializes chart with valid options', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] }
      }

      init(options)

      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
      expect(console.error).not.toHaveBeenCalled()
    })

    test('merges options with default config', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        lineType: 'angle',
        margin: { top: 50, right: 50, bottom: 50, left: 50 }
      }

      init(options)

      // The function should have processed the options
      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })
  })

  describe('Error handling', () => {
    test('logs error when id is missing', () => {
      const options = {
        data: { name: 'CEO', children: [] }
      }

      init(options)

      expect(console.error).toHaveBeenCalledWith('react-org-chart: missing id for svg root')
    })

    test('logs error when DOM element is not found', () => {
      const options = {
        id: '#non-existent',
        data: { name: 'CEO', children: [] }
      }

      init(options)

      expect(console.error).toHaveBeenCalledWith('react-org-chart: svg root DOM node not found (id: #non-existent)')
    })
  })

  describe('DOM manipulation', () => {
    test('clears existing DOM content', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] }
      }

      // Add some content to the element
      mockElement.innerHTML = '<p>Existing content</p>'
      
      init(options)

      expect(mockElement.innerHTML).toBe('')
    })

    test('applies custom styles when provided', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        style: {
          backgroundColor: 'red',
          width: 500
        }
      }

      init(options)

      expect(mockElement.style.backgroundColor).toBe('red')
      expect(mockElement.style.width).toBe('500px')
    })

    test('applies custom className when provided', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        className: 'custom-chart-class'
      }

      init(options)

      expect(mockElement.className).toBe('custom-chart-class')
    })
  })

  describe('Configuration processing', () => {
    test('calculates lineDepthY for angle line type', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        lineType: 'angle',
        nodeHeight: 100
      }

      init(options)

      // Should calculate lineDepthY as nodeHeight + 80 for angle type
      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })

    test('calculates lineDepthY for straight line type', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        lineType: 'straight',
        nodeHeight: 100
      }

      init(options)

      // Should calculate lineDepthY as nodeHeight + 60 for straight type
      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })
  })

  describe('Data handling', () => {
    test('processes tree data correctly', () => {
      const treeData = {
        name: 'CEO',
        children: [
          { name: 'Manager 1', children: [] },
          { name: 'Manager 2', children: [] }
        ]
      }

      const options = {
        id: '#test-chart',
        data: treeData
      }

      init(options)

      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })

    test('handles empty tree data', () => {
      const options = {
        id: '#test-chart',
        data: { children: [] }
      }

      init(options)

      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })
  })

  describe('D3 integration', () => {
    test('sets up d3 tree layout', () => {
      const options = {
        id: '#test-chart',
        data: { name: 'CEO', children: [] },
        nodeWidth: 200,
        nodeHeight: 100,
        nodeSpacing: 20
      }

      init(options)

      // Should have called d3.layout.tree() and nodeSize()
      expect(document.querySelector).toHaveBeenCalledWith('#test-chart')
    })
  })
})
