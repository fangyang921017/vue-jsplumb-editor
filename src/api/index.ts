import axios from 'axios';

function getFlowChartData() {
  return new Promise((resolve, reject) => {
    axios.get('api/getFlowChartData').then(resolve).catch(reject);
  });
}

function getMenuData() {
  return new Promise((resolve, reject) => {
    axios.get('api/getMenuData').then(resolve).catch(reject);
  });
}
export default {
  getFlowChartData,
  getMenuData,
};
