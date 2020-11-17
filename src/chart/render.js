const { wrapText, helpers } = require('../utils')
const renderLines = require('./render-lines')
const onClick = require('./on-click')
const iconLink = require('./components/icon-link')

const CHART_NODE_CLASS = 'org-chart-node'
const PERSON_LINK_CLASS = 'org-chart-person-link'
const PERSON_NAME_CLASS = 'org-chart-person-name'
const PERSON_TITLE_CLASS = 'org-chart-person-title'
const PERSON_DEPARTMENT_CLASS = 'org-chart-person-dept'
const PERSON_REPORTS_CLASS = 'org-chart-person-reports'

function render(config) {
  const {
    svgroot,
    svg,
    tree,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    departmentColor,
    reportsColor,
    borderColor,
    lineColor,
    avatarWidth,
    lineDepthY,
    treeData,
    sourceNode,
    onPersonLinkClick,
    hasDepartment
  } = config

  // Compute the new tree layout.
  const nodes = tree.nodes(treeData).reverse()
  const links = tree.links(nodes)

  config.links = links
  config.nodes = nodes

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * lineDepthY
  })

  // Update the nodes
  const node = svg
    .selectAll('g.' + CHART_NODE_CLASS)
    .data(nodes.filter(d => d.id), d => d.id)
  const parentNode = sourceNode || treeData

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .insert('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', `translate(${parentNode.x0}, ${parentNode.y0})`)
    .on('click', onClick(config))

  // Person Card Shadow
  nodeEnter
    .append('rect')
    .attr('y', (avatarWidth / 2))
    .attr('width', nodeWidth)
    .attr('height', nodeHeight + 15)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('fill-opacity', 0.05)
    .attr('stroke-opacity', 0.025)
    .attr('filter', 'url(#boxShadow)')

  // Person Card Container
  nodeEnter
    .append('rect')
    .attr('y', (avatarWidth / 2))
    .attr('width', nodeWidth)
    .attr('height', nodeHeight + 15)
    .attr('id', d => d.id)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .style('cursor', 'default')
    .attr('class', 'box')

  const avatarPos = {
    x: nodeWidth / 2 - avatarWidth / 2,
    y: 0,
  }

  const namePos = {
    x: nodeWidth / 2,
    y: nodePaddingY + avatarWidth + 8
  }

  const titlePos = {
    x: nodeWidth / 2,
    y: namePos.y + (nodePaddingY * 1.4)
  }

  const departmentPos = {
    x: nodeWidth / 2,
    y: titlePos.y + (nodePaddingY * 1.3)
  }

  const reportsPos = {
    x: nodeWidth / 2,
    y: nodeHeight + 15 + nodePaddingY
  }

  // Person's Name
  nodeEnter
    .append('a')
    .attr('xlink:href', d => d.person.link)
    .append('text')
    .attr('class', PERSON_NAME_CLASS + ' unedited')
    .attr('x', namePos.x)
    .attr('y', namePos.y)
    .attr('dy', '0em')
    .style('cursor', 'default')
    .style('fill', nameColor)
    .style('font-size', 14)
    .style('font-weight', 700)
    .text(d => d.person.name)

  // Person's Title
  nodeEnter
    .append('text')
    .attr('class', PERSON_TITLE_CLASS + ' unedited')
    .attr('x', titlePos.x)
    .attr('y', titlePos.y)
    .attr('dy', '1em')
    .style('font-size', 14)
    .style('font-weight', 400)
    .style('cursor', 'default')
    .style('fill', titleColor)
    .text(d => d.person.title)

/*   const heightForTitle = 45 // getHeightForText(d.person.title) */

  // Person's Department
  hasDepartment && nodeEnter
    .append('text')
    .attr('class', PERSON_DEPARTMENT_CLASS + ' unedited')
    .attr('title', helpers.getTextForDepartment)
    .attr('x', departmentPos.x)
    .attr('y', departmentPos.y)
    .attr('dy', '2em')
    .style('cursor', 'default')
    .style('fill', departmentColor)
    .style('font-weight', 400)
    .style('font-size', 14)
    .text(helpers.getTextForDepartment)

  // Reports circle background
  nodeEnter
    .append('circle')
    .attr('display', d => (d.person.totalReports > 0 ? '' : 'none'))
    .attr('fill', lineColor)
    .attr('cx', reportsPos.x)
    .attr('cy', reportsPos.y + 10)
    .attr('r', 12)

  // Person's Reports
  nodeEnter
    .append('text')
    .attr('class', PERSON_REPORTS_CLASS + ' unedited')
    .attr('x', reportsPos.x)
    .attr('y', reportsPos.y + 4)
    .attr('dy', '.9em')
    .style('font-size', 13)
    .style('font-weight', 700)
    .style('color', '#FFFFFF')
    .style('cursor', 'default')
    .style('fill', '#FFFFFF')
    .text(helpers.getTextForTitle)

  // Person's Avatar
  nodeEnter
    .append('image')
    .attr('id', d => `image-${d.id}`)
    .attr('width', avatarWidth)
    .attr('height', avatarWidth)
    .attr('x', avatarPos.x)
    .attr('y', avatarPos.y)
    .attr('stroke', borderColor)
    .attr('src', d => d.person.avatar)
    .attr('href', d => d.person.avatar)
    .attr('clip-path', 'url(#avatarClip)')

/*   // Person's Link
  const nodeLink = nodeEnter
    .append('a')
    .attr('class', PERSON_LINK_CLASS)
    .attr('xlink:href', d => d.person.link)
    .attr('display', d => (d.person.link ? '' : 'none'))
    .on('click', datum => {
      d3.event.stopPropagation()
      // TODO: fire link click handler
      if (onPersonLinkClick) {
        onPersonLinkClick(datum, d3.event)
      }
    })

  iconLink({
    svg: nodeLink,
    x: nodeWidth - 20,
    y: 8
  }) */

  // Transition nodes to their new position.
  const nodeUpdate = node
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${d.x},${d.y})`)

  nodeUpdate
    .select('rect.box')
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)

  // Transition exiting nodes to the parent's new position.
  const nodeExit = node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', d => `translate(${parentNode.x},${parentNode.y})`)
    .remove()

  // Update the links
  const link = svg.selectAll('path.link').data(links, d => d.target.id)

  // Wrap the title texts
  const wrapWidth = nodeWidth - (nodePaddingX * 2)

  svg.selectAll('text.unedited.' + PERSON_NAME_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_TITLE_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_DEPARTMENT_CLASS).call(wrapText, wrapWidth)
  svg.selectAll('text.unedited.' + PERSON_REPORTS_CLASS).call(wrapText, wrapWidth)

  // Render lines connecting nodes
  renderLines(config)

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x
    d.y0 = d.y
  })
}

/* function getDepartmentClass(d) {
  const { person } = d
  const deptClass = person.department ? person.department.toLowerCase() : ''

  return [PERSON_DEPARTMENT_CLASS, deptClass].join(' ')
} */

module.exports = render
