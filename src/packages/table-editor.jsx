import { computed, defineComponent } from "vue";
import { cloneDeep } from "lodash";
import { ElButton, ElTag } from "element-plus";
import { $tableDialog } from "@/components/TableDialog";

export default defineComponent({
  props: {
    propConfig: { tyoe: Object },
    modelValue: { type: Array },
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
    const onShowTableDialog = () => {
      $tableDialog({
        title: "添加数据源",
        config: props.propConfig,
        data: data.value,
        onConfirm(value) {
          data.value = value;
        },
      });
    };
    return () => {
      return (
        <div>
          {(!data.value || data.value.length === 0) && (
            <ElButton onClick={onShowTableDialog}>添加</ElButton>
          )}

          {(data.value || []).map((tag) => (
            <ElTag onClick={onShowTableDialog}>
              {tag[props.propConfig.table.key]}
            </ElTag>
          ))}
        </div>
      );
    };
  },
});
