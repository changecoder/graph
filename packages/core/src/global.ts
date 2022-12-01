const subjectColor = 'rgb(95, 149, 255)'

const nodeMainFill = 'rgb(239, 244, 255)'

const activeFill = 'rgb(247, 250, 255)'

const colorSet = {
  mainStroke: subjectColor,
  activeStroke: subjectColor,
  activeFill,
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
}