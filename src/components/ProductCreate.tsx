import { globalTranslate } from "@/utils/globalTranslate";
import { defineComponent, reactive, ref } from "vue";
import { store } from "@/store";
import { ImagesFiles } from "@/constants/FileTypes";
import { UiUploader } from "./ui/UiUploader";
import type { newProductT } from "@/types";
import { invoke } from "@tauri-apps/api";
import { UiButton } from "./ui/UiButton";
import { UiInput } from "./ui/UiInput";
import { saveFile } from "@/utils/fs";
import { useRoute, useRouter } from "vue-router";

export const ProductCreate = defineComponent({
  name: "ProductCreate",
  components: { UiButton, UiInput },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const isFlash = ref<boolean>(false);

    const product = reactive<newProductT>({
      name: "",
      price: 0,
      quantity: 0,
      description: "",
      tva: 0,
      image: "",
    });

    const updateQueryParams = (query: Record<any, any>) => {
      router.push({
        path: route.path,
        params: { ...route.params },
        query: { ...route.query, ...query },
      });
    };
    const createNewProduct = async () => {
      isFlash.value = true;
      if (product.name !== "") {
        try {
          let image: string = await saveFile(product.image as string, "Image");
          await invoke("insert_product", { product: { ...product, image } });
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
      setTimeout(() => {
        isFlash.value = false;
      }, 1000);
    };
    return () => (
      <div class="w-1/2 h-fit rounded-[4px] z-50 gap-3 flex flex-col bg-white p-2 min-w-[350px]">
        <h1 class="font-semibold text-lg text-gray-800 border-b-2 border-b-gray-500 pb-2 uppercase text-center">
          {globalTranslate("Products.create.title")}
        </h1>
        <div class="h-full w-full flex flex-col gap-2">
          <div class="w-full h-fit flex justify-center">
            <UiUploader
              name="Image"
              extensions={ImagesFiles}
              onSave={(image) => (product.image = image)}
            />
          </div>
          <UiInput
            IsEmpty={isFlash.value && product["name"] == ""}
            OnInputChange={(value) =>
              (product["name"] =
                typeof value == "string" ? value : JSON.stringify(value))
            }
            Type="text"
            PlaceHolder={globalTranslate("Products.create.placeholders[0]")}
          />
          <UiInput
            IsEmpty={isFlash.value && product["price"] == 0}
            OnInputChange={(value) => (product["price"] = Number(value))}
            Type="Number"
            PlaceHolder={globalTranslate("Products.create.placeholders[2]")}
          />
          <UiInput
            IsEmpty={isFlash.value && product["tva"] == 0}
            OnInputChange={(value) => (product["tva"] = Number(value))}
            Type="Number"
            PlaceHolder={globalTranslate("Products.create.placeholders[3]")}
          />
          <UiInput
            IsEmpty={isFlash.value && product["quantity"] == 0}
            OnInputChange={(value) => (product["quantity"] = Number(value))}
            Type="Number"
            PlaceHolder={globalTranslate("Products.create.placeholders[4]")}
          />
          <UiInput
            IsEmpty={isFlash.value && product["description"] == ""}
            OnInputChange={(value) =>
              (product["description"] =
                typeof value == "string" ? value : JSON.stringify(value))
            }
            Type="textarea"
            PlaceHolder={globalTranslate("Products.create.placeholders[5]")}
          />
        </div>
        <div class="flex">
          <UiButton colorTheme="a" Click={() => createNewProduct()}>
            {globalTranslate("Products.create.button")}
          </UiButton>
        </div>
      </div>
    );
  },
});
