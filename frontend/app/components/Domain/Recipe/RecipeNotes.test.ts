import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import { nextTick } from "vue";
import RecipeNotes from "./RecipeNotes.vue";
import type { RecipeNote } from "~/lib/api/types/recipe";

const notes: RecipeNote[] = [
  { title: "Step 1 note", text: "Prepare first" },
  { title: "Step 3 note", text: "Finish later" },
];

const VueDraggableStub = {
  name: "VueDraggable",
  props: ["modelValue", "disabled", "handle"],
  emits: ["update:modelValue"],
  template: `<div class="draggable-stub"><slot /></div>`,
};

function mountNotes(edit = true) {
  return mount(RecipeNotes, {
    props: {
      modelValue: [...notes],
      edit,
    },
    global: {
      mocks: {
        $globals: {
          icons: {
            arrowUpDown: "drag",
            delete: "delete",
          },
        },
      },
      stubs: {
        VueDraggable: VueDraggableStub,
        VCard: { template: "<div><slot /></div>" },
        VCardText: { template: "<div><slot /></div>" },
        VCardTitle: { template: "<div><slot /></div>" },
        VTextField: true,
        VTextarea: true,
        VBtn: { template: "<button><slot /></button>" },
        VIcon: { template: "<span><slot /></span>" },
        SafeMarkdown: true,
        BaseButton: { template: "<button><slot /></button>" },
      },
    },
  });
}

describe("RecipeNotes", () => {
  test("reorders notes through the edit-mode drag handle", async () => {
    const wrapper = mountNotes();
    const draggable = wrapper.findComponent({ name: "VueDraggable" });

    expect(draggable.props("disabled")).toBe(false);
    expect(draggable.props("handle")).toBe(".note-drag-handle");
    expect(wrapper.findAll(".note-drag-handle")).toHaveLength(2);

    const reordered = [notes[1], notes[0]];
    draggable.vm.$emit("update:modelValue", reordered);
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual(reordered);
  });

  test("disables drag controls outside edit mode", () => {
    const wrapper = mountNotes(false);
    const draggable = wrapper.findComponent({ name: "VueDraggable" });

    expect(draggable.props("disabled")).toBe(true);
    expect(wrapper.findAll(".note-drag-handle")).toHaveLength(0);
  });
});
