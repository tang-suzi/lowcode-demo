import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false,
  };

  const markLine = reactive({
    x: null,
    y: null,
  });
  const mouseDown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value;
    dragState = {
      startX: e.clientX,
      startY: e.clientY,

      startLeft: lastSelectBlock.value.left, // b point drag start
      startTop: lastSelectBlock.value.top, // b point drag start
      dragging: false,
      startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
      lines: (() => {
        const { unfocused } = focusData.value;
        const lines = { x: [], y: [] };
        [
          ...unfocused,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ].forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;

          lines.y.push({ showTop: ATop, top: ATop }); // top&top
          lines.y.push({ showTop: ATop, top: ATop - (BHeight || 0) }); // top&bottom
          lines.y.push({
            showTop: ATop + (AHeight || 0) / 2,
            top: ATop + (AHeight || 0) / 2 - (BHeight || 0) / 2,
          }); // middle & middle
          lines.y.push({
            showTop: ATop + (AHeight || 0),
            top: ATop + (AHeight || 0),
          }); // bottom & top
          lines.y.push({
            showTop: ATop + (AHeight || 0),
            top: ATop + (AHeight || 0) - (BHeight || 0),
          }); // bottom & bottom

          lines.x.push({ showLeft: ALeft, left: ALeft }); // left & left
          lines.x.push({
            showLeft: ALeft + (AWidth || 0),
            left: ALeft + (AWidth || 0),
          }); // left & right
          lines.x.push({
            showLeft: ALeft + (AWidth || 0) / 2,
            left: ALeft + (AWidth || 0) / 2 - (BWidth || 0) / 2,
          }); // middle & middle
          lines.x.push({ showLeft: ALeft, left: ALeft - (BWidth || 0) }); // right & left
          lines.x.push({
            showLeft: ALeft + (AWidth || 0),
            left: ALeft + (AWidth || 0) - (BWidth || 0),
          }); // right & right
        });
        return lines;
      })(),
    };
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  };
  const mouseMove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit("start");
    }
    // 计算当前元素最新的left和top，去线中找，找到显示
    // 鼠标移动后 - 鼠标移动前 + left
    const left = moveX - dragState.startX + (dragState.startLeft || 0);
    const top = moveY - dragState.startY + (dragState.startTop || 0);
    let y = null;
    let x = null;

    if (dragState.lines) {
      for (let i = 0; i < dragState.lines.y.length; i++) {
        const { top: t, showTop: showT } = dragState.lines.y[i];
        if (Math.abs(t - top) < 5) {
          y = showT;
          moveY = dragState.startY - (dragState.startTop || 0) + t; // 让元素快速贴合
          break; // 找到一根线后就跳出循环
        }
      }

      for (let i = 0; i < dragState.lines.x.length; i++) {
        const { left: l, showLeft: showL } = dragState.lines.x[i];
        if (Math.abs(l - left) < 5) {
          x = showL;
          moveX = dragState.startX - (dragState.startLeft || 0) + l; // 让元素快速贴合
          break; // 找到一根线后就跳出循环
        }
      }
    }

    markLine.x = x;
    markLine.y = y;

    let durX = moveX - dragState.startX;
    let durY = moveY - dragState.startY;

    focusData.value.focus.forEach((block, index) => {
      block.top = dragState.startPos[index].top + durY;
      block.left = dragState.startPos[index].left + durX;
    });
  };
  const mouseUp = () => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mous(eup || 0)", mouseUp);
    markLine.x = null;
    markLine.y = null;
    if (dragState.dragging) {
      dragState.dragging = false;
      events.emit("end");
    }
  };
  return {
    mouseDown,
    markLine,
  };
}
