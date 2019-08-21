/* eslint-disable import/no-cycle */
/* eslint-disable class-methods-use-this */
import editor from './editor';

const commandStack = {
  commandList: [],
  recover() {},
  undo() {
    const command = this.commandList.pop();
    if (command) {
      command.undo();
      if (this.commandList.length === 0) {
        editor.emitCommandListEmpty();
      }
    }
  },
};

/**
 * @description 命令的抽象类
 * @class Command
 */
class Command {
  exec() {
    throw new Error('请实现exec方法！');
  }

  undo() {
    throw new Error('请实现undo方法！');
  }
}

/**
 * @description 添加node
 * @class AddNodeCommand
 */
class AddNodeCommand extends Command {
  exec(position, elId) {
    this.id = editor.addNodeByDrag(position, elId);
  }

  undo() {
    editor.removeNode(this.id);
  }
}

/**
 * @description 移除node
 * @class RemoveNodeCommand
 */
class RemoveNodeCommand extends Command {
  exec(nodeId) {
    const [nodeData, nodeEdgesData, nodeEndpointsData] = editor.removeNode(nodeId);
    this.nodeData = nodeData;
    this.nodeEdgesData = nodeEdgesData;
    this.nodeEndpointsData = nodeEndpointsData;
  }

  undo() {
    editor.addNodeByExtraData(this.nodeData, this.nodeEdgesData, this.nodeEndpointsData);
  }
}

/**
 * @description 增加连线
 * @class AddConnectorCommand
 */
class AddConnectorCommand extends Command {
  exec(uuids) {
    this.uuids = uuids;
  }

  undo() {
    editor.removeConnectorByUuids(this.uuids);
  }
}

/**
 * @description 移除连线
 * @class RemoveConnectorCommand
 */
class RemoveConnectorCommand extends Command {
  exec(connector) {
    this.edge = editor.removeConnector(connector);
  }

  undo() {
    editor.addConnector(this.edge);
  }
}

/**
 * @description 移动节点
 * @class MoveNodeCommand
 */
class MoveNodeCommand extends Command {
  exec(id, oldPos) {
    this.id = id;
    this.oldPos = oldPos;
  }

  undo() {
    editor.changeNodePosition(this.id, this.oldPos);
  }
}

/**
 * @description 粘贴节点
 * @class PasteNodeCommand
 */
class PasteNodeCommand extends Command {
  exec(position, nodeId) {
    this.id = editor.addNodeByCopy(position, nodeId);
  }

  undo() {
    editor.removeNode(this.id);
  }
}

/**
 * @description 重命名节点
 * @class RenameNodeCommand
 */
class RenameNodeCommand extends Command {
  exec(nodeId, oldValue, newValue) {
    this.nodeId = nodeId;
    this.oldValue = oldValue;
    editor.renameNode(nodeId, newValue);
  }

  undo() {
    editor.renameNode(this.nodeId, this.oldValue);
  }
}

/**
 * @description 撤销上一个命令
 */
function undo() {
  commandStack.undo();
}

/**
 * @description 默认输出接口 执行命令
 * @export {function} exec
 * @param {Command} Cmd
 * @param {*} args
 */
export default function exec(Cmd, ...args) {
  const cmd = new Cmd();
  cmd.exec(...args);
  commandStack.commandList.push(cmd);
  editor.emitAddCommand();
}

export {
  undo,
  AddNodeCommand,
  RemoveNodeCommand,
  AddConnectorCommand,
  RemoveConnectorCommand,
  MoveNodeCommand,
  RenameNodeCommand,
  PasteNodeCommand,
};
