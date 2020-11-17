const animationDuration = 350
const shouldResize = true

// Nodes
const nodeWidth = 240
const nodeHeight = 120
const nodeSpacing = 12
const nodePaddingX = 16
const nodePaddingY = 16
const avatarWidth = 48
const nodeBorderRadius = 4
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
}

// Lines
const lineType = 'angle'
const lineDepthY = 120 /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff'
const borderColor = '#e6e8e9'
const nameColor = '#332212'
const titleColor = '#332212'
const reportsColor = '#92A0AD'
const lineColor = '#951b81'
const departmentColor = '#89827B'

// style
const style = {
  cursor: 'move',
  height: '100%',
  width: '100%'
}

const className = undefined

const hasDepartment = true

const config = {
  margin,
  animationDuration,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  departmentColor,
  reportsColor,
  lineColor,
  style,
  className,
  shouldResize,
  hasDepartment
}

module.exports = config
