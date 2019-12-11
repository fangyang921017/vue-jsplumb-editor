/* eslint-disable import/no-cycle */
import Tooltip from 'tooltip.js';
import Vue from 'vue';
import Node from './Node.vue';
import contextMenu from './contextMenu';
import instance from './instance';
import model from './model';
import FlowChart from './index';
import { EventCenter } from './EventCenter';
import { sourceEndpoint, targetEndpoint } from './style';
import { isEndpoint, createUuid } from './Utils';
import { CONNECTORSEPARATESYMBOL } from './const';
import exec, { AddConnectorCommand, MoveNodeCommand } from './Command';


let container = null;

/**
 * @description 触发命令列表为空事件
 */
function emitCommandListEmpty() {
  FlowChart.emit('commandListEmpty');
}

/**
 * @description 触发增加命令事件
 */
function emitAddCommand() {
  FlowChart.emit('addCommand');
}

function emitShowNodeData(nodeId) {
  FlowChart.emit('showNodeData', nodeId);
}

/**
 * @description 移除当前选中节点的className：fy_node_selected
 */
function removeClassNameSelected() {
  const selected = document.getElementsByClassName('fy_node_selected')[0];
  if (selected) {
    selected.classList.remove('fy_node_selected');
  }
}

/**
 * @description 向指定nodeid的节点添加目标端点
 * @param {string} toId 需要添加目标端点的node的id
 * @param {array} endpointsData 目标端点数组 [{id:'aa',data:{}}]
 */
function addTargetEndpoints(toId, endpointsData) {
  const len = endpointsData.length;
  const space = 1 / (len + 1);
  for (let j = 0; j < len; j += 1) {
    const endpoint = instance.addEndpoint(toId, targetEndpoint, {
      anchor: [space * (j + 1), 0, 0, -1],
      uuid: endpointsData[j].id,
    });

    const tip = new Tooltip(endpoint.canvas, {
      title: endpointsData[j].data.value,
      placement: 'top',
      trigger: 'manual',
      container: endpoint.canvas,
    });
    endpoint.canvas.tip = tip;
  }
}

/**
 * @description 向指定nodeid的节点添加源端点
 * @param {string} toId 需要添加源端点的node的id
 * @param {array} endpointsData 源端点数组 [{id:'aa',data:{}}]
 */
function addSourceEndpoints(toId, endpointsData) {
  const len = endpointsData.length;
  const space = 1 / (len + 1);
  for (let j = 0; j < len; j += 1) {
    const endpoint = instance.addEndpoint(
      toId,
      sourceEndpoint, {
        anchor: [space * (j + 1), 1, 0, 1],
        uuid: endpointsData[j].id,
      },
    );
    const tip = new Tooltip(endpoint.canvas, {
      title: endpointsData[j].data.value,
      placement: 'bottom',
      container: endpoint.canvas,
    });

    endpoint.bind('mouseover', () => {
      tip.show();
    });
    endpoint.bind('mouseout', () => {
      tip.hide();
    });
  }
}

/**
 * @description 获取缩放比率
 * @returns {number} 缩放比率
 */
function getScale() {
  let scale1;
  if (instance.pan) {
    const { scale } = instance.pan.getTransform();
    scale1 = scale;
  } else {
    const matrix = window.getComputedStyle(container).transform;
    scale1 = matrix.split(', ')[3] * 1;
  }
  instance.setZoom(scale1);
  return scale1;
}

/**
 * @description 执行移动节点命令
 * @param {Element} nodeEl 节点的Element对象
 */
function execMoveNodeCommand(nodeEl) {
  const { left, top } = nodeEl.style;
  exec(MoveNodeCommand, nodeEl.id, {
    left: parseFloat(left),
    top: parseFloat(top),
  });
}

/**
 * @description 改变节点位置
 * @param {string} id 节点的id属性值
 * @param {object} pos {left,top}
 */
function changeNodePosition(id, pos) {
  const el = document.getElementById(id);
  el.style.left = `${pos.left}px`;
  el.style.top = `${pos.top}px`;
  instance.revalidate(el);
  model.changeNodePos(id, pos);
}

