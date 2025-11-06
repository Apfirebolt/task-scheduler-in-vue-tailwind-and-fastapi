import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import Header from "../components/Header.vue";

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/scheduler", component: { template: "<div>Scheduler</div>" } },
    { path: "/add", component: { template: "<div>Add Task</div>" } },
    { path: "/tasks", component: { template: "<div>Tasks</div>" } },
    { path: "/task-table", component: { template: "<div>Task Table</div>" } },
  ],
});

describe("Header Component", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Header, {
      global: {
        plugins: [router],
      },
    });
  });

  it("renders the header with correct title", () => {
    expect(wrapper.find("h1").text()).toBe("Task Scheduler");
  });

  it("shows mobile menu button on mobile devices", () => {
    const mobileButton = wrapper.find(".md\\:hidden button");
    expect(mobileButton.exists()).toBe(true);
  });

  it("toggles sidebar when mobile menu button is clicked", async () => {
    const mobileButton = wrapper.find(".md\\:hidden button");

    // Initially sidebar should be hidden
    expect(wrapper.find("#default-sidebar").exists()).toBe(false);

    // Click mobile menu button
    await mobileButton.trigger("click");

    // Sidebar should now be visible
    expect(wrapper.find("#default-sidebar").exists()).toBe(true);

    // Click again to hide
    await mobileButton.trigger("click");
    expect(wrapper.find("#default-sidebar").exists()).toBe(false);
  });

  it("renders all desktop navigation links", () => {
    const navLinks = wrapper.findAll("nav.hidden router-link");
    expect(navLinks).toHaveLength(3);

    const linkTexts = navLinks.map((link) => link.text());
    expect(linkTexts).toContain("Home");
    expect(linkTexts).toContain("Scheduler");
    expect(linkTexts).toContain("Add Task");
  });

  it("renders all sidebar navigation links", async () => {
    // Open sidebar first
    await wrapper.find(".md\\:hidden button").trigger("click");

    const sidebarLinks = wrapper.findAll("#default-sidebar router-link");
    expect(sidebarLinks).toHaveLength(4);

    const linkTexts = sidebarLinks.map((link) => link.text());
    expect(linkTexts).toContain("Dashboard");
    expect(linkTexts).toContain("Scheduler");
    expect(linkTexts).toContain("Add Task");
    expect(linkTexts).toContain("Tasks");
  });

  it('shows mega menu on hover over "More" button', async () => {
    const moreButton = wrapper.find('button:contains("More")');

    // Initially mega menu should be hidden
    expect(wrapper.find('[data-testid="mega-menu"]').exists()).toBe(false);

    // Hover over More button
    await moreButton.trigger("mouseenter");

    // Mega menu should be visible
    expect(wrapper.vm.showMegaMenu).toBe(true);
  });

  it("hides mega menu on mouse leave", async () => {
    const moreButtonContainer = wrapper.find(".relative");

    // Show menu first
    await moreButtonContainer.trigger("mouseenter");
    expect(wrapper.vm.showMegaMenu).toBe(true);

    // Hide menu on mouse leave
    await moreButtonContainer.trigger("mouseleave");
    expect(wrapper.vm.showMegaMenu).toBe(false);
  });

  it("renders mega menu items correctly", async () => {
    const moreButtonContainer = wrapper.find(".relative");
    await moreButtonContainer.trigger("mouseenter");

    const megaMenuItems = wrapper.findAll(
      ".relative.grid router-link, .relative.grid a"
    );
    expect(megaMenuItems.length).toBeGreaterThan(0);

    // Check for specific menu items
    const menuText = wrapper.text();
    expect(menuText).toContain("Tasks");
    expect(menuText).toContain("Task Table");
    expect(menuText).toContain("Analytics");
    expect(menuText).toContain("Settings");
  });

  it("applies correct CSS classes for responsive design", () => {
    // Check desktop navigation is hidden on mobile
    const desktopNav = wrapper.find("nav");
    expect(desktopNav.classes()).toContain("hidden");
    expect(desktopNav.classes()).toContain("md:flex");

    // Check mobile button is hidden on desktop
    const mobileButton = wrapper.find(".md\\:hidden");
    expect(mobileButton.classes()).toContain("md:hidden");
  });

  it("has proper accessibility attributes", async () => {
    // Open sidebar to check accessibility
    await wrapper.find(".md\\:hidden button").trigger("click");

    const sidebar = wrapper.find("#default-sidebar");
    expect(sidebar.attributes("aria-label")).toBe("Sidebar");

    // Check SVG elements have aria-hidden
    const svgElements = wrapper.findAll("svg[aria-hidden]");
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it("maintains component state correctly", async () => {
    // Test initial state
    expect(wrapper.vm.showSidebar).toBe(false);
    expect(wrapper.vm.showMegaMenu).toBe(false);

    // Test sidebar toggle
    wrapper.vm.toggleSidebar();
    expect(wrapper.vm.showSidebar).toBe(true);

    // Test mega menu show/hide
    wrapper.vm.showMenu();
    expect(wrapper.vm.showMegaMenu).toBe(true);

    wrapper.vm.hideMenu();
    expect(wrapper.vm.showMegaMenu).toBe(false);
  });

  it("has correct router-link destinations", () => {
    const routerLinks = wrapper.findAll("router-link");
    const expectedRoutes = ["/", "/scheduler", "/add", "/tasks", "/task-table"];

    routerLinks.forEach((link) => {
      const to = link.props("to");
      if (to) {
        expect(expectedRoutes).toContain(to);
      }
    });
  });
});
