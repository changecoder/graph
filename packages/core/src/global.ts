const subjectColor = 'rgb(95, 149, 255)'

const nodeMainFill = 'rgb(239, 244, 255)'

const edgeMainStroke = 'rgb(224, 224, 224)'

const comboFill = 'rgb(253, 253, 253)'

const activeFill = 'rgb(247, 250, 255)'

const colorSet = {
  mainStroke: subjectColor,
  activeStroke: subjectColor,
  activeFill,

  // for edges
  edgeMainStroke,

  // for combos
  comboMainStroke: edgeMainStroke,
  comboMainFill: comboFill
}

export default {
  version: '0.0.1',
  rootContainerClassName: 'root-container',
  nodeContainerClassName: 'node-container',
  edgeContainerClassName: 'edge-container',
  comboContainerClassName: 'combo-container',
  delegateContainerClassName: 'delegate-container',
  defaultNode: {
    type: 'circle',
    style: {
      lineWidth: 1,
      stroke: colorSet.mainStroke,
      fill: nodeMainFill,
    },
    size: 20,
    color: colorSet.mainStroke,
    linkPoints: {
      size: 8,
      lineWidth: 1,
      fill: colorSet.activeFill,
      stroke: colorSet.activeStroke,
    },
  },
  defaultEdge: {
    type: 'line',
    size: 1,
    style: {
      stroke: colorSet.edgeMainStroke,
      lineAppendWidth: 2,
    },
    color: colorSet.edgeMainStroke,
  },
  defaultCombo: {
    type: 'circle',
    style: {
      fill: colorSet.comboMainFill,
      lineWidth: 1,
      stroke: colorSet.comboMainStroke,
      r: 5,
      width: 20,
      height: 10,
    },
    size: [20, 5],
    color: colorSet.comboMainStroke,
    padding: [25, 20, 15, 20]
  }
}