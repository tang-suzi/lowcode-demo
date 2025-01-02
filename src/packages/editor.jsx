import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import { cloneDeep } from "lodash";
import { useMenuDragger } from "./useMenuDragger";
import { useBlockFoucs } from "./useBlockFoucs";
import { useBlockDragger } from "./useBlockDragger";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        ctx.emit("update:modelValue", cloneDeep(newValue));
      },
    });
    const containerStyles = computed(() => ({
      width: `${data.value.container.width}px`,
      height: `${data.value.container.height}px`,
    }));
    const config = inject("config");
    const containerRef = ref(null);
    // 实现菜单的拖拽功能
    const { dragStart, dragend } = useMenuDragger(containerRef, data);
    // 获取元素焦点
    const { blockMouseDown, containerMousedown, focusData, lastSelectBlock } =
      useBlockFoucs(data, (e) => {
        mouseDown(e);
      });

    // 实现元素拖拽
    const { mouseDown, markLine } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );

    return () => (
      <div class="editor">
        <div class="editor-left">
          {/* 根据注册列表渲染组件 */}
          {config.componentList.map((component) => (
            <div
              class="editor-left-item"
              draggable
              onDragstart={(e) => {
                dragStart(e, component);
              }}
              onDragend={dragend}
            >
              <span>{component.label}</span>
              <div>{component.preview()}</div>
            </div>
          ))}
        </div>
        <div class="editor-top">菜单</div>
        <div class="editor-right">属性</div>
        <div class="editor-container">
          <div class="editor-container-canvas">
            <div
              class="editor-container-canvas__content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMousedown}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  block={block}
                  class={block.focus ? "editor-block-focus" : ""}
                  onMousedown={(e) => blockMouseDown(e, block, index)}
                />
              ))}
              {markLine.x !== null && (
                <div class="line-x" style={{ left: markLine.x + "px" }}></div>
              )}
              {markLine.y !== null && (
                <div class="line-y" style={{ top: markLine.y + "px" }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
