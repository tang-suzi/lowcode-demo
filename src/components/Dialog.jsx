import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";

const DialogComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      showDialog(option) {
        state.option = option;
        state.isShow = true;
      },
    });
    const cancelClick = () => {
      state.isShow = false;
    };
    const confirmClick = () => {
      state.isShow = false;
      state.option.confirm && state.option.confirm(state.option.context);
    };
    console.log(state.option);
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type="textarea"
                v-model={state.option.context}
                row={10}
              />
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton onClick={cancelClick}>取消</ElButton>
                  <ElButton type="primary" onClick={confirmClick}>
                    确认
                  </ElButton>
                </div>
              ),
          }}
        </ElDialog>
      );
    };
  },
});
let vm;
export function importDialog(option) {
  if (!vm) {
    let el = document.createElement("div");
    // 创建组件的虚拟节点
    vm = createVNode(DialogComponent, { option }); // 将组件渲染成虚拟节点
    document.body.appendChild((render(vm, el), el));
  }
  const { showDialog } = vm.component.exposed;
  showDialog(option);
}
