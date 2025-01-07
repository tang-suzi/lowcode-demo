import { onUnmounted } from "vue";
import { events } from "./events";
import { cloneDeep } from "lodash";

export function useCommand(data, focusData) {
  const state = {
    current: -1,
    queue: [], // 存放操作指令
    commands: {}, // 指令和功能的映射
    commandArray: [],
    destroyArray: [],
  };
  const registry = (command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      // 指令对应执行函数
      const { redo, undo } = command.execute(...args);
      redo();
      if (!command.pushQueue) {
        return;
      }
      let { queue, current } = state;
      // 兼容撤回操作
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1); // 可能在放置的过程中有撤销操作，所以根据当前最新的current值来计算新的队列
        state.queue = queue;
      }
      queue.push({ redo, undo }); // 保存指令的前进后退
      state.current = current + 1;
      // console.log(queue);
    };
  };
  // 注册命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1]; // 找到当前的下一步 还原操作
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          if (state.current == -1) return; // 没有可以撤销了
          const item = state.queue[state.current]; // 找到上一步还原
          if (item) {
            item.undo && item.undo(); // 这里没有操作队列
            state.current--;
          }
        },
      };
    },
  });
  registry({
    name: "drag",
    before: null,
    pushQueue: true,
    keyboard: "ctrl+x",
    init() {
      this.before = null;
      const start = () => {
        this.before = cloneDeep(data.value.blocks);
      };
      const end = () => {
        if (state.commands) {
          state.commands.drag();
        }
      };
      events.on("start", start);
      events.on("end", end);
      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      const before = this.before;
      const after = data.value.blocks;
      return {
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        undo() {
          data.value = { ...data.value, blocks: before || [] };
        },
      };
    },
  });
  registry({
    name: "updateContainer",
    pushQueue: true,
    keyboard: "",
    execute(newVal) {
      const state = {
        before: data.value,
        after: newVal,
      };
      return {
        redo: () => {
          data.value = state.after;
        },
        undo: () => {
          data.value = state.before;
        },
      };
    },
  });
  registry({
    name: "placeTop",
    pushQueue: true,
    execute() {
      let before = cloneDeep(data.value.blocks);
      let after = (() => {
        const { focus, unfocused } = focusData.value;
        const maxZIndex = unfocused.reduce((pre, block) => {
          return Math.max(pre, block.zIndex);
        }, -Infinity);
        focus.forEach((block) => (block.zIndex = maxZIndex + 1));
        return data.value.blocks;
      })();
      return {
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  registry({
    name: "placeBottom",
    pushQueue: true,
    execute() {
      let before = cloneDeep(data.value.blocks);
      let after = (() => {
        const { focus, unfocused } = focusData.value;
        let minZIndex =
          unfocused.reduce((pre, block) => {
            return Math.min(pre, block.zIndex);
          }, Infinity) - 1;
        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex);
          minZIndex = 0;
          unfocused.forEach((block) => (block.zIndex += dur));
        }
        focus.forEach((block) => (block.zIndex = minZIndex));
        return data.value.blocks;
      })();
      return {
        redo: () => {
          data.value = { ...data.value, blocks: after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });
  registry({
    name: "delete",
    pushQueue: true,
    execute() {
      let state = {
        before: cloneDeep(data.value.blocks),
        after: focusData.value.unfocused,
      };
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after };
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before };
        },
      };
    },
  });
  // 监听键盘事件
  const keyboardEvent = (() => {
    const init = () => {
      const onKeyDown = (e) => {
        const { metaKey, ctrlKey, key } = e;
        let keyString = "";
        if (metaKey || ctrlKey) {
          keyString = `ctrl+${key}`;
        }
        state.commandArray.forEach(({ keyboard, name }) => {
          if (!keyboard) return;
          if (keyboard === keyString) {
            state.commands[name]();
            e.preventDefault();
          }
        });
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("keydown", onkeydown);
      };
    };
    return init;
  })();
  (() => {
    keyboardEvent();
    state.commandArray.forEach((command) => {
      if (command.init) {
        state.destroyArray.push(
          command.init && state.destroyArray.push(command.init())
        );
      }
    });
  })();
  onUnmounted(() => {
    state.destroyArray.forEach((fn) => fn && fn());
  });
  return state;
}
