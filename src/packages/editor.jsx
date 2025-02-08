import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-block";
import { cloneDeep } from "lodash";
import { useMenuDragger } from "./useMenuDragger";
import { useBlockFoucs } from "./useBlockFoucs";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
// eslint-disable-next-line no-unused-vars
import { ElButton, ElInput, ElMessage, ElMessageBox } from "element-plus";
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
// eslint-disable-next-line no-unused-vars
import { importDialog } from "@/components/Dialog";
import EditorOperator from "./editor-operator";
import { $dropdown, DropdownItem } from "@/components/Dropdown";

export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    const previewRef = ref(false);
    const editorRef = ref(true);
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
    const {
      blockMouseDown,
      containerMousedown,
      focusData,
      lastSelectBlock,
      clearBlockFocus,
    } = useBlockFoucs(data, previewRef, (e) => {
      mouseDown(e);
    });

    // 实现元素拖拽
    const { mouseDown, markLine } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );

    const { commands } = useCommand(data, focusData);
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
          //   importDialog({
          //     title: "导出JSON使用",
          //     context: JSON.stringify(data.value),
          //   });
          ElMessageBox.prompt("导出JSON使用", {
            showConfirmButton: false,
            inputValue: JSON.stringify(data.value),
            // configButtonText: "确认",
            inputType: "textarea",
            cancelButtonText: "关闭",
            // inputPattern: "",
            // inputErrorMessage: "",
          })
            .then(() => {})
            .catch(() => {});
        },
      },
      {
        label: "导入",
        icon: Upload,
        handler: () => {
          importDialog({
            title: "导入JSON",
            context: "",
            footer: true,
            confirm(text) {
              text;
              // console.log(text);
              // data.value = JSON.parse(text); // 这样去更改无法保留历史记录
              commands.updateContainer(JSON.parse(text));
              // console.log(commands);
            },
          });
        },
      },
      {
        label: "置顶",
        icon: Top,
        handler: () => {
          commands.placeTop();
        },
      },
      {
        label: "置底",
        icon: Bottom,
        handler: () => {
          commands.placeBottom();
        },
      },
      {
        label: "删除",
        icon: Delete,
        handler: () => {
          commands.delete();
        },
      },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () => (previewRef.value ? Edit : View),
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
      {
        label: "关闭",
        icon: Close,
        handler: () => {
          editorRef.value = false;
          clearBlockFocus();
        },
      },
    ];

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();
      block;
      $dropdown({
        el: e.target,
        content: () => (
          <>
            <DropdownItem
              label="删除"
              icon={<Delete />}
              onClick={() => {
                commands.delete();
              }}
            ></DropdownItem>
            <DropdownItem
              label="置顶"
              icon={<Top />}
              onClick={() => {
                commands.placeTop();
              }}
            ></DropdownItem>
            <DropdownItem
              label="置底"
              icon={<Bottom />}
              onClick={() => {
                commands.placeBottom();
              }}
            ></DropdownItem>
            <DropdownItem
              label="查看"
              icon={<View />}
              onClick={() => {
                importDialog({
                  title: "查看节点数据",
                  context: JSON.stringify(block),
                });
              }}
            ></DropdownItem>
            <DropdownItem
              label="导入"
              icon={<Download />}
              onClick={() => {
                importDialog({
                  title: "查看节点数据",
                  context: "",
                  footer: true,
                  confirm(text) {
                    text = JSON.parse(text);
                    commands.updateBlock(text, block);
                  },
                });
              }}
            ></DropdownItem>
          </>
        ),
      });
    };

    return () =>
      !editorRef.value ? (
        <>
          <ElButton type="primary" onClick={() => (editorRef.value = true)}>
            继续编辑
          </ElButton>
          <div
            class="editor-container-canvas__content"
            style={containerStyles.value}
          >
            {data.value.blocks.map((block) => (
              <EditorBlock class="editor-block-preview" block={block} />
            ))}
          </div>
        </>
      ) : (
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
              const icon =
                typeof btn.icon === "function" ? btn.icon() : btn.icon;
              const label =
                typeof btn.label === "function" ? btn.label() : btn.label;
              return (
                <ElButton
                  class="editor-top-button"
                  key={{ index }}
                  onClick={btn.handler}
                  icon={icon}
                >
                  {label}
                </ElButton>
              );
            })}
          </div>
          <div class="editor-right">
            <EditorOperator
              block={lastSelectBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            ></EditorOperator>
          </div>
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
                    class={[
                      block.focus ? "editor-block-focus" : "",
                      previewRef.value ? "editor-block-preview" : "",
                    ]}
                    onMousedown={(e) => blockMouseDown(e, block, index)}
                    onContextmenu={(e) => onContextMenuBlock(e, block)}
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
