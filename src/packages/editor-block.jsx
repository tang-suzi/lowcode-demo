import { computed, defineComponent, inject, onMounted, ref } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object },
  },
  setup(props) {
    props;
    const blockStyles = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex,
    }));
    const config = inject("config");
    const blockRef = ref(null);
    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        // todo: 重新派发事件
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = props.block.left - offsetWidth / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = props.block.top - offsetHeight / 2;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.alignCenter = false;
      }
      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = offsetWidth;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = offsetHeight;
    });

    return () => {
      const component = config.componentMap[props.block.key];
      const RenderComponent = component.render({
        props: props.block.props,
        // model: props.block.model => {default: 'username'} => {modelValue: FormData.username, "onUpdate:modelValue": v => FormData.username = v}
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          let propName = props.block.model[modelName];
          prev[modelName] = {
            modelValue: props.formData[propName],
            // eslint-disable-next-line vue/no-mutating-props
            "onUpdate:modelValue": (v) => (props.formData[propName] = v),
          };
          return prev;
        }, {}),
      });
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          {RenderComponent}
        </div>
      );
    };
  },
});
