import { defineComponent } from "vue";

export default defineComponent({
  props: {
    block: { type: Object },
    component: { type: Object },
  },
  setup(props) {
    let data = {};
    const onMousemove = (e) => {
      let { clientX, clientY } = e;
      let {
        startX,
        startY,
        startWidth,
        startHeight,
        startLeft,
        startTop,
        direction,
      } = data;

      if (direction.horizontal === "center") {
        clientX = startX;
      }
      if (direction.vertical === "center") {
        clientY = startY;
      }

      let durX = clientX - startX;
      let durY = clientY - startY;

      if (direction.horizontal === "start") {
        durX = -durX;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.left = startLeft - durX;
      }
      if (direction.vertical === "start") {
        durY = -durY;
        // eslint-disable-next-line vue/no-mutating-props
        props.block.top = startTop - durY;
      }

      const width = startWidth + durX;
      const height = startHeight + durY;

      // eslint-disable-next-line vue/no-mutating-props
      props.block.width = width;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.height = height;
      // eslint-disable-next-line vue/no-mutating-props
      props.block.canResize = true;
    };
    const onMouseup = () => {
      document.body.removeEventListener("mousemove", onMousemove);
      document.body.removeEventListener("mouseup", onMouseup);
    };
    const onMousedown = (e, direction) => {
      e.stopPropagation();
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: props.block.width,
        startHeight: props.block.height,
        startTop: props.block.top,
        startLeft: props.block.left,
        direction,
      };
      document.body.addEventListener("mousemove", onMousemove);
      document.body.addEventListener("mouseup", onMouseup);
    };
    const { width, height } = props.component.resize || {};
    return () => (
      <>
        {width && (
          <>
            <div
              class="block-resize block-resize-left"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "start", vertical: "center" })
              }
            ></div>
            <div
              class="block-resize block-resize-right"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "end", vertical: "center" })
              }
            ></div>
          </>
        )}
        {height && (
          <>
            <div
              class="block-resize block-resize-top"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "center", vertical: "start" })
              }
            ></div>
            <div
              class="block-resize block-resize-bottom"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "center", vertical: "end" })
              }
            ></div>
          </>
        )}
        {width && height && (
          <>
            <div
              class="block-resize block-resize-top-left"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "start", vertical: "start" })
              }
            ></div>
            <div
              class="block-resize block-resize-top-right"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "end", vertical: "start" })
              }
            ></div>
            <div
              class="block-resize block-resize-bottom-left"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "start", vertical: "end" })
              }
            ></div>
            <div
              class="block-resize block-resize-bottom-right"
              onMousedown={(e) =>
                onMousedown(e, { horizontal: "end", vertical: "end" })
              }
            ></div>
          </>
        )}
      </>
    );
  },
});
