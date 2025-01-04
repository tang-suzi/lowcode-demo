import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import { cloneDeep } from "lodash";
import { useMenuDragger } from "./useMenuDragger";
import { useBlockFoucs } from "./useBlockFoucs";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { ElButton } from "element-plus";
import {
  RefreshLeft,
  RefreshRight,
  Download,
  Upload,
  Top,
  Bottom,
  Delete,
  Close,
  // eslint-disable-next-line no-unused-vars
  Edit,
  // eslint-disable-next-line no-unused-vars
  View,
} from "@element-plus/icons-vue";

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

    const { commands } = useCommand(data);

    const buttons = [
      {
        label: "撤销",
        icon: RefreshLeft,
        handler: () => {
          commands.undo();
        },
      },
      {
        label: "重做",
        icon: RefreshRight,
        handler: () => {
          commands.redo();
        },
      },
      {
        label: "导出",
        icon: Download,
        handler: () => {
          console.log("导出");
          //   importDialog({
          //     title: "导出JSON使用",
          //     context: JSON.stringify(data.value),
          //   });
        },
      },
      {
        label: "导入",
        icon: Upload,
        handler: () => {
          console.log("导入");
          //   importDialog({
          //     title: "导入JSON",
          //     context: "",
          //     footer: true,
          //     confirm(text) {
          //       console.log(text);
          //       // data.value = JSON.parse(text); // 这样去更改无法保留历史记录
          //       state.commands.updateContainer(JSON.parse(text));
          //     },
          //   });
        },
      },
      {
        label: "置顶",
        icon: Top,
        // handler: () => {
        //   state.commands.placeTop();
        // },
      },
      {
        label: "置底",
        icon: Bottom,
        // handler: () => {
        //   state.commands.placeBottom();
        // },
      },
      {
        label: "删除",
        icon: Delete,
        // handler: () => {
        //   state.commands.delete();
        // },
      },
      //   {
      //     label: () => (previewRef.value ? "编辑" : "预览"),
      //     icon: () => (previewRef.value ? Edit : View),
      //     // handler: () => {
      //     //   previewRef.value = !previewRef.value;
      //     //   clearBlockFocus();
      //     // },
      //   },
      {
        label: "关闭",
        icon: Close,
        // handler: () => {
        //   editorRef.value = false;
        //   clearBlockFocus();
        // },
      },
    ];

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
        <div class="editor-top">
          {buttons.map((btn, index) => {
            return (
              <ElButton
                class="editor-top-button"
                key={{ index }}
                onClick={btn.handler}
                icon={btn.icon}
              >
                {btn.label}
              </ElButton>
            );
          })}
        </div>
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
