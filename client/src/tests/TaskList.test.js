import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";
import TaskList from "../pages/TaskList.vue";
import Loader from "../components/Loader.vue";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Mock AOS
vi.mock("aos", () => ({
  default: {
    init: vi.fn(),
  },
}));

// Create mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    {
      path: "/task/:id",
      name: "UpdateTask",
      component: { template: "<div>Task Detail</div>" },
    },
  ],
});

describe("TaskList.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loader when isLoading is true", async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    expect(wrapper.findComponent(Loader).exists()).toBe(true);
  });

  it("fetches and displays tasks successfully", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Task 1",
        description: "Description 1",
        dueDate: "2023-12-01",
      },
      {
        id: 2,
        title: "Task 2",
        description: "Description 2",
        dueDate: "2023-12-02",
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockTasks });

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Task 1");
    expect(wrapper.text()).toContain("Task 2");
    expect(wrapper.text()).toContain("Description 1");
    expect(wrapper.text()).toContain("Due on 2023-12-01");
  });

  it("displays error message when API call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("API Error"));

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Some error occurred");
  });

  it("navigates to task detail when task is clicked", async () => {
    const mockTasks = [
      {
        id: 1,
        title: "Task 1",
        description: "Description 1",
        dueDate: "2023-12-01",
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockTasks });
    const pushSpy = vi.spyOn(router, "push");

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const taskElement =
      wrapper.find('[data-testid="task-item"]') ||
      wrapper.find(".hover\\:cursor-pointer");
    await taskElement.trigger("click");

    expect(pushSpy).toHaveBeenCalledWith({
      name: "UpdateTask",
      params: { id: 1 },
    });
  });

  it("renders TASKS heading", () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    expect(wrapper.text()).toContain("TASKS");
  });

  it("handles empty tasks array", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.findAll(".hover\\:cursor-pointer")).toHaveLength(0);
  });

  it("makes API call to correct endpoint", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/tasks");
  });

  it("clears error message when API call succeeds", async () => {
    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
        components: { Loader },
      },
    });

    // First, simulate an error
    mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));
    await wrapper.vm.getApiData();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.errorMessage).toBe("Some error occurred");

    // Then simulate success
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await wrapper.vm.getApiData();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.errorMessage).toBe("");
  });
});
