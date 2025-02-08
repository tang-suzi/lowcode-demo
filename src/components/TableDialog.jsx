import {
  ElButton,
  ElDialog,
  ElInput,
  ElTable,
  ElTableColumn,
} from "element-plus";
import { createVNode, defineComponent, render, reactive } from "vue";
import { cloneDeep } from "lodash";

const TableDialogComponent = defineComponent({
  props: {
    options: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      options: props.options,
      visible: false,
      editData: [],
    });
    const setVisible = (options) => {
      if (options) {
        state.options = options;
        state.editData = cloneDeep(options.data) || [];
      }
      state.visible = !state.visible;
    };
    const onConfirm = () => {
      state.options.onConfirm(state.editData);
      state.visible = false;
    };
    const add = () => {
      state.editData.push({});
    };
    ctx.expose({
      setVisible,
    });
    return () => {
      return (
        <ElDialog v-model={state.visible} title={state.options.title}>
          {{
            default: () => (
              <>
                <div>
                  <ElButton onClick={add}>添加</ElButton>
                  <ElButton>重置</ElButton>
                </div>
                <ElTable data={state.editData}>
                  {state.options.config.table.options.map((opt) => (
                    <ElTableColumn label={opt.label}>
                      {{
                        default: ({ row }) => (
                          <ElInput v-model={row[opt.field]} />
                        ),
                      }}
                    </ElTableColumn>
                  ))}
                </ElTable>
              </>
            ),
            footer: () => (
              <>
                <ElButton onClick={() => setVisible(null)}>取消</ElButton>
                <ElButton type="primary" onClick={onConfirm}>
                  确定
                </ElButton>
              </>
            ),
          }}
        </ElDialog>
      );
    };
  },
});

let vm;
export const $tableDialog = (options) => {
  if (!vm) {
    const el = document.createElement("div");
    vm = createVNode(TableDialogComponent, { options });
    render(vm, el);
    document.body.appendChild(el);
  }
  let { setVisible } = vm.component.exposed;
  setVisible(options);
};
