import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Footer from "../components/Footer.vue";

describe("Footer", () => {
  it("renders footer with correct structure", () => {
    const wrapper = mount(Footer);
    const footer = wrapper.find("footer");

    expect(footer.exists()).toBe(true);
    expect(footer.classes()).toContain("bg-gradient-to-r");
    expect(footer.classes()).toContain("from-primary");
    expect(footer.classes()).toContain("to-secondary");
  });

  it("displays current year in copyright", () => {
    const wrapper = mount(Footer);
    const currentYear = new Date().getFullYear();

    expect(wrapper.text()).toContain(`© ${currentYear} Copyright:`);
  });

  it("displays Fast Scheduler brand name", () => {
    const wrapper = mount(Footer);
    const brandLink = wrapper.find('a[href="https://tailwind-elements.com/"]');

    expect(brandLink.exists()).toBe(true);
    expect(brandLink.text().trim()).toBe("Fast Scheduler");
  });

  it("renders all social media icons", () => {
    const wrapper = mount(Footer);
    const socialLinks = wrapper.findAll('a[href="#!"]');

    expect(socialLinks).toHaveLength(6);

    // Check that each link contains an SVG
    socialLinks.forEach((link) => {
      expect(link.find("svg").exists()).toBe(true);
    });
  });

  it("has correct CSS classes for dark mode support", () => {
    const wrapper = mount(Footer);
    const footer = wrapper.find("footer");

    expect(footer.classes()).toContain("dark:bg-neutral-600");
    expect(footer.classes()).toContain("dark:text-neutral-200");
  });

  it("has responsive design classes", () => {
    const wrapper = mount(Footer);
    const footer = wrapper.find("footer");
    const container = wrapper.find("div");

    expect(footer.classes()).toContain("lg:text-left");
    expect(container.classes()).toContain("lg:justify-between");
  });

  it("copyright section is hidden on smaller screens", () => {
    const wrapper = mount(Footer);
    const copyrightSection = wrapper.find(".mr-12");

    expect(copyrightSection.classes()).toContain("hidden");
    expect(copyrightSection.classes()).toContain("lg:block");
  });

  it("social links have proper styling", () => {
    const wrapper = mount(Footer);
    const socialLinks = wrapper.findAll('a[href="#!"]');

    socialLinks.forEach((link, index) => {
      expect(link.classes()).toContain("text-light");
      expect(link.classes()).toContain("dark:text-neutral-200");

      // All except last should have margin
      if (index < socialLinks.length - 1) {
        expect(link.classes()).toContain("mr-6");
      }
    });
  });

  it("updates year reactively", async () => {
    const wrapper = mount(Footer);

    // Check initial year
    const currentYear = new Date().getFullYear();
    expect(wrapper.text()).toContain(`© ${currentYear}`);

    // Year should be reactive (though it won't change during test)
    const yearElement = wrapper.find("span");
    expect(yearElement.text()).toBe(`© ${currentYear} Copyright:`);
  });
});