/**
 * @description 为每一个节点绑定拖动事件
 * @param {Element} newNode
 */
function bindDragEventOnNode(newNode) {
  instance.draggable(newNode, {
    start() {
      execMoveNodeCommand(newNode);
    },
    stop(params) {
      model.changeNodePos(newNode.id, {
        left: params.pos[0],
        top: params.pos[1],
      });
    },
  });
}

function changeStateByNodeId(nodeId, state) {
  const nodeEl = document.getElementById(nodeId);
  nodeEl.vNode.$children[0].state = state;
}

function getConnectorByUuids(uuids) {
  const edge = uuids.join(CONNECTORSEPARATESYMBOL);
  const connectors = instance.getAllConnections();
  const connector = connectors.find(c => c.getUuids().join(CONNECTORSEPARATESYMBOL) === edge);
  return connector;
}

function blingConnectors(edges) {
  const connectors = instance.getAllConnections();
  connectors.forEach((c) => {
    c.canvas.classList.remove('active');
  });

  edges.forEach((edge) => {
    const c = getConnectorByUuids(edge.split(CONNECTORSEPARATESYMBOL));
    c.canvas.classList.add('active');
  });
}

/**
 * @description 生成节点并插入到设计区域
 * @param {number} left
 * @param {number} top
 * @param {string} id
 * @param {string} html
 * @returns {Element} 返回生成的节点
 */
function generateNode(left, top, id, iconCLassName, contentText, nodeState) {
  // 节点最外层div
  const newNode = document.createElement('div');
  newNode.classList.add('fy_node');
  newNode.style.left = `${left}px`;
  newNode.style.top = `${top}px`;

  newNode.id = id;
  container.appendChild(newNode);

  // 右键菜单
  newNode.oncontextmenu = (ev) => {
    ev.preventDefault();
    contextMenu.show({
      left: ev.pageX,
      top: ev.pageY,
    }, id);

    ev.stopPropagation();
  };

  // 切换选中状态
  newNode.onclick = (ev) => {
    ev.stopPropagation();
    removeClassNameSelected();
    newNode.classList.add('fy_node_selected');
    FlowChart.emit('selectNode', id);
  };
  EventCenter.on('document.click', () => {
    removeClassNameSelected();
  });

  // 插入容器
  const component = new Vue({
    render(h) {
      return h(Node, {
        props: {
          iconCLassName,
          contentText,
          nodeState,
        },
      });
    },
  }).$mount();
  newNode.appendChild(component.$el);
  newNode.vNode = component;
  bindDragEventOnNode(newNode);
}

/**
 * @description 根据action生成node
 * @param {string} action 'drag' 或者 'copy' 触发增加节点的动作
 * @param {*} position
 * @param {*} icon
 * @param {*} value
 * @returns
 */
function addNodeByAction(action, position, icon, value) {
  const containerRect = container.getBoundingClientRect();
  const scale = getScale();
  const id = `node-${createUuid()}`;
  let left = (position.pageX - containerRect.left) / scale;
  let top = (position.pageY - containerRect.top) / scale;
  if (action === 'drag') {
    left -= 86;
    top -= 18;
  }
  const targetEndpoints = [{ id: `target-${createUuid()}`, data: { value: '输入' } }];
  const sourceEndpoints = [{ id: `source-${createUuid()}`, data: { value: '输出' } }];
  generateNode(left, top, id, icon, value);
  addTargetEndpoints(id, targetEndpoints);
  addSourceEndpoints(id, sourceEndpoints);
  model.addNode({
    id,
    points: {
      targets: targetEndpoints.map(point => point.id),
      sources: sourceEndpoints.map(point => point.id),
    },
    position: {
      left, top,
    },
    data: {
      icon,
      value,
    },
  });
  [...targetEndpoints].concat([...sourceEndpoints]).forEach((point) => {
    model.addEndpoint(point);
  });

  return id;
}

/**
 * @description 根据edges数据生成连接线
 * @param {*} edges
 */
function addConnectorsByEdges(edges) {
  edges.forEach((str) => {
    instance.connect({ uuids: str.split(CONNECTORSEPARATESYMBOL) });
  });
}

