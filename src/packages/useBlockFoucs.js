import { computed, ref } from "vue";
export function useBlockFoucs(data, callback) {
  const selectIndex = ref(-1);

  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block) => (block.focus = false));
  };
  const blockMouseDown = (e, block, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey) {
      if (focusData.value.focus.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
    } else {
      if (!block.focus) {
        clearBlockFocus();
        block.focus = true;
      } else {
        // block.focus = false;
      }
    }
    selectIndex.value = index;
    callback(e);
  };
  const focusData = computed(() => {
    let focus = [];
    let unfocused = [];
    data.value.blocks.forEach((block) =>
      (block.focus ? focus : unfocused).push(block)
    );
    return { focus, unfocused };
  });

  // 清除元素焦点
  const containerMousedown = () => {
    selectIndex.value = -1;
    clearBlockFocus();
  };
  return {
    focusData,
    blockMouseDown,
    containerMousedown,
    lastSelectBlock,
  };
}
