let FlowChartJson = {
  nodes: [],
  endpoints: [],
  edges: [],
  head: '',
};

export default {
  getData() {
    return FlowChartJson;
  },

  setData(data) {
    FlowChartJson = data;
  },

  getEndpoints() {
    return FlowChartJson.endpoints;
  },

  addNode(nodeData) {
    FlowChartJson.nodes.push(nodeData);
  },

  removeNodeByNodeId(nodeId) {
    FlowChartJson.nodes = FlowChartJson.nodes.filter(node => node.id !== nodeId);
  },

  getNodeDataByNodeId(nodeId) {
    return FlowChartJson.nodes.find(n => n.id === nodeId);
  },

  addEdge(edge) {
    FlowChartJson.edges.push(edge);
  },

  removeEdge(edge) {
    FlowChartJson.edges = FlowChartJson.edges.filter(item => item !== edge);
  },

  getEdgesByPointIds(ids) {
    const data = [];
    FlowChartJson.edges.forEach((edge) => {
      ids.forEach((id) => {
        if (edge.indexOf(id) > -1) {
          data.push(edge);
        }
      });
    });
    return data;
  },

  removeEdgesByPointIds(ids) {
    ids.forEach((id) => {
      FlowChartJson.edges = FlowChartJson.edges.filter(edge => edge.indexOf(id) === -1);
    });
  },

  addEndpoint(point) {
    FlowChartJson.endpoints.push(point);
  },

  getEndpointsByPointIds(ids) {
    return [...FlowChartJson.endpoints.filter((point) => {
      if (ids.indexOf(point.id) > -1) {
        return true;
      }
      return false;
    })];
  },

  removeEndpointsByPointIds(ids) {
    ids.forEach((id) => {
      FlowChartJson.endpoints = FlowChartJson.endpoints.filter(point => point.id !== id);
    });
  },

  changeNodePos(nodeId, newPosition) {
    const node = FlowChartJson.nodes.find(n => n.id === nodeId);
    node.position = newPosition;
  },

  changeNodeValue(nodeId, value) {
    const node = FlowChartJson.nodes.find(n => n.id === nodeId);
    node.data.value = value;
  },

  getHead() {
    return FlowChartJson.head;
  },
};
