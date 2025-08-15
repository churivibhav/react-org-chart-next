const { collapse, wrapText, helpers } = require('../index')

// Mock the individual utility modules
jest.mock('../collapse', () => jest.fn())

jest.mock('../wrap-text', () => jest.fn())

jest.mock('../helpers', () => ({
  getTextForTitle: jest.fn(),
  getTextForDepartment: jest.fn(),
  getCursorForNode: jest.fn()
}))

describe('Utils Index', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Exports', () => {
    test('exports collapse function', () => {
      expect(collapse).toBeDefined()
      expect(typeof collapse).toBe('function')
    })

    test('exports wrapText function', () => {
      expect(wrapText).toBeDefined()
      expect(typeof wrapText).toBe('function')
    })

    test('exports helpers object', () => {
      expect(helpers).toBeDefined()
      expect(typeof helpers).toBe('object')
    })
  })

  describe('Module structure', () => {
    test('exports all required utilities', () => {
      const utils = require('../index')
      
      expect(utils).toHaveProperty('collapse')
      expect(utils).toHaveProperty('wrapText')
      expect(utils).toHaveProperty('helpers')
    })

    test('maintains correct function references', () => {
      const collapseModule = require('../collapse')
      const wrapTextModule = require('../wrap-text')
      const helpersModule = require('../helpers')

      expect(collapse).toBe(collapseModule)
      expect(wrapText).toBe(wrapTextModule)
      expect(helpers).toBe(helpersModule)
    })
  })
})
