import {
  computed,
  createVNode,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
  render,
} from "vue";

export const DropdownItem = defineComponent({
  props: { label: String, icon: Object },
  setup(props) {
    let hide = inject("hide");
    return () => (
      <div class="dropdown-item" onClick={hide}>
        <span style="font-size: 14px;height: 30px">{props.icon}</span>
        <span>{props.label}</span>
      </div>
    );
  },
});

const DropdownComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
    });
    ctx.expose({
      showDropdown(option) {
        state.option = option;
        state.isShow = true;
        let { top, left, height } = option.el.getBoundingClientRect();
        state.top = top + height;
        state.left = left;
      },
    });
    provide("hide", () => (state.isShow = false));
    const classes = computed(() => [
      "dropdown",
      {
        "dropdown-isShow": state.isShow,
      },
    ]);
    const styles = computed(() => ({
      top: `${state.top}px`,
      left: `${state.left}px`,
    }));
    const el = ref(null);
    const onMousedownDocument = (e) => {
      if (!el.value.contains(e.target)) {
        state.isShow = false;
      }
    };
    onMounted(() => {
      document.body.addEventListener("mousedown", onMousedownDocument, true);
    });
    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown", onMousedownDocument);
    });
    return () => {
      return (
        <div class={classes.value} style={styles.value} ref={el}>
          {state.option.content()}
        </div>
      );
    };
  },
});

let vm;
export function $dropdown(option) {
  if (!vm) {
    let el = document.createElement("div");
    vm = createVNode(DropdownComponent, { option });

    document.body.appendChild((render(vm, el), el));
  }

  let { showDropdown } = vm.component.exposed;
  showDropdown(option);
}
