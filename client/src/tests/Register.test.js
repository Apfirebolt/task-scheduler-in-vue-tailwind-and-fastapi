import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";
import Register from "../pages/Register.vue";

// Mock dependencies
vi.mock("axios");
vi.mock("aos", () => ({
  default: {
    init: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

// Create a mock router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: { template: "<div>Login</div>" },
    },
    { path: "/register", name: "Register", component: Register },
  ],
});

describe("Register.vue", () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(Register, {
      global: {
        plugins: [mockRouter],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe("Component Rendering", () => {
    it("renders the registration form correctly", () => {
      expect(wrapper.find("h2").text()).toBe("Create Account");
      expect(wrapper.find("form").exists()).toBe(true);
      expect(wrapper.find('input[type="text"]').exists()).toBe(true);
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
      expect(wrapper.find('input[type="password"]').length).toBe(2);
    });

    it("renders all form fields with correct labels", () => {
      const labels = wrapper.findAll("label");
      expect(labels[0].text()).toBe("Full Name");
      expect(labels[1].text()).toBe("Email Address");
      expect(labels[2].text()).toBe("Password");
      expect(labels[3].text()).toBe("Confirm Password");
    });

    it("renders submit button with correct text", () => {
      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.text()).toBe("Create Account");
    });

    it("renders sign in link", () => {
      const signInLink = wrapper.find("router-link");
      expect(signInLink.attributes("to")).toBe("/login");
      expect(signInLink.text()).toContain("Already have an account?");
    });
  });

  describe("Form Input Handling", () => {
    it("updates registerData when inputs change", async () => {
      const nameInput = wrapper.find("#name");
      const emailInput = wrapper.find("#email");
      const passwordInput = wrapper.find("#password");
      const confirmPasswordInput = wrapper.find("#confirmPassword");

      await nameInput.setValue("John Doe");
      await emailInput.setValue("john@example.com");
      await passwordInput.setValue("password123");
      await confirmPasswordInput.setValue("password123");

      expect(wrapper.vm.registerData.name).toBe("John Doe");
      expect(wrapper.vm.registerData.email).toBe("john@example.com");
      expect(wrapper.vm.registerData.password).toBe("password123");
      expect(wrapper.vm.registerData.confirmPassword).toBe("password123");
    });

    it("requires all fields to be filled", () => {
      const inputs = wrapper.findAll("input");
      inputs.forEach((input) => {
        expect(input.attributes("required")).toBeDefined();
      });
    });
  });

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility when eye icon is clicked", async () => {
      const passwordInput = wrapper.find("#password");
      const toggleButton = wrapper.find("#password").parent().find("button");

      expect(passwordInput.attributes("type")).toBe("password");
      expect(wrapper.vm.showPassword).toBe(false);

      await toggleButton.trigger("click");

      expect(passwordInput.attributes("type")).toBe("text");
      expect(wrapper.vm.showPassword).toBe(true);
    });

    it("toggles confirm password visibility when eye icon is clicked", async () => {
      const confirmPasswordInput = wrapper.find("#confirmPassword");
      const toggleButton = wrapper
        .find("#confirmPassword")
        .parent()
        .find("button");

      expect(confirmPasswordInput.attributes("type")).toBe("password");
      expect(wrapper.vm.showConfirmPassword).toBe(false);

      await toggleButton.trigger("click");

      expect(confirmPasswordInput.attributes("type")).toBe("text");
      expect(wrapper.vm.showConfirmPassword).toBe(true);
    });
  });

  describe("Form Validation", () => {
    it("shows error when passwords do not match", async () => {
      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password456");

      await wrapper.find("form").trigger("submit.prevent");

      expect(wrapper.vm.errorMessage).toBe("Passwords do not match.");
    });

    it("does not submit when passwords do not match", async () => {
      const spy = vi.spyOn(mockedAxios, "post");

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password456");

      await wrapper.find("form").trigger("submit.prevent");

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("API Integration", () => {
    it("submits form data successfully", async () => {
      const mockResponse = { data: { message: "Success" } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8000/auth/register",
        {
          name: "John Doe",
          email: "john@example.com",
          password: "password123",
        }
      );
    });

    it("shows success message on successful registration", async () => {
      const mockResponse = { data: { message: "Success" } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.successMessage).toBe(
        "Registration successful! Please sign in."
      );
    });

    it("handles API error response", async () => {
      const mockError = {
        response: {
          data: {
            detail: "Email already exists",
          },
        },
      };
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errorMessage).toBe("Email already exists");
    });

    it("handles network error with fallback message", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errorMessage).toBe(
        "Registration failed. Please try again."
      );
    });
  });

  describe("Loading States", () => {
    it("shows loading state during form submission", async () => {
      mockedAxios.post.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      const submitButton = wrapper.find('button[type="submit"]');
      await wrapper.find("form").trigger("submit.prevent");

      expect(wrapper.vm.isLoading).toBe(true);
      expect(submitButton.attributes("disabled")).toBeDefined();
      expect(submitButton.text()).toContain("Creating Account...");
    });

    it("disables submit button during loading", async () => {
      wrapper.vm.isLoading = true;
      await wrapper.vm.$nextTick();

      const submitButton = wrapper.find('button[type="submit"]');
      expect(submitButton.attributes("disabled")).toBeDefined();
      expect(submitButton.classes()).toContain("disabled:cursor-not-allowed");
    });
  });

  describe("Toast Messages", () => {
    it("displays success toast when successMessage is set", async () => {
      wrapper.vm.successMessage = "Registration successful!";
      await wrapper.vm.$nextTick();

      const successToast = wrapper.find(".bg-emerald-500");
      expect(successToast.exists()).toBe(true);
      expect(successToast.text()).toContain("Registration successful!");
    });

    it("displays error toast when errorMessage is set", async () => {
      wrapper.vm.errorMessage = "Registration failed";
      await wrapper.vm.$nextTick();

      const errorToast = wrapper.find(".bg-red-500");
      expect(errorToast.exists()).toBe(true);
      expect(errorToast.text()).toContain("Registration failed");
    });

    it("hides success message after timeout", async () => {
      vi.useFakeTimers();
      wrapper.vm.successMessage = "Success!";
      wrapper.vm.resetSuccessMessage();

      vi.advanceTimersByTime(5000);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.successMessage).toBe("");
      vi.useRealTimers();
    });

    it("hides error message after timeout", async () => {
      vi.useFakeTimers();
      wrapper.vm.errorMessage = "Error!";
      wrapper.vm.resetErrorMessage();

      vi.advanceTimersByTime(3000);
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errorMessage).toBe("");
      vi.useRealTimers();
    });
  });

  describe("Navigation", () => {
    it("navigates to login page after successful registration", async () => {
      vi.useFakeTimers();
      const pushSpy = vi.spyOn(mockRouter, "push");
      const mockResponse = { data: { message: "Success" } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await wrapper.find("#name").setValue("John Doe");
      await wrapper.find("#email").setValue("john@example.com");
      await wrapper.find("#password").setValue("password123");
      await wrapper.find("#confirmPassword").setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      vi.advanceTimersByTime(2000);

      expect(pushSpy).toHaveBeenCalledWith({ name: "Login" });
      vi.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("has proper label associations", () => {
      const nameInput = wrapper.find("#name");
      const nameLabel = wrapper.find('label[for="name"]');
      expect(nameLabel.exists()).toBe(true);
      expect(nameInput.attributes("id")).toBe("name");

      const emailInput = wrapper.find("#email");
      const emailLabel = wrapper.find('label[for="email"]');
      expect(emailLabel.exists()).toBe(true);
      expect(emailInput.attributes("id")).toBe("email");
    });

    it("has proper input types", () => {
      expect(wrapper.find("#name").attributes("type")).toBe("text");
      expect(wrapper.find("#email").attributes("type")).toBe("email");
      expect(wrapper.find("#password").attributes("type")).toBe("password");
      expect(wrapper.find("#confirmPassword").attributes("type")).toBe(
        "password"
      );
    });
  });
});
