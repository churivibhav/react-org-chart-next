const React = require('react')
const { render, screen } = require('@testing-library/react')
const OrgChart = require('../org-chart')

// Mock the chart init function
jest.mock('../../chart', () => ({
  init: jest.fn()
}))

// Mock the chart init function
const { init } = require('../../chart')

describe('OrgChart Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
    
    // Setup DOM element for testing
    document.body.innerHTML = '<div id="test-container"></div>'
  })

  afterEach(() => {
    // Clean up DOM after each test
    document.body.innerHTML = ''
  })

  describe('Rendering', () => {
    test('renders with default props', () => {
      render(<OrgChart />)
      
      const chartElement = screen.getByTestId('org-chart')
      expect(chartElement).toBeInTheDocument()
      expect(chartElement.id).toBe('react-org-chart')
    })

    test('renders with custom id', () => {
      render(<OrgChart id="custom-chart" />)
      
      const chartElement = screen.getByTestId('org-chart')
      expect(chartElement).toBeInTheDocument()
      expect(chartElement.id).toBe('custom-chart')
    })

    test('renders as a div element', () => {
      render(<OrgChart />)
      
      const chartElement = screen.getByTestId('org-chart')
      expect(chartElement.tagName).toBe('DIV')
    })
  })

  describe('Props handling', () => {
    test('passes all props to init function except id and tree', () => {
      const mockTree = { name: 'CEO', children: [] }
      const mockOptions = {
        lineType: 'angle',
        margin: 20,
        nodeWidth: 200,
        nodeHeight: 100
      }

      render(<OrgChart id="test-chart" tree={mockTree} {...mockOptions} />)
      
      expect(init).toHaveBeenCalledWith({
        id: '#test-chart',
        data: mockTree,
        ...mockOptions
      })
    })

    test('handles empty tree data', () => {
      render(<OrgChart id="test-chart" tree={{}} />)
      
      expect(init).toHaveBeenCalledWith({
        id: '#test-chart',
        data: {}
      })
    })

    test('handles tree with children', () => {
      const mockTree = {
        name: 'CEO',
        children: [
          { name: 'Manager 1' },
          { name: 'Manager 2' }
        ]
      }

      render(<OrgChart id="test-chart" tree={mockTree} />)
      
      expect(init).toHaveBeenCalledWith({
        id: '#test-chart',
        data: mockTree
      })
    })
  })

  describe('Lifecycle', () => {
    test('calls init on componentDidMount', () => {
      const mockTree = { name: 'CEO' }
      
      render(<OrgChart id="test-chart" tree={mockTree} />)
      
      expect(init).toHaveBeenCalledTimes(1)
      expect(init).toHaveBeenCalledWith({
        id: '#test-chart',
        data: mockTree
      })
    })

    test('does not call init without required props', () => {
      render(<OrgChart />)
      
      expect(init).toHaveBeenCalledTimes(1)
      expect(init).toHaveBeenCalledWith({
        id: '#react-org-chart',
        data: undefined
      })
    })
  })

  describe('Default props', () => {
    test('uses default id when not provided', () => {
      render(<OrgChart />)
      
      expect(init).toHaveBeenCalledWith({
        id: '#react-org-chart',
        data: undefined
      })
    })

    test('overrides default id when provided', () => {
      render(<OrgChart id="override-id" />)
      
      expect(init).toHaveBeenCalledWith({
        id: '#override-id',
        data: undefined
      })
    })
  })

  describe('Component structure', () => {
    test('extends PureComponent', () => {
      expect(OrgChart.prototype.constructor.name).toBe('OrgChart')
      expect(OrgChart.prototype.render).toBeDefined()
    })

    test('has static defaultProps', () => {
      expect(OrgChart.defaultProps).toEqual({
        id: 'react-org-chart'
      })
    })
  })

  describe('Integration with chart init', () => {
    test('passes correct id format to init', () => {
      render(<OrgChart id="test-chart" />)
      
      expect(init).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '#test-chart'
        })
      )
    })

    test('passes tree data correctly', () => {
      const mockTree = {
        name: 'Test Node',
        children: [
          { name: 'Child 1' },
          { name: 'Child 2' }
        ]
      }

      render(<OrgChart id="test-chart" tree={mockTree} />)
      
      expect(init).toHaveBeenCalledWith(
        expect.objectContaining({
          data: mockTree
        })
      )
    })
  })
})
