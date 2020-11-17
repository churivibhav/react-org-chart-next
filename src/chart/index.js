const d3 = require('d3')
const { collapse, wrapText, helpers } = require('../utils')
const defineBoxShadow = require('../defs/box-shadow')
const defineAvatarClip = require('../defs/avatar-clip')
const render = require('./render')
const renderUpdate = require('./render-update')
const defaultConfig = require('./config')

module.exports = {
  init
}

function init(options) {
  // Merge options with the default config
  const config = {
    ...defaultConfig,
    ...options,
    treeData: options.data
  }

  if (!config.id) {
    console.error('react-org-chart: missing id for svg root')
    return
  }

  const {
    id,
    treeData,
    lineType,
    margin,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    style,
    className,
    shouldResize,
    zoomInId,
    zoomOutId,
    zoomExtentId,
    loadConfig
  } = config

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered
  if (lineType == 'angle') {
    config.lineDepthY = nodeHeight + 80
  } else {
    config.lineDepthY = nodeHeight + 60
  }

  // Get the root element
  const elem = document.querySelector(id)

  if (!elem) {
    console.error(`react-org-chart: svg root DOM node not found (id: ${id})`)
    return
  }

  // Apply style props
  const css = (el, styles) => {
    for (const property in styles) {
      const value =
        typeof styles[property] === 'number'
          ? `${styles[property]}px`
          : styles[property]

      el.style[property] = value
    }
  }
  css(elem, style)

  // Apply className props
  if (className) {
    elem.className = className
  }

  // Reset in case there's any existing DOM
  elem.innerHTML = ''

  const elemWidth = elem.offsetWidth
  const elemHeight = elem.offsetHeight

  // Setup the d3 tree layout
  config.tree = d3.layout
    .tree()
    .nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing])

  // Calculate width of a node with expanded children
  const childrenWidth = parseInt((treeData.children.length * nodeWidth) / 2)

  // Add svg root for d3
  const svgroot = d3
    .select(id)
    .append('svg')
    .attr('width', elemWidth)
    .attr('height', elemHeight)

  // Add our base svg group to transform when a user zooms/pans
  const svg = svgroot
    .append('g')
    .attr(
      'transform',
      'translate(' +
        parseInt(
          childrenWidth + (elemWidth - childrenWidth * 2) / 2 - margin.left / 2
        ) +
        ',' +
        20 +
        ')'
    )

  // Define box shadow and avatar border radius
  defineBoxShadow(svgroot, 'boxShadow')
  defineAvatarClip(svgroot, 'avatarClip', {
    borderRadius: 40
  })

  // Center the viewport on initial load
  treeData.x0 = 0
  treeData.y0 = elemHeight / 2

  // Collapse all of the children on initial load
  treeData.children.forEach(collapse)

  // Connect core variables to config so that they can be
  // used in internal rendering functions
  config.svg = svg
  config.svgroot = svgroot
  config.render = render

  // Defined zoom behavior
  const zoom = d3.behavior
    .zoom()
    // Define the [zoomOutBound, zoomInBound]
    .scaleExtent([0.4, 2])
    .duration(50)
    .on('zoom', renderUpdate(config))

  // Attach zoom behavior to the svg root
  svgroot.call(zoom)

  // Define the point of origin for zoom transformations
  zoom.translate([
    parseInt(
      childrenWidth + (elemWidth - childrenWidth * 2) / 2 - margin.left / 2
    ),
    20
  ])

  // Zoom update
  function zoomed() {
    svg.attr(
      'transform',
      'translate(' + zoom.translate() + ')' + 'scale(' + zoom.scale() + ')'
    )
  }

  // To update translate and scale of zoom
  function interpolateZoom(translate, scale) {
    var self = this
    d3.event.preventDefault()
    return d3
      .transition()
      .duration(350)
      .tween('zoom', function() {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
          iScale = d3.interpolate(zoom.scale(), scale)
        return function(t) {
          zoom.scale(iScale(t)).translate(iTranslate(t))
          zoomed()
        }
      })
  }

  // Zoom on button click
  function zoomClick() {
    // Zoom extent to fit svg on the screen
    if (this.id === zoomExtentId) {
      const latestConfig = loadConfig()
      const {
        nodeLeftX,
        nodeRightX,
        nodeY,
        elemHeight,
        elemWidth,
      } = latestConfig

      const svgWidth = nodeLeftX + nodeRightX
      const svgHeight = nodeY + nodeHeight * 2 + 48

      let scaleX = elemWidth / svgWidth - 0.03
      let scaleY = elemHeight / svgHeight - 0.06
      const chooseScale = scaleX < scaleY ? scaleX : scaleY
      let scale =
        svgWidth > elemWidth || svgHeight > elemHeight ? chooseScale : 1
      let translateX = nodeLeftX * scale + margin.left / 2

      if (svgWidth > elemWidth || svgHeight > elemHeight) {
        //If width is more than height
        if (scaleX < scaleY) {
          interpolateZoom([translateX, 48], scale)
          //If height is more than width
        } else if (scaleX > scaleY) {
          translateX = elemWidth / 2 - margin.left / 2
          interpolateZoom([translateX, 48], scale)
        }
      } else {
        translateX = elemWidth / 2 - margin.left / 2
        interpolateZoom([translateX, 48], scale)
      }

      return
    }
    var clicked = d3.event.target,
      direction = 1,
      factor = 0.2,
      target_zoom = 1,
      center = [elemWidth / 2, elemHeight / 2],
      extent = zoom.scaleExtent(),
      translate = zoom.translate(),
      translate0 = [],
      l = [],
      view = { x: translate[0], y: translate[1], k: zoom.scale() }

    d3.event.preventDefault()
    direction = this.id === zoomInId ? 1 : -1
    target_zoom = zoom.scale() * (1 + factor * direction)

    if (target_zoom < extent[0] || target_zoom > extent[1]) {
      return false
    }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k]
    view.k = target_zoom
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y]

    view.x += center[0] - l[0]
    view.y += center[1] - l[1]

    interpolateZoom([view.x, view.y], view.k)
  }

  // d3 selects button on click
  d3.select(`#${zoomInId}`).on('click', zoomClick)
  d3.select(`#${zoomOutId}`).on('click', zoomClick)
  d3.select(`#${zoomExtentId}`).on('click', zoomClick)

  // Add listener for when the browser or parent node resizes
  const resize = () => {
    if (!elem) {
      global.removeEventListener('resize', resize)
      return
    }

    svgroot.attr('width', elem.offsetWidth).attr('height', elem.offsetHeight)
  }

  if (shouldResize) {
    global.addEventListener('resize', resize)
  }

  // Start initial render
  render(config)

  // Update DOM root height
  d3.select(id).style('height', elemHeight + margin.top + margin.bottom)
}
