import { defineComponent } from "vue";

export const ClientAdditional = defineComponent({
  name: "ClientAdditional",
  setup() {
    return () => (
      <div class="w-full rounded-md h-full xl:sticky xl:top-[268px] z-20 bg-gray-200"></div>
    );
  },
});