/**
 * @description 根据特定id的node节点，和给点的相对位置在editor上添加节点
 * @param {object} position {pageX,pageY}  鼠标在页面上的位置
 * @param {stirng} elId 候选节点的id，用来获取节点信息
 */
function addNodeByDrag(position, elId) {
  const copeNode = document.getElementById(elId);
  const contentText = copeNode.lastElementChild.innerHTML;
  const icon = copeNode.firstElementChild.className;
  return addNodeByAction('drag', position, icon, contentText);
}

/**
 * @description 根据特定id的node数据，和鼠标在页面上的位置 增加新的节点
 * @param {object} position {pageX,pageY}  鼠标在页面上的位置
 * @param {stirng} elId 候选节点的id，用来获取节点信息
 */
function addNodeByCopy(position, nodeId) {
  const nodeData = model.getNodeDataByNodeId(nodeId);
  const { icon, value } = nodeData.data;
  return addNodeByAction('copy', position, icon, value);
}

/**
 * @description 根据节点数据渲染节点 ，此时的动作只有一个：根据数据生成节点
 *  @param {*} nodeData
 */
function addNodeByData(nodeData) {
  const { endpoints } = model.getData();
  const {
    id, position, points, data,
  } = nodeData;
  generateNode(position.left, position.top, id, data.icon, data.value, data.nodeState);
  const { targets, sources } = points;
  const targetsData = endpoints.filter(item => targets.indexOf(item.id) > -1);
  const sourcesData = endpoints.filter(item => sources.indexOf(item.id) > -1);
  addTargetEndpoints(id, targetsData);
  addSourceEndpoints(id, sourcesData);
}

/**
 * @description 根据提供（额外的）的数据渲染节点 ，比如在删除节点后点击恢复添加的节点，此时的动作有2个： 1.  根据数据生成节点  2. 在model中添加节点数据
 * @param {*} nodeData
 */
function addNodeByExtraData(nodeData, nodeEdgesData, nodeEndpointsData) {
  model.addNode(nodeData);
  nodeEdgesData.forEach((edge) => {
    model.addEdge(edge);
  });
  nodeEndpointsData.forEach((endpoint) => {
    model.addEndpoint(endpoint);
  });
  addNodeByData(nodeData);
  addConnectorsByEdges(nodeEdgesData);
}

/**
 * @description 根据给定的node数据生成node节点
 */
function addNodesByData() {
  const { nodes } = model.getData();
  nodes.forEach((n) => {
    addNodeByData(n);
  });
}

/**
 * @description 根据给定的数据生成连接线
 */
function addConnectorsByData() {
  const { edges } = model.getData();
  addConnectorsByEdges(edges);
}

/**
 * @description 移除节点（Node）
 * @param {*} nodeId 节点id
 */
function removeNode(nodeId) {
  const nodeData = model.getNodeDataByNodeId(nodeId);
  const relatedPointIds = [...nodeData.points.sources, ...nodeData.points.targets];
  const nodeEdgesData = model.getEdgesByPointIds(relatedPointIds);
  const nodeEndpointsData = model.getEndpointsByPointIds(relatedPointIds);
  model.removeNodeByNodeId(nodeId);
  model.removeEdgesByPointIds(relatedPointIds);
  model.removeEndpointsByPointIds(relatedPointIds);
  instance.remove(nodeId);
  return [nodeData, nodeEdgesData, nodeEndpointsData];
}

/**
 * @description 编程式添加连接线
 * @param {string} edge 用于标识边的对应关系的字符串 格式：sourceId${分隔符}targetId
 */
function addConnector(edge) {
  instance.connect({ uuids: edge.split(CONNECTORSEPARATESYMBOL) });
  model.addEdge(edge);
}

/**
 * @description 移除连接线
 * @param {connector} connector 连接线对象
 */
function removeConnector(connector) {
  const edge = connector.getUuids().join(CONNECTORSEPARATESYMBOL);
  model.removeEdge(edge);
  instance.deleteConnection(connector);
  return edge;
}

