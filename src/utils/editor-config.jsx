// 列表区
// 映射关系
import { ElButton, ElInput } from "element-plus";
function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();
const createInputProp = (label) => ({ type: "input", label });
const createColorProp = (label) => ({ type: "color", label });
const createSelectProp = (label, options) => ({
  type: "select",
  label,
  options,
});
registerConfig.register({
  label: "文本",
  preview: () => "预览文本",
  render: ({ props }) => (
    <span style={{ color: props.color, fontSize: props.size }}>
      {props.text || "渲染文本"}
    </span>
  ),
  key: "text",
  props: {
    text: createInputProp("文本内容"),
    color: createColorProp("字体颜色"),
    size: createSelectProp("字体大小", [
      {
        label: "14px",
        value: "14px",
      },
      {
        label: "20px",
        value: "20px",
      },
      {
        label: "24px",
        value: "24px",
      },
    ]),
  },
});

registerConfig.register({
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: ({ props }) => (
    <ElButton type={props.type || ""} size={props.size || "default"}>
      {props.text || "基础按钮"}
    </ElButton>
  ),
  key: "button",
  props: {
    text: createInputProp("按钮内容"),
    type: createSelectProp("按钮类型", [
      {
        label: "基础",
        value: "primary",
      },
      {
        label: "成功",
        value: "success",
      },
      {
        label: "警告",
        value: "warning",
      },
      {
        label: "危险",
        value: "danger",
      },
      {
        label: "文本",
        value: "text",
      },
    ]),
    size: createSelectProp("按钮尺寸", [
      { label: "默认", value: "default" },
      { label: "大", value: "large" },
      { label: "小", value: "small" },
    ]),
  },
});

registerConfig.register({
  label: "输入框",
  preview: () => <ElInput placeholder="预览输入框" />,
  render: () => <ElInput placeholder="渲染输入框" />,
  key: "input",
});
