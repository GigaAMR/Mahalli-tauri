import { useUpdateRouteQueryParams } from "@/composables/useUpdateQuery";
import { defineComponent, onBeforeMount, reactive, ref } from "vue";
import { globalTranslate } from "@/utils/globalTranslate";
import { Button } from "./ui/button";
import { UiSelect } from "./ui/UiSelect";
import { invoke } from "@tauri-apps/api";
import { Input } from "./ui/input";
import { store } from "@/store";
import { INVENTORY_CREATE } from "@/constants/defaultValues";

export const InventoryCreate = defineComponent({
  name: "InventoryCreate",
  components: { Button, Input, UiSelect },
  setup() {
    const { updateQueryParams } = useUpdateRouteQueryParams();

    const inventoryMvm = reactive(INVENTORY_CREATE);

    const products = ref<{ name: string; id: number }[]>([]);

    onBeforeMount(async () => {
      const res = await Promise.allSettled([
        invoke<{ name: string; id: number }[]>("get_all_products"),
      ]);
      // @ts-ignore
      if ((res[0].status = "fulfilled")) products.value = res[0].value;
    });

    const createNewInventory = async () => {
      if (inventoryMvm.productId !== 0 && inventoryMvm.quantity !== 0) {
        try {
          await invoke("insert_inventory_mvm", { inventory: inventoryMvm });
          // toggle refresh
          updateQueryParams({
            refresh: "refresh-create-" + Math.random() * 9999,
          });
        } catch (error) {
          console.log(error);
        } finally {
          store.setters.updateStore({ key: "show", value: false });
        }
      }
    };
    return () => (
      <div class="w-1/2 h-fit z-50 gap-3 flex flex-col bg-white p-2 min-w-[350px]">
        <h1 class="font-semibold text-lg text-gray-800 border-b-2 border-b-gray-500 pb-2 uppercase text-center">
          {globalTranslate("Inventory.create.title")}
        </h1>
        <div class="h-full w-full flex flex-col gap-2">
          <UiSelect
            items={products.value}
            onSelect={(id: number) => (inventoryMvm.productId = id)}
          >
            {globalTranslate("Inventory.create.select")}
          </UiSelect>
          <Input
            type="number"
            placeHolder={globalTranslate("Inventory.create.placeholder")}
            IsEmpty={false}
            OnInputChange={(input) => (inventoryMvm.quantity = Number(input))}
          />
        </div>
        <div class="flex">
          <Button colorTheme="a" onClick={() => createNewInventory()}>
            {globalTranslate("Inventory.create.button")}
          </Button>
        </div>
      </div>
    );
  },
});