/**
 * @description 通过uuids来移除连接线
 * @param {array} uuids
 */
function removeConnectorByUuids(uuids) {
  removeConnector(getConnectorByUuids(uuids));
}

/**
 * @description
 * @param {string} nodeId
 * @param {string} value
 */
function renameNode(nodeId, value) {
  const nodeEl = document.getElementById(nodeId);
  const cComp = nodeEl.vNode.$children[0];
  cComp.text = value;
  model.changeNodeValue(nodeId, value);
}

/**
 * @description 根据model里的数据  渲染流程图
 */
function render() {
  addNodesByData();
  addConnectorsByData();
}

/**
 * @description 执行增加连接线命令
 * @param {array} uuids [sourceUuid,targetId]
 */
function execAddConnectorCommand(uuids) {
  exec(AddConnectorCommand, uuids);
  model.addEdge(uuids.join(CONNECTORSEPARATESYMBOL));
}

/**
 * @description 模拟延时效果
 * @param {function} fn
 * @param {number} time
 * @returns
 */
function timeout(fn, time) {
  return new Promise((res) => {
    setTimeout(() => {
      fn();
      res(true);
    }, time);
  });
}

/**
 * @description 执行当前实验
 */
function execModel() {
  changeStateByNodeId('aaa', 'loading');
  return timeout(() => {
    changeStateByNodeId('aaa', 'success');
    changeStateByNodeId('bbb', 'loading');
    blingConnectors(['source1&&target1', 'source2&&target2']);
  }, 3000)
    .then(() => timeout(() => {
      changeStateByNodeId('bbb', 'success');
      changeStateByNodeId('ccc', 'loading');
      blingConnectors(['source3&&ccc111', 'source3&&ccc222']);
    }, 4000))
    .then(() => timeout(() => {
      changeStateByNodeId('ccc', 'success');
      changeStateByNodeId('ddd', 'failed');
      blingConnectors([]);
    }, 5000));
}

/**
 * @description 绑定事件（节点的右键菜单事件在 generateNode 函数中绑定）
 */
function bindEvent() {
  // 右键菜单事件
  instance.bind('contextmenu', (component, originalEvent) => {
    originalEvent.preventDefault();
    originalEvent.stopPropagation();
    if (isEndpoint(component)) return;
    contextMenu.show({
      left: originalEvent.pageX,
      top: originalEvent.pageY,
    }, component);
  });
  instance.getContainer().parentElement.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    contextMenu.show({
      left: ev.pageX,
      top: ev.pageY,
    });
  });

  // 手动拖动创建连接事件
  instance.bind('connection', (info, ev) => {
    if (ev) {
      const uuids = info.connection.getUuids();
      execAddConnectorCommand(uuids);
    }
  });


  // 拖动端点连线时 显示目标端点tooltip
  instance.bind('connectionDrag', () => {
    const Nodelist = document.querySelectorAll('.jtk-endpoint.targetPoint:not(.jtk-endpoint-connected)');
    [].forEach.call(Nodelist, (el) => {
      el.tip.show();
    });
  });
  instance.bind('connectionDragStop', () => {
    const Nodelist = document.querySelectorAll('.jtk-endpoint.targetPoint');
    [].forEach.call(Nodelist, (el) => {
      el.tip.hide();
    });
  });

  // 开始拖动新连接时
  instance.bind('beforeDrop', (params) => {
    if (params.sourceId === params.targetId) {
      return false;
    }
    return true;
  });


  // 点击连接线变换样式
  // instance.bind('click', (c) => {
  // c.canvas.classList.add('active');
  // });
}

/**
 * @description 初始化
 */
function init() {
  container = instance.getContainer();
  bindEvent();
}

const editor = {
  emitCommandListEmpty,
  emitAddCommand,
  emitShowNodeData,
  addNodeByDrag,
  addNodeByCopy,
  addNodeByExtraData,
  addConnector,
  changeNodePosition,
  init,
  render,
  getScale,
  removeNode,
  removeConnector,
  renameNode,
  execAddConnectorCommand,
  removeConnectorByUuids,
  execModel,
};

export default editor;
