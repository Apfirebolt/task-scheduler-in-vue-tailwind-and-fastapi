import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Loader from "../components/Loader.vue";

describe("Loader", () => {
  it("renders loading text", () => {
    const wrapper = mount(Loader);
    expect(wrapper.text()).toContain("Loading ...");
  });

  it("has correct CSS classes for centering", () => {
    const wrapper = mount(Loader);
    const div = wrapper.find("div");
    expect(div.classes()).toEqual(
      expect.arrayContaining([
        "absolute",
        "top-1/2",
        "left-1/2",
        "transform",
        "-translate-x-1/2",
        "-translate-y-1/2",
      ])
    );
  });

  it("has correct text styling classes", () => {
    const wrapper = mount(Loader);
    const p = wrapper.find("p");
    expect(p.classes()).toEqual(
      expect.arrayContaining(["text-4xl", "text-bold"])
    );
  });

  it("renders as a single root element", () => {
    const wrapper = mount(Loader);
    expect(wrapper.element.tagName).toBe("DIV");
  });
});
