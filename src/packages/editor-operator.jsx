import {
  ElButton,
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElSelect,
} from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";
import { cloneDeep } from "lodash";
import TableEditor from "./table-editor";

export default defineComponent({
  props: {
    block: { type: Object },
    data: { type: Object },
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },

  // eslint-disable-next-line no-unused-vars
  setup(props, ctx) {
    const config = inject("config");
    const state = reactive({
      editData: {},
    });
    const reset = () => {
      if (!props.block) {
        state.editData = cloneDeep(props.data.container);
      } else {
        state.editData = cloneDeep(props.block);
      }
    };
    const apply = () => {
      if (!props.block) {
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        props.updateBlock(state.editData, props.block);
      }
    };
    watch(() => props.block, reset, { immediate: true });
    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width} />
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height} />
            </ElFormItem>
          </>
        );
      } else {
        let component = config.componentMap[props.block.key];
        if (component && component.props) {
          content.push(
            Object.entries(component.props).map(([propName, propConfig]) => {
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => (
                      <ElInput v-model={state.editData.props[propName]} />
                    ),
                    color: () => (
                      <ElColorPicker v-model={state.editData.props[propName]} />
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((opt) => {
                          return (
                            <ElOption
                              value={opt.value}
                              label={opt.label}
                              key={opt.value}
                            ></ElOption>
                          );
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <TableEditor
                        propConfig={propConfig}
                        v-model={state.editData.props[propName]}
                      />
                    ),
                  }[propConfig.type]()}
                </ElFormItem>
              );
            })
          );
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]} />
                </ElFormItem>
              );
            })
          );
        }
      }

      return (
        <ElForm labelPosition="top" style="padding: 30px">
          {content}
          <ElFormItem>
            <ElButton type="primary" onClick={() => apply()}>
              应用
            </ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
