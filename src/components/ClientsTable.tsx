import { defineComponent, type PropType, ref } from "vue";
import { globalTranslate } from "@/utils/globalTranslate";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { useModalStore } from "@/stores/modalStore";
import { UiPagination } from "./ui/UiPagination";
import { UiCheckBox } from "./ui/UiCheckBox";
import { RouterLink } from "vue-router";
import type { clientT } from "@/types";
import UiIcon from "./ui/UiIcon.vue";

export const ClientsTable = defineComponent({
  name: "ClientsTable",
  props: {
    Clients: {
      type: Array as PropType<clientT[]>,
      required: true,
    },
    FilterParam: {
      type: String,
      required: true,
      default: "",
    },
  },
  components: { UiCheckBox, UiIcon, UiPagination },
  setup(props) {
    const modalStore = useModalStore();
    const checkedClients = ref<number[]>([]);
    const pagination = ref<number>(0);

    const checkThisUser = (IsInclude: boolean, id: number) => {
      IsInclude
        ? checkedClients.value.push(id)
        : checkedClients.value.splice(checkedClients.value.indexOf(id), 1);
    };

    const toggleThisClient = (client: clientT, name: string) => {
      modalStore.updateClientRow(client);
      modalStore.updateModal({ key: "name", value: name });
      modalStore.updateModal({ key: "show", value: true });
    };

    return () => (
      <div class="flex flex-col h-full w-full">
        <table class="w-full">
          <thead class="text-xs h-9 bg-gray-300 max-w-lg w-fit font-semibold uppercase text-[rgba(25,23,17,0.6)] ">
            <tr>
              <th class="rounded-l-md"></th>
              <th class="p-2"></th>
              {[0, 1, 2, 3, 4].map((index) => (
                <th class="p-2 w-fit last:rounded-r-md ">
                  <div class="font-semibold text-left">
                    {globalTranslate(`Clients.index.feilds[${index}]`)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody class="text-sm divide-y divide-gray-100">
            {props.Clients.filter((c) =>
              // @ts-ignore
              JSON.stringify(Object.values(c))
                .toLocaleLowerCase()
                .includes(props.FilterParam)
            )
              .slice(pagination.value * 17, pagination.value * 17 + 17)
              .map((client, index) => (
                <tr v-fade={index} key={client.id}>
                  <td class="p-2">
                    <span class="h-full w-full grid">
                      <UiCheckBox
                        onCheck={(check) => checkThisUser(check, client.id)}
                      />
                    </span>
                  </td>
                  <td class="p-2">
                    <div class="w-12 h-12 rounded-full overflow-hidden">
                      {client.image && client.image !== "" ? (
                        <img
                          class="rounded-full w-full h-full object-cover"
                          src={convertFileSrc(client.image)}
                        />
                      ) : (
                        <span class=" rounded-full w-full h-full object-fill animate-pulse bg-slate-300 duration-150" />
                      )}
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="font-medium text-gray-800">{client.name}</div>
                  </td>
                  <td class="p-2">
                    <div class="text-left whitespace-nowrap overflow-ellipsis">
                      {client.email ?? (
                        <span class="text-red-400">No email</span>
                      )}
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="text-left whitespace-nowrap overflow-ellipsis">
                      {client.phone ?? (
                        <span class="text-red-400">No phone</span>
                      )}
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="text-left whitespace-nowrap overflow-ellipsis">
                      {client.address ?? (
                        <span class="text-red-400">No address</span>
                      )}
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="flex  justify-start gap-3">
                      <span
                        onClick={() => toggleThisClient(client, "ClientDelete")}
                      >
                        <UiIcon name={"delete"} />
                      </span>
                      <span
                        onClick={() => toggleThisClient(client, "ClientUpdate")}
                      >
                        <UiIcon name={"edit"} />
                      </span>
                      <RouterLink
                        to={{
                          name: "ClientDetails",
                          params: { id: client.id },
                        }}
                      >
                        <UiIcon name={"more"} />
                      </RouterLink>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div>
          <UiPagination
            goBack={() => pagination.value--}
            goForward={() => pagination.value++}
            itemsNumber={props.Clients.length}
            page={pagination.value}
          />
        </div>
      </div>
    );
  },